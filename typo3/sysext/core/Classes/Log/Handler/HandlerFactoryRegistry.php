<?php

declare(strict_types=1);
namespace TYPO3\CMS\Core\Log\Handler;

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

use Monolog\Handler\FormattableHandlerInterface;
use Monolog\Handler\ProcessableHandlerInterface;
use Psr\Container\ContainerInterface;
use Symfony\Component\DependencyInjection\ServiceLocator;

class HandlerFactoryRegistry
{
    private ContainerInterface $container;
    private ServiceLocator $handlerFactories;
    private array $handlerProcessors;

    public function __construct(
        ContainerInterface $container,
        ServiceLocator $handlerFactories,
        array $handlerProcessors
    ) {
        $this->container = $container;
        $this->handlerFactories = $handlerFactories;
        $this->handlerProcessors = $handlerProcessors;
    }

    public function getHandlers(string $channel): array
    {
        $handlers = [];

        foreach ($GLOBALS['TYPO3_CONF_VARS']['monolog']['handlers'] as $identifier => $config) {
            $config += [
                'type' => 'stream',
                'disabled' => false,
                'channels' => [],
                'excluded_channels' => [],
                'formatter' => ''
            ];

            if ($config['disabled']) {
                continue;
            }
            if (in_array($channel, $config['excluded_channels'], true)) {
                continue;
            }
            if (count($config['channels']) > 0 && !in_array($channel, $config['channels'], true)) {
                continue;
            }

            if (!$this->handlerFactories->has($config['type'])) {
                throw new \RuntimeException('No monolog handler defined for type "' . $config['type'] . '"', 1630766091);
            }

            $factory = $this->handlerFactories->get($config['type']);
            if (!$factory instanceof HandlerFactoryInterface) {
                throw new \RuntimeException('Handler factory for type "' . $config['type'] . '" needs to implement' . HandlerFactoryInterface::class, 1630766141);
            }

            $handler = $factory->createHandler($identifier, $channel, $config);

            if ($config['formatter'] && $handler instanceof FormattableHandlerInterface) {
                $handler->setFormatter($this->container->get($config['formatter']));
            }

            if ($handler instanceof ProcessableHandlerInterface) {
                foreach ($this->handlerProcessors[$identifier] ?? [] as $processor) {
                    $handler->pushProcessor($this->container->get($processor));
                }
            }

            $handlers[] = $handler;
        }

        return $handlers;
    }
}
