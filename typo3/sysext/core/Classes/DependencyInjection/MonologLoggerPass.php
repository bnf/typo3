<?php

declare(strict_types=1);
namespace TYPO3\CMS\Core\DependencyInjection;

/*
 * This file is part of the TYPO3 CMS project.
 *
 * It is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License, either version 2
 * of the License, or any later version.
 *
 * For the full copyright and license information, please read the
 * LICENSE.txt file that was distributed with this source code.
 *
 * The TYPO3 project - inspiring people to share!
 */

use Monolog\Handler\HandlerInterface;
use Monolog\Logger;
use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Definition;
use Symfony\Component\DependencyInjection\Reference;

class MonologLoggerPass implements CompilerPassInterface
{
    public function process(ContainerBuilder $container)
    {
        // @todo: support priorities?
        $handlerFactories = $container->findTaggedServiceIds('monolog.handler.factory');

        $processors = $container->findTaggedServiceIds('monolog.processor');
        foreach ($processors as $id => $tags) {
            $definition = $container->getDefinition($id);
            $definition->setPublic(true);
        }

        foreach ($container->findTaggedServiceIds('monolog.logger') as $id => $tags) {
            $definition = $container->getDefinition($id);
            $definition->setClass(Logger::class);
            // @todo: maybe better define this explicitly in Services.yaml?
            $definition->setPublic(true);

            foreach ($tags as $tag) {
                foreach ($handlerFactories as $factoryId => $_) {
                    $channel = $tag['channel'] ?? '';

                    // @todo: detect if custom arguments have been defined
                    $definition->setArguments([$channel]);

                    $handlerId = 'monolog.handler.from.' . $factoryId . '.for.' . $id;
                    $handler = new Definition($handlerId);
                    $handler->setClass(HandlerInterface::class);
                    $handler->setFactory([new Reference($factoryId), 'createHandler']);
                    $handler->setArguments([$channel]);
                    $definition->addMethodCall('pushHandler', [$handler]);
                }
            }
        }
    }
}
