<?php
declare(strict_types = 1);
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Psr\Log\LoggerAwareInterface;
use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use TYPO3\CMS\Core\DependencyInjection\AutowireInjectMethodsPass;
use TYPO3\CMS\Core\DependencyInjection\ControllerWithPsr7ActionMethodsPass;
use TYPO3\CMS\Core\DependencyInjection\LoggerAwarePass;
use TYPO3\CMS\Core\DependencyInjection\SingletonPass;
use TYPO3\CMS\Core\MetaTag\MetaTagManagerRegistry;
use TYPO3\CMS\Core\MetaTag\MetaTagManagerInterface;
use TYPO3\CMS\Core\Resource\Index\ExtractorInterface;
use TYPO3\CMS\Core\Resource\Index\ExtractorRegistry;
use TYPO3\CMS\Core\Resource\Rendering\FileRendererInterface;
use TYPO3\CMS\Core\Resource\Rendering\RendererRegistry;
use TYPO3\CMS\Core\Resource\TextExtraction\TextExtractorInterface;
use TYPO3\CMS\Core\Resource\TextExtraction\TextExtractorRegistry;
use TYPO3\CMS\Core\SingletonInterface;
use TYPO3\CMS\Core\Utility\GeneralUtility;

(function (ContainerBuilder $containerBuilder) {
    $containerBuilder->registerForAutoconfiguration(SingletonInterface::class)->addTag('typo3.singleton');
    $containerBuilder->registerForAutoconfiguration(LoggerAwareInterface::class)->addTag('psr.logger_aware');

    // Services, to be read from container-aware dispatchers (on demand), therefore marked 'public'
    $containerBuilder->registerForAutoconfiguration(MiddlewareInterface::class)->addTag('public');
    $containerBuilder->registerForAutoconfiguration(RequestHandlerInterface::class)->addTag('public');

    // FAL registries
    $containerBuilder->registerForAutoconfiguration(FileRendererInterface::class)->addTag('fal.file_renderer');
    $containerBuilder->registerForAutoconfiguration(ExtractorInterface::class)->addTag('fal.extractor');
    $containerBuilder->registerForAutoconfiguration(TextExtractorInterface::class)->addTag('fal.text_extractor');

    // MetaTag registry
    $containerBuilder->registerForAutoconfiguration(MetatagManagerInterface::class)->addTag('metatag.manager');

    $containerBuilder->addCompilerPass(new SingletonPass('typo3.singleton'));
    $containerBuilder->addCompilerPass(new LoggerAwarePass('psr.logger_aware'));
    $containerBuilder->addCompilerPass(new AutowireInjectMethodsPass());
    $containerBuilder->addCompilerPass(new ControllerWithPsr7ActionMethodsPass);

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
            $rendererRegistry = $container->findDefinition(RendererRegistry::class);
            foreach ($container->findTaggedServiceIds('fal.file_renderer') as $id => $tags) {
                $container->findDefinition($id)->setPublic(true);
                $rendererRegistry->addMethodCall('registerRendererClass', [$id]);
            }
            $extractorRegistry = $container->findDefinition(ExtractorRegistry::class);
            foreach ($container->findTaggedServiceIds('fal.extractor') as $id => $tags) {
                $container->findDefinition($id)->setPublic(true);
                $extractorRegistry->addMethodCall('registerExtractionService', [$id]);
            }
            $textExtractorRegistry = $container->findDefinition(TextExtractorRegistry::class);
            foreach ($container->findTaggedServiceIds('fal.text_extractor') as $id => $tags) {
                $container->findDefinition($id)->setPublic(true);
                $textExtractorRegistry->addMethodCall('registerTextExtractor', [$id]);
            }

            // MetaTag registry
            $metaTagManagerRegistry = $container->findDefinition(MetaTagManagerRegistry::class);
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
})($container);
