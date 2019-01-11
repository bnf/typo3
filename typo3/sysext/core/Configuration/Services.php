<?php
declare(strict_types = 1);
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Psr\Log\LoggerAwareInterface;
use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use TYPO3\CMS\Core\Core\ApplicationInterface;
use TYPO3\CMS\Core\DependencyInjection\AutowireInjectMethodsPass;
use TYPO3\CMS\Core\DependencyInjection\ControllerWithPsr7ActionMethodsPass;
use TYPO3\CMS\Core\DependencyInjection\LoggerAwareCompilerPass;
use TYPO3\CMS\Core\SingletonInterface;

(function (ContainerBuilder $containerBuilder) {
    $containerBuilder->registerForAutoconfiguration(SingletonInterface::class)->addTag('typo3.singleton');
    $containerBuilder->registerForAutoconfiguration(LoggerAwareInterface::class)->addTag('psr.logger_aware');
    // Services, to be read from container aware dispatchers, directly from the container (on demand), therefore marked 'public'
    $containerBuilder->registerForAutoconfiguration(MiddlewareInterface::class)->addTag('public');
    $containerBuilder->registerForAutoconfiguration(RequestHandlerInterface::class)->addTag('public');
    $containerBuilder->registerForAutoconfiguration(ApplicationInterface::class)->addTag('public');

    $containerBuilder->addCompilerPass(new LoggerAwareCompilerPass('psr.logger_aware'));
    $containerBuilder->addCompilerPass(new AutowireInjectMethodsPass());
    $containerBuilder->addCompilerPass(new ControllerWithPsr7ActionMethodsPass);
    $containerBuilder->addCompilerPass(
        new class implements CompilerPassInterface {
            public function process(ContainerBuilder $container)
            {
                foreach ($container->findTaggedServiceIds('typo3.singleton') as $id => $tags) {
                    // Singletons need to be shared (that's symfony's configuration for singletons)
                    // They also need to be public to be usable through Extbase
                    // ObjectManager::get()
                    // @todo: Maybe setPublic(true) is not required, no that we push singletons
                    //       implicitly to the singletonInstances array in GeneralUtility.
                    //       That means they would be availbe thorugh ObjectManager::get
                    //       which resorts to GeneralUtility::makeInstance. And we can
                    //       add some more deprecations ;)
                    //       But that means the extbase object container would configure
                    //       these "again".
                    $container->findDefinition($id)->setShared(true)->setPublic(true);
                }
                foreach ($container->findTaggedServiceIds('public') as $id => $tags) {
                    $container->findDefinition($id)->setPublic(true);
                }
                foreach ($container->findTaggedServiceIds('prototype') as $id => $tags) {
                    $container->findDefinition($id)->setShared(false);
                }
            }
        }
    );
})($container);
