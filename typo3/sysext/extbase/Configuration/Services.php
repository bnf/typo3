<?php
declare(strict_types = 1);
use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;
use TYPO3\CMS\Extbase\Mvc\Controller\AbstractController;
use TYPO3\CMS\Extbase\Mvc\Controller\ControllerInterface;
use TYPO3\CMS\Extbase\Mvc\RequestHandlerInterface;

(function (ContainerBuilder $container) {
    $container->registerForAutoconfiguration(RequestHandlerInterface::class)->addTag('extbase.request_handler');
    $container->registerForAutoconfiguration(ControllerInterface::class)->addTag('extbase.controller');
    $container->registerForAutoconfiguration(AbstractController::class)->addTag('extbase.prototype_controller');

    $container->addCompilerPass(
        new class implements CompilerPassInterface {
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
            }
        }
    );
})($container);

return function (ContainerConfigurator $configurator) {
    /*
    $configurator->services()->defaults()
        ->private()
        ->autoconfigure()
        ->autowire();

    $configurator
        ->load('TYPO3\\CMS\\Extbase\\', '../Classes/*')
        ->exclude('../src/{Entity,Repository,Tests}');
    */
};
