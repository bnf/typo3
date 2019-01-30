<?php
declare(strict_types = 1);
namespace TYPO3\CMS\Scheduler;

use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;
use TYPO3\CMS\Scheduler\Controller\SchedulerModuleController;

return function (ContainerConfigurator $configurator, ContainerBuilder $container) {
    $container->addCompilerPass(new class implements CompilerPassInterface {
        public function process(ContainerBuilder $container)
        {
            $schedulerModuleControllerDefinition = $container->findDefinition(SchedulerModuleController::class);
            if ($schedulerModuleControllerDefinition) {
                foreach ($container->findTaggedServiceIds('scheduler.task') as $id => $tags) {
                    $container->findDefinition($id)->setPublic(true);
                    foreach ($tags as $attributes) {
                        $schedulerModuleControllerDefinition->addMethodCall('addTask', [
                            $id,
                            $attributes['title'],
                            $attributes['description'] ?? '',
                            $attributes['extension'] ?? '',
                            $attributes['additionalFields'] ?? null,
                        ]);
                    }
                }
            }
        }
    });

    $configurator = $configurator->services()->defaults()
        ->private()
        ->autoconfigure()
        ->autowire();

    $configurator
        ->load(__NAMESPACE__ . '\\', '../Classes/*');
};
