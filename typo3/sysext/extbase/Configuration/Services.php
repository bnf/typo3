<?php
declare(strict_types = 1);
namespace TYPO3\CMS\Extbase;

use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;

return function (ContainerConfigurator $configurator, ContainerBuilder $container) {
    $container->registerForAutoconfiguration(Mvc\RequestHandlerInterface::class)->addTag('extbase.request_handler');
    $container->registerForAutoconfiguration(Mvc\Controller\ControllerInterface::class)->addTag('extbase.controller');
    $container->registerForAutoconfiguration(Mvc\Controller\AbstractController::class)->addTag('extbase.prototype_controller');
    $container->registerForAutoconfiguration(Mvc\View\ViewInterface::class)->addTag('extbase.view');

    $container->addCompilerPass(new class implements CompilerPassInterface {
        public function process(ContainerBuilder $container)
        {
            foreach ($container->findTaggedServiceIds('extbase.request_handler') as $id => $tags) {
                $container->findDefinition($id)->setPublic(true);
            }
            foreach ($container->findTaggedServiceIds('extbase.controller') as $id => $tags) {
                $container->findDefinition($id)->setPublic(true);
            }
            foreach ($container->findTaggedServiceIds('extbase.prototype_controller') as $id => $tags) {
                $container->findDefinition($id)->setShared(false);
            }
            foreach ($container->findTaggedServiceIds('extbase.view') as $id => $tags) {
                $container->findDefinition($id)->setShared(false)->setPublic(true);
            }

            // Push alias definition defined in symfony into the extbase container
            // 'aliasDefinitons' is a private property of the Symfony ContainerBuilder class
            // but as 'alias' statements an not be tagged, that is the only way to retrieve
            // these aliases to map them to the extbase container
            $reflection = new \ReflectionClass(get_class($container));
            $aliasDefinitions = $reflection->getProperty('aliasDefinitions');
            $aliasDefinitions->setAccessible(true);

            $extbaseContainer = $container->findDefinition(Object\Container\Container::class);
            // Add registerImplementation() call for aliases
            foreach ($aliasDefinitions->getValue($container) as $from => $alias) {
                if (!class_exists($from) && !interface_exists($from)) {
                    continue;
                }
                $to = (string)$alias;
                // Ignore aliases that are used to inject early instances into the container (instantiated during TYPO3 Bootstrap)
                // and aliases that refer to serivce names instead of class names
                if (substr($to, 0, 7) === '_early.' || !class_exists($to)) {
                    continue;
                }

                $extbaseContainer->addMethodCall('registerImplementation', [$from, $to]);
            }

            $dispatcherDefinition = $container->findDefinition(SignalSlot\Dispatcher::class);
            if ($dispatcherDefinition) {
                foreach ($container->findTaggedServiceIds('signal.slot') as $id => $tags) {
                    $container->findDefinition($id)->setPublic(true);
                    foreach ($tags as $attributes) {
                        $dispatcherDefinition->addMethodCall('connect', [
                            $attributes['signalClass'],
                            $attributes['signalName'],
                            $id,
                            $attributes['method'] ?? '__invoke',
                            $attributes['passSignalInformation'] ?? true,
                        ]);
                    }
                }
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

    $configurator->alias(Core\BootstrapInterface::class, Core\Bootstrap::class);
    $configurator->set(Core\Bootstrap::class)
        ->share(false)
        ->public();

    // Generic aliases, because symfony does not strip Interface suffix by default, but simply search for *one* matching class.
    // Erros if there are multiple. We need to make sure, that ObjectManager is always aliased by default, regardless of other
    // classes implementing this interface.
    $configurator->alias(Object\ObjectManagerInterface::class, Object\ObjectManager::class);

    // formerly in EXT:extbase/ext_localconf.php
    $configurator->alias(Persistence\QueryInterface::class, Persistence\Generic\Query::class);
    $configurator->alias(Persistence\QueryResultInterface::class, Persistence\Generic\QueryResult::class);
    $configurator->alias(Persistence\PersistenceManagerInterface::class, Persistence\Generic\PersistenceManager::class);
    $configurator->alias(Persistence\Generic\Storage\BackendInterface::class, Persistence\Generic\Storage\Typo3DbBackend::class);
    $configurator->alias(Persistence\Generic\QuerySettingsInterface::class, Persistence\Generic\Typo3QuerySettings::class);

    // not available in symfony DI (parametrized prototypes), configure to be null (not available) @todo verify
    //$configurator->set(Persistence\Generic\Query::class);
    //$configurator->set(Persistence\Generic\QueryResult::class);
    //$configurator->set(Persistence\Generic\Typo3QuerySettings::class);
};
