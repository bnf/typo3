<?php
declare(strict_types = 1);
use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;

(function (ContainerBuilder $containerBuilder) {
    $containerBuilder->addCompilerPass(new class implements CompilerPassInterface {
        public function process(ContainerBuilder $container)
        {
            foreach ($container->findTaggedServiceIds('backend.module_controller') as $id => $tags) {
                $container->findDefinition($id)->setPublic(true);
            }
        }
    });
})($container);
