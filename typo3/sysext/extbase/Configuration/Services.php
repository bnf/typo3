<?php
declare(strict_types = 1);
use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;
use TYPO3\CMS\Extbase\Mvc\Controller\AbstractController;
use TYPO3\CMS\Extbase\Mvc\Controller\ControllerInterface;
use TYPO3\CMS\Extbase\Mvc\RequestHandlerInterface;
use TYPO3\CMS\Extbase\Mvc\View\ViewInterface;
use TYPO3\CMS\Extbase\Object\Container\Container as ExtbaseContainer;

return function (ContainerConfigurator $containerConfigurator, ContainerBuilder $container) {
    $container->registerForAutoconfiguration(RequestHandlerInterface::class)->addTag('extbase.request_handler');
    $container->registerForAutoconfiguration(ControllerInterface::class)->addTag('extbase.controller');
    $container->registerForAutoconfiguration(AbstractController::class)->addTag('extbase.prototype_controller');
    $container->registerForAutoconfiguration(ViewInterface::class)->addTag('extbase.view');

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

            $extbaseContainer = $container->findDefinition(ExtbaseContainer::class);
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

                $extbaseContainer->addMethodCall('registerImplementation', [$from, $to, false]);
            }
        }
    });
};
