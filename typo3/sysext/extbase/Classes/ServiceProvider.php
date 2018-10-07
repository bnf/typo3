<?php
declare(strict_types = 1);
namespace TYPO3\CMS\Extbase;

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

use Psr\Container\ContainerInterface;
use TYPO3\CMS\Core\Package\AbstractServiceProvider;

/**
 * @internal
 */
class ServiceProvider extends AbstractServiceProvider
{
    const PATH = __DIR__ . '/../';

    public function getFactories(): array
    {
        return [
            Object\Container\Container::class => [ static::class, 'getObjectContainer' ],
            Object\ObjectManager::class => [ static::class, 'getObjectManager' ],
            SignalSlot\Dispatcher::class => [ static::class, 'getSignalSlotDispatcher' ],
        ];
    }

    public static function getObjectContainer(ContainerInterface $container): Object\Container\Container
    {
        return self::new($container, Object\Container\Container::class, [$container]);
    }

    public static function getObjectManager(ContainerInterface $container): Object\ObjectManager
    {
        return self::new($container, Object\ObjectManager::class, [$container, $container->get(Object\Container\Container::class)]);
    }

    public static function getSignalSlotDispatcher(ContainerInterface $container): SignalSlot\Dispatcher
    {
        $logger = $container->get(\TYPO3\CMS\Core\Log\LogManager::class)->getLogger(SignalSlot\Dispatcher::class);
        return self::new($container, SignalSlot\Dispatcher::class, [$container->get(Object\ObjectManager::class), $logger]);
    }
}
