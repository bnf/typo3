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
use TYPO3\CMS\Core\Log\Handler\HandlerFactoryRegistry;

class MonologLoggerPass implements CompilerPassInterface
{
    public function process(ContainerBuilder $container)
    {
        $handlerFactories = [];
        foreach ($container->findTaggedServiceIds('monolog.handler.factory') as $id => $tags) {
            $definition = $container->getDefinition($id);
            $definition->setPublic(true);

            // @todo: check class instanceof HandlerFactoryInterface

            foreach ($tags as $tag) {
                $type = $tag['type'] ?? '';
                if ($type === '') {
                    throw new \InvalidArgumentException('Service tag "monolog.handler.factory" requires a type to be defined.  Missing in: ' . $id, 1630528484);
                }
                // @todo: support priorities?
                $handlerFactories[$type] = $id;
            }
        }

        $genericProcessors = [];
        $channelProcessors = [];
        $handlerProcessors = [];
        foreach ($container->findTaggedServiceIds('monolog.processor') as $id => $tags) {
            foreach ($tags as $tag) {
                $channel = $tag['channel'] ?? null;
                $handler = $tag['handler'] ?? null;

                if ($channel !== null) {
                    $channelProcessors[$channel][] = new Reference($id);
                } elseif ($handler !== null) {
                    $handlerProcessors[$handler][] = $id;
                    $container->getDefinition($id)->setPublic(true);
                } else {
                    $genericProcessors[] = new Reference($id);
                }
            }
        }

        $handlerFactoryRegistry = $container->findDefinition(HandlerFactoryRegistry::class);
        $handlerFactoryRegistry->setAutowired(false);
        $handlerFactoryRegistry->setArguments([new Reference('service_container'), $handlerFactories, $handlerProcessors]);
        //$handlerFactoryRegistry->setPublic(true);

        foreach ($container->findTaggedServiceIds('monolog.logger') as $id => $tags) {
            $definition = $container->getDefinition($id);
            $definition->setClass(Logger::class);
            $definition->setPublic(true);

            foreach ($tags as $tag) {
                foreach ($handlerFactories as $factoryId) {
                    $channel = $tag['channel'] ?? '';

                    $handlers = new Definition(\ArrayObject::class);
                    $handlers->setFactory([new Reference(HandlerFactoryRegistry::class), 'getHandlers']);
                    $handlers->setArguments([$channel]);
                    $handlers->setShared(false);

                    $processors = array_merge($genericProcessors, $channelProcessors[$channel] ?? []);
                    $definition->setArguments([$channel, $handlers, $processors]);
                }
            }
        }
    }
}
