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
use TYPO3\CMS\Core\Utility\GeneralUtility;

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
        return GeneralUtility::makeInstanceForDi(Object\Container\Container::class);
    }

    public static function getObjectManager(ContainerInterface $container): Object\ObjectManager
    {
        $objectManager = GeneralUtility::makeInstanceForDi(Object\ObjectManager::class, $container->get(Object\Container\Container::class));
        $objectManager->setContainer($container);
        return $objectManager;
    }

    public static function getSignalSlotDispatcher(ContainerInterface $container): SignalSlot\Dispatcher
    {
        //return new SignalSlot\Dispatcher;
        // Have to use makeInstanceForDi for backward compatbility reasons to pick up possible
        // instantations/configurations from ext_localconf.php files
        $logger = $container->get(\TYPO3\CMS\Core\Log\LogManager::class)->getLogger(SignalSlot\Dispatcher::class);
        return GeneralUtility::makeInstanceForDi(SignalSlot\Dispatcher::class, $container->get(Object\ObjectManager::class), $logger);
    }
}
