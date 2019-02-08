<?php
declare(strict_types = 1);
namespace TYPO3\CMS\Core;

use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Psr\Log\LoggerAwareInterface;
use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;
use TYPO3\CMS\Core\Utility\GeneralUtility;

return function (ContainerConfigurator $configurator, ContainerBuilder $containerBuilder) {
    $containerBuilder->registerForAutoconfiguration(SingletonInterface::class)->addTag('typo3.singleton');
    $containerBuilder->registerForAutoconfiguration(LoggerAwareInterface::class)->addTag('psr.logger_aware');

    // Services, to be read from container-aware dispatchers (on demand), therefore marked 'public'
    $containerBuilder->registerForAutoconfiguration(MiddlewareInterface::class)->addTag('public');
    $containerBuilder->registerForAutoconfiguration(RequestHandlerInterface::class)->addTag('public');

    // FAL registries
    $containerBuilder->registerForAutoconfiguration(Resource\Driver\DriverInterface::class)->addTag('fal.driver');
    $containerBuilder->registerForAutoconfiguration(Resource\Rendering\FileRendererInterface::class)->addTag('fal.file_renderer');
    $containerBuilder->registerForAutoconfiguration(Resource\Index\ExtractorInterfaceExtractorInterface::class)->addTag('fal.extractor');
    $containerBuilder->registerForAutoconfiguration(Resource\TextExtraction\TextExtractorInterface::class)->addTag('fal.text_extractor');

    // MetaTag registry
    $containerBuilder->registerForAutoconfiguration(MetaTag\MetatagManagerInterface::class)->addTag('metatag.manager');

    $containerBuilder->addCompilerPass(new DependencyInjection\SingletonPass('typo3.singleton'));
    $containerBuilder->addCompilerPass(new DependencyInjection\LoggerAwarePass('psr.logger_aware'));
    $containerBuilder->addCompilerPass(new DependencyInjection\AutowireInjectMethodsPass());
    $containerBuilder->addCompilerPass(new DependencyInjection\ControllerWithPsr7ActionMethodsPass);
    $containerBuilder->addCompilerPass(new DependencyInjection\ResolveGlobalVarsParameterPass);

    $containerBuilder->addCompilerPass(new class implements CompilerPassInterface {
        public function process(ContainerBuilder $container)
        {
            foreach ($container->findTaggedServiceIds('public') as $id => $tags) {
                $container->findDefinition($id)->setPublic(true);
            }
            foreach ($container->findTaggedServiceIds('prototype') as $id => $tags) {
                $container->findDefinition($id)->setShared(false);
            }

            // FAL registries
            $driverRegistry = $container->findDefinition(Resource\Driver\DriverRegistry::class);
            foreach ($container->findTaggedServiceIds('fal.driver') as $id => $tags) {
                $attributes = array_shift($tags);
                $container->findDefinition($id)->setPublic(true);
                $driverRegistry->addMethodCall('registerDriverClass', [$id, $attributes['shortName'] ?? '', $attributes['label'] ?? null, $attributes['flexFormDS'] ?? null]);
            }
            $rendererRegistry = $container->findDefinition(Resource\Rendering\RendererRegistry::class);
            foreach ($container->findTaggedServiceIds('fal.file_renderer') as $id => $tags) {
                $container->findDefinition($id)->setPublic(true);
                $rendererRegistry->addMethodCall('registerRendererClass', [$id]);
            }
            $extractorRegistry = $container->findDefinition(Resource\Index\ExtractorRegistry::class);
            foreach ($container->findTaggedServiceIds('fal.extractor') as $id => $tags) {
                $container->findDefinition($id)->setPublic(true);
                $extractorRegistry->addMethodCall('registerExtractionService', [$id]);
            }
            $textExtractorRegistry = $container->findDefinition(Resource\TextExtraction\TextExtractorRegistry::class);
            foreach ($container->findTaggedServiceIds('fal.text_extractor') as $id => $tags) {
                $container->findDefinition($id)->setPublic(true);
                $textExtractorRegistry->addMethodCall('registerTextExtractor', [$id]);
            }

            // MetaTag registry
            $metaTagManagerRegistry = $container->findDefinition(MetaTag\MetaTagManagerRegistry::class);
            foreach ($container->findTaggedServiceIds('metatag.manager') as $id => $tags) {
                $container->findDefinition($id)->setPublic(true);
                // Use "last" configured settings, allowing Services.yaml to overwrite our
                // autoconfiguration
                $attributes = array_shift($tags);

                // Support full autoconfiguration, all attributes are optional.
                // The name falls back to the dotted-style class name if not configured
                $name = $attributes['identifier'] ?? str_replace('\\', '.', $id);
                $before = GeneralUtility::trimExplode(',', $attributes['before'] ?? 'generic', true);
                $after = GeneralUtility::trimExplode(',', $attributes['after'] ?? '', true);

                $metaTagManagerRegistry->addMethodCall('registerManager', [$name, $id, $before, $after]);
            }
        }
    });

    /* ContainerConfigurator based configuration */
    $configurator = $configurator->services()->defaults()
        ->private()
        ->autoconfigure()
        ->autowire();

    $configurator
        ->load(__NAMESPACE__ . '\\', '../Classes/*');

    $configurator->set(Configuration\SiteConfiguration::class)
        // TODO: this will create an absolute path
        // in the DI cache.
        // May need to be moved into a service provider.
        ->arg('$configPath', '%path.config%/sites');

    $configurator->set(Package\PackageManager::class)
        ->autoconfigure(false);

    $configurator->set(Package\FailsafePackageManager::class)
        ->autoconfigure(false);

    $configurator->set(Package\UnitTestPackageManager::class)
        ->autoconfigure(false);

    $configurator->set(Http\MiddlewareDispatcher::class)
        ->autoconfigure(false);

    $configurator->set(Database\Schema\SqlReader::class)
        ->public();
};
