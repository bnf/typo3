<?php
declare(strict_types = 1);
use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use TYPO3\CMS\Scheduler\Controller\SchedulerModuleController;

(function (ContainerBuilder $container) {
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
})($container);
