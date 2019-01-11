<?php
declare(strict_types = 1);
namespace TYPO3\CMS\Core;

use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Psr\Log\LoggerAwareInterface;
use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;
use TYPO3\CMS\Core\DependencyInjection\AutowireInjectMethodsPass;
use TYPO3\CMS\Core\DependencyInjection\ControllerWithPsr7ActionMethodsPass;
use TYPO3\CMS\Core\DependencyInjection\LoggerAwarePass;
use TYPO3\CMS\Core\DependencyInjection\SingletonPass;
use TYPO3\CMS\Core\SingletonInterface;

return function (ContainerConfigurator $container, ContainerBuilder $containerBuilder) {
    $containerBuilder->registerForAutoconfiguration(SingletonInterface::class)->addTag('typo3.singleton');
    $containerBuilder->registerForAutoconfiguration(LoggerAwareInterface::class)->addTag('psr.logger_aware');

    // Services, to be read from container-aware dispatchers (on demand), therefore marked 'public'
    $containerBuilder->registerForAutoconfiguration(MiddlewareInterface::class)->addTag('public');
    $containerBuilder->registerForAutoconfiguration(RequestHandlerInterface::class)->addTag('public');

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
        }
    });
};
