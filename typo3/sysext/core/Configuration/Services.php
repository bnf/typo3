<?php
declare(strict_types = 1);
namespace TYPO3\CMS\Core;

use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Psr\Log\LoggerAwareInterface;
use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
<<<<<<< HEAD
use Symfony\Component\DependencyInjection\Compiler\PassConfig;
=======
>>>>>>> 21c47d93cf... [TASK] Auto register FAL extractor interfaces using symfony DI
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;

return function (ContainerConfigurator $configurator, ContainerBuilder $containerBuilder) {
    $containerBuilder->registerForAutoconfiguration(SingletonInterface::class)->addTag('typo3.singleton');
    $containerBuilder->registerForAutoconfiguration(LoggerAwareInterface::class)->addTag('psr.logger_aware');

    // Services, to be read from container-aware dispatchers (on demand), therefore marked 'public'
    $containerBuilder->registerForAutoconfiguration(MiddlewareInterface::class)->addTag('typo3.middleware');
    $containerBuilder->registerForAutoconfiguration(RequestHandlerInterface::class)->addTag('typo3.request_handler');

    // FAL registries
    $containerBuilder->registerForAutoconfiguration(Resource\Rendering\FileRendererInterface::class)->addTag('fal.file_renderer');
    $containerBuilder->registerForAutoconfiguration(Resource\Index\ExtractorInterfaceExtractorInterface::class)->addTag('fal.extractor');
    $containerBuilder->registerForAutoconfiguration(Resource\TextExtraction\TextExtractorInterface::class)->addTag('fal.text_extractor');

    $containerBuilder->addCompilerPass(new DependencyInjection\SingletonPass('typo3.singleton'));
    $containerBuilder->addCompilerPass(new DependencyInjection\LoggerAwarePass('psr.logger_aware'));
    $containerBuilder->addCompilerPass(new DependencyInjection\PublicServicePass('typo3.middleware'));
    $containerBuilder->addCompilerPass(new DependencyInjection\PublicServicePass('typo3.request_handler'));
    $containerBuilder->addCompilerPass(new DependencyInjection\AutowireInjectMethodsPass());
    $containerBuilder->addCompilerPass(new DependencyInjection\ControllerWithPsr7ActionMethodsPass);

    $containerBuilder->addCompilerPass(new class implements CompilerPassInterface {
        public function process(ContainerBuilder $container)
        {
            // FAL registries
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
        }
    });

    // Executed *after* all compiler passes of *all* other extensions
    $containerBuilder->addCompilerPass(new DependencyInjection\DefaultToNonSharedPass, PassConfig::TYPE_BEFORE_OPTIMIZATION, -1010);

    /* ContainerConfigurator based configuration */
    $configurator = $configurator->services()->defaults()
        ->private()
        ->autoconfigure()
        ->autowire();

    $configurator
        ->load(__NAMESPACE__ . '\\', '../Classes/*');

    $configurator->set(DependencyInjection\EnvVarProcessor::class)
        ->tag('container.env_var_processor');

    $configurator->set(DependencyInjection\GlobalsVarProcessor::class)
        ->tag('container.env_var_processor');

    $configurator->set(Configuration\SiteConfiguration::class)
        ->arg('$configPath', '%env(TYPO3:configPath)%/sites');

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
