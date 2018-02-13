<?php
declare(strict_types = 1);
namespace TYPO3\CMS\Extensionmanager;

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
use TYPO3\CMS\Core\Core\AbstractServiceProvider;
use TYPO3\CMS\Core\Utility\GeneralUtility;

class ServiceProvider extends AbstractServiceProvider
{
    const PATH = __DIR__ . '/../';

    public function getFactories(): array
    {
        return [
            Domain\Model\DownloadQueue::class => [ static::class, 'getDownloadQueue' ],
            Service\ExtensionManagementService::class => [ static::class, 'getExtensionManagementService' ],
            Utility\DependencyUtility::class => [ static::class, 'getDependencyUtility' ],
            Utility\DownloadUtility::class => [ static::class, 'getDownloadUtility' ],
            Utility\EmConfUtility::class => [ static::class, 'getEmConfUtility' ],
            Utility\FileHandlingUtility::class => [ static::class, 'getFileHandlingUtility' ],
            Utility\InstallUtility::class => [ static::class, 'getInstallUtility' ],
            Utility\ListUtility::class => [ static::class, 'getListUtility' ],
            Utility\Repository\Helper::class => [ static::class, 'getHelper' ],
        ];
    }

    public static function getDownloadQueue(ContainerInterface $container): Domain\Model\DownloadQueue
    {
        return GeneralUtility::makeInstance(Domain\Model\DownloadQueue::class);
    }

    public static function getExtensionManagementService(ContainerInterface $container): Service\ExtensionManagementService
    {
        return GeneralUtility::makeInstance(Service\ExtensionManagementService::class);
    }

    public static function getDependencyUtility(ContainerInterface $container): Utility\DependencyUtility
    {
        return GeneralUtility::makeInstance(Utility\DependencyUtility::class);
    }

    public static function getDownloadUtility(ContainerInterface $container): Utility\DownloadUtility
    {
        return GeneralUtility::makeInstance(Utility\DownloadUtility::class);
    }

    public static function getEmConfUtility(ContainerInterface $container): Utility\EmConfUtility
    {
        return GeneralUtility::makeInstance(Utility\EmConfUtility::class);
    }

    public static function getFileHandlingUtility(ContainerInterface $container): Utility\FileHandlingUtility
    {
        return GeneralUtility::makeInstance(Utility\FileHandlingUtility::class);
    }

    public static function getInstallUtility(ContainerInterface $container): Utility\InstallUtility
    {
        return GeneralUtility::makeInstance(Utility\InstallUtility::class);
    }

    public static function getListUtility(ContainerInterface $container): Utility\ListUtility
    {
        return GeneralUtility::makeInstance(Utility\ListUtility::class);
    }

    public static function getHelper(ContainerInterface $container): Utility\Repository\Helper
    {
        return GeneralUtility::makeInstance(Utility\Repository\Helper::class);
    }
}
