<?php
declare(strict_types = 1);
namespace TYPO3\CMS\Core\DependencyInjection\Monolog;

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
use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Definition;
use Symfony\Component\DependencyInjection\Exception\InvalidArgumentException;
use Symfony\Component\DependencyInjection\Reference;

class HandlerFactoryPass implements CompilerPassInterface
{
    public function process(ContainerBuilder $container)
    {
        $channels = [];
        foreach ($container->findTaggedServiceIds('monolog.handler.factory') as $id => $tags) {
            foreach ($tags as $tag) {
                $channel = $tag['channel'] ?? '';
                if ($channel === '') {
                    continue;
                }

                if (!is_array($channels[$channel])) {
                    $channels[$channel] = [];
                }
                $channels[$channel][] = $id;
            }
        }

        foreach ($channels as $channel => $ids) {
            $channelId = 'monolog.logger.' . $channel;
            if (!$container->hasDefinition($channelId)) {
                continue;
            }
            $definition = $container->getDefinition($channelId);
            foreach ($ids as $id) {
                //if (!in_array(HandlerFactoryInterface::class, class_implements($container->getDefinition($channelId)->getClass()))) {
                // TODO: throw error if HandlerFactoryInterface has not been implemented?
                //}
                $handlerId = 'monolog.logger.' . $channel . '.' . $id;
                $handler = new Definition($handlerId);
                $handler->setClass(HandlerInterface::class);
                $handler->setFactory([new Reference($id), 'createHandler']);
                $handler->setArguments([$channel]);
                $definition->addMethodCall('pushHandler', [$handler]);
            }
        }
    }
}
