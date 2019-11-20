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
use Monolog\Handler\HandlerInterface;
use Psr\Container\ContainerInterface;

class HandlerFactoryRegistry
{
    private ContainerInterface $container;
    private array $handlerFactories;
    private array $handlerProcessors;
    private array $handlerServices;

    public function __construct(ContainerInterface $container, array $handlerFactories, array $handlerProcessors, array $handlerServices)
    {
        $this->container = $container;
        $this->handlerFactories = $handlerFactories;
        $this->handlerProcessors = $handlerProcessors;
        $this->handlerServices = $handlerServices;
    }

    public function getHandlers(string $channel): array
    {
        $handlers = [];

        foreach ($GLOBALS['TYPO3_CONF_VARS']['monolog']['handlers'] as $identifier => $config) {
            $disabled = $config['disabled'] ?? false;
            $channels = $config['channels'] ?? [];
            $excludedChannels = $config['excluded_channels'] ?? [];
            $type = $config['type'] ?? '';
            $formatter = $config['formatter'] ?? '';

            if ($config['disabled'] ?? false || $type === '') {
                continue;
            }
            if (in_array($channel, $excludedChannels, true)) {
                continue;
            }
            if (count($channels) > 0 && !in_array($channel, $channels, true)) {
                continue;
            }

            $factoryId = $this->handlerFactories[$type] ?? null;
            if ($factoryId === null) {
                continue;
            }

            /** @var HandlerFactoryInterface */
            $factory = $this->container->get($factoryId);

            $handler = $factory->createHandler($identifier, $channel, $config);

            if ($handler === null || !$handler instanceof HandlerInterface) {
                continue;
            }

            if ($formatter !== '' && $handler instanceof FormattableHandlerInterface) {
                $handler->setFormatter($this->container->get($formatter));
            }

            $handlers[] = $handler;
        }

        foreach ($this->handlerServices as $config) {
            $service = $config['service'] ?? '';
            $channels = $config['channels'] ?? [];
            $excluded_channels = $config['excluded_channels'] ?? [];

            if (in_array($channel, $excludedChannels, true)) {
                continue;
            }
            if (count($channels) > 0 && !in_array($channel, $channels, true)) {
                continue;
            }

            $handlers[] =  $this->container->get($service);
        }

        return $handlers;
    }
}
