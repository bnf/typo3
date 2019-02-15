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

return function (ContainerConfigurator $configurator, ContainerBuilder $containerBuilder) {
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

    /* ContainerConfigurator based configuration */
    $configurator = $configurator->services()->defaults()
        ->private()
        ->autoconfigure()
        ->autowire();

    $configurator
        ->load(__NAMESPACE__ . '\\', '../Classes/*');

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

    // SiteMatcher is currently incompatible with symfony DI.
    // The caches are cleared by resetting the global singleton.
    // It is therefore incompatible with a caching configurator at the moment.
    // Disable creation through symfony DI for now
    // @todo remove this once SiteMatcher has been adapted to be able to invalidate caches
    $configurator->set(Routing\SiteMatcher::class)
        ->autoconfigure(false);
};
