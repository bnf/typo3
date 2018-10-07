<?php
declare(strict_types = 1);
namespace TYPO3\CMS\Core;

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
use TYPO3\CMS\Extbase\SignalSlot\Dispatcher as SignalSlotDispatcher;

/**
 * @internal
 */
class ServiceProvider extends AbstractServiceProvider
{
    const PATH = __DIR__ . '/../';

    public function getFactories(): array
    {
        return [
            Console\CommandApplication::class => [ static::class, 'getConsoleCommandApplication' ],
            Http\MiddlewareStackResolver::class => [ static::class, 'getMiddlewareStackResolver' ],
            Service\DependencyOrderingService::class => [ static::class, 'getDependencyOrderingService' ],
            'middlewares' => [ static::class, 'getMiddlewares' ],
        ];
    }

    public function getExtensions(): array
    {
        return [
            SignalSlotDispatcher::class => [ static::class, 'configureSignalSlots' ],
        ] + parent::getExtensions();
    }

    public static function getConsoleCommandApplication(ContainerInterface $container): Console\CommandApplication
    {
        return new Console\CommandApplication;
    }

    public static function getDependencyOrderingService(ContainerInterface $container): Service\DependencyOrderingService
    {
        return new Service\DependencyOrderingService;
    }

    public static function getMiddlewareStackResolver(ContainerInterface $container): Http\MiddlewareStackResolver
    {
        return new Http\MiddlewareStackResolver(
            $container,
            $container->get(\TYPO3\CMS\Core\Service\DependencyOrderingService::class),
            $container->get(\TYPO3\CMS\Core\Cache\CacheManager::class)->getCache('cache_core')
        );
    }

    public static function getMiddlewares(ContainerInterface $container): array
    {
        return [];
    }

    public static function configureSignalSlots(ContainerInterface $container, SignalSlotDispatcher $signalSlotDispatcher): SignalSlotDispatcher
    {
        // Required in install tool
        $signalSlotDispatcher->connect(
            'TYPO3\\CMS\\Install\\Service\\SqlExpectedSchemaService',
            'tablesDefinitionIsBeingBuilt',
            \TYPO3\CMS\Core\Cache\DatabaseSchemaService::class,
            'addCachingFrameworkRequiredDatabaseSchemaForSqlExpectedSchemaService'
        );
        $signalSlotDispatcher->connect(
            'TYPO3\\CMS\\Install\\Service\\SqlExpectedSchemaService',
            'tablesDefinitionIsBeingBuilt',
            \TYPO3\CMS\Core\Category\CategoryRegistry::class,
            'addCategoryDatabaseSchemaToTablesDefinition'
        );

        // Conditional slots, may rather be made unconditional and then moved to Services.yaml files
        if (!\TYPO3\CMS\Core\Core\Environment::isComposerMode()) {
            $signalSlotDispatcher->connect(
                \TYPO3\CMS\Extensionmanager\Utility\InstallUtility::class,
                'afterExtensionInstall',
                \TYPO3\CMS\Core\Core\ClassLoadingInformation::class,
                'dumpClassLoadingInformation'
            );
            $signalSlotDispatcher->connect(
                \TYPO3\CMS\Extensionmanager\Utility\InstallUtility::class,
                'afterExtensionUninstall',
                \TYPO3\CMS\Core\Core\ClassLoadingInformation::class,
                'dumpClassLoadingInformation'
            );
        }

        return $signalSlotDispatcher;
    }
}
