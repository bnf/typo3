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
    /**
     * @return string
     */
    protected static function getPackagePath(): string
    {
        return __DIR__ . '/../';
    }

    /**
     * @return array
     */
    public function getFactories(): array
    {
        return [
            Cache\CacheManager::class => [ static::class, 'getCacheManager' ],
            Console\CommandApplication::class => [ static::class, 'getConsoleCommandApplication' ],
            Http\MiddlewareStackResolver::class => [ static::class, 'getMiddlewareStackResolver' ],
            Service\DependencyOrderingService::class => [ static::class, 'getDependencyOrderingService' ],
            Registry::class => [ static::class, 'getRegistry' ],
            Imaging\IconRegistry::class => [ static::class, 'getIconRegistry' ],
            Imaging\IconFactory::class => [ static::class, 'getIconFactory' ],
            Messaging\FlashMessageService::class => [ static::class, 'getFlashMessageService' ],
            Localization\LanguageStore::class => [ static::class, 'getLanguageStore' ],
            Localization\Locales::class => [ static::class, 'getLocales' ],
            Localization\LocalizationFactory::class => [ static::class, 'getLocalizationFactory' ],
            Charset\CharsetConverter::class => [ static::class, 'getCharsetConverter' ],
            Mail\TransportFactory::class => [ static::class, 'getMailTransportFactory' ],
            Resource\ProcessedFileRepository::class => [ static::class, 'getProcessedFileRepository' ],
            Resource\ResourceFactory::class => [ static::class, 'getResourceFactory' ],
            Resource\StorageRepository::class => [ static::class, 'getStorageRepository' ],
            Resource\Driver\DriverRegistry::class => [ static::class, 'getDriverRegistry' ],
            Service\FlexFormService::class => [ static::class, 'getFlexformService' ],
            'middlewares' => [ static::class, 'getMiddlewares' ],
        ];
    }

    public function getExtensions(): array
    {
        return [
            SignalSlotDispatcher::class => [ static::class, 'configureSignalSlots' ],
        ] + parent::getExtensions();
    }

    /**
     * @param ContainerInterface $container
     * @return Cache\CacheManager
     */
    public static function getCacheManager(ContainerInterface $container): Cache\CacheManager
    {
        if (!$container->get('boot.state')->done) {
            throw new \LogicException(Cache\CacheManager::class . ' can not be injected/instantiated during ext_localconf.php loading. Use lazy loading instead.', 1549446998);
        }

        $cacheConfigurations = $GLOBALS['TYPO3_CONF_VARS']['SYS']['caching']['cacheConfigurations'] ?? [];
        $disableCaching = $container->get('cache.disabled');
        $defaultCaches = [
            $container->get('cache.core'),
            $container->get('cache.assets'),
        ];

        $cacheManager = self::new($container, Cache\CacheManager::class, [$disableCaching]);
        $cacheManager->setCacheConfigurations($cacheConfigurations);
        foreach ($defaultCaches as $cache) {
            $cacheManager->registerCache($cache, $cacheConfigurations[$cache->getIdentifier()]['groups'] ?? ['all']);
        }

        return $cacheManager;
    }

    /**
     * @param ContainerInterface $container
     * @return Console\CommandApplication
     */
    public static function getConsoleCommandApplication(ContainerInterface $container): Console\CommandApplication
    {
        return new Console\CommandApplication;
    }

    /**
     * @param ContainerInterface $container
     * @return Service\DependencyOrderingService
     */
    public static function getDependencyOrderingService(ContainerInterface $container): Service\DependencyOrderingService
    {
        return new Service\DependencyOrderingService;
    }

    public static function getRegistry(ContainerInterface $container): Registry
    {
        return self::new($container, Registry::class);
    }

    public static function getIconRegistry(ContainerInterface $container): Imaging\IconRegistry
    {
        return self::new($container, Imaging\IconRegistry::class);
    }

    public static function getIconFactory(ContainerInterface $container): Imaging\IconFactory
    {
        return self::new($container, Imaging\IconFactory::class, [
            $container->get(Imaging\IconRegistry::class),
            $container->get(SignalSlotDispatcher::class),
        ]);
    }

    public static function getFlashMessageService(ContainerInterface $container): Messaging\FlashMessageService
    {
        return self::new($container, Messaging\FlashMessageService::class);
    }

    public static function getLanguageStore(ContainerInterface $container): Localization\LanguageStore
    {
        return self::new($container, Localization\LanguageStore::class);
    }

    public static function getLocales(ContainerInterface $container): Localization\Locales
    {
        return self::new($container, Localization\Locales::class);
    }

    public static function getLocalizationFactory(ContainerInterface $container): Localization\LocalizationFactory
    {
        return self::new($container, Localization\LocalizationFactory::class, [
            $container->get(Localization\LanguageStore::class),
            $container->get(Cache\CacheManager::class)
        ]);
    }

    public static function getCharsetConverter(ContainerInterface $container): Charset\CharsetConverter
    {
        return self::new($container, Charset\CharsetConverter::class);
    }

    public static function getMailTransportFactory(ContainerInterface $container): Mail\TransportFactory
    {
        return self::new($container, Mail\TransportFactory::class);
    }

    public static function getResourceFactory(ContainerInterface $container): Resource\ResourceFactory
    {
        return self::new($container, Resource\ResourceFactory::class);
    }

    public static function getProcessedFileRepository(ContainerInterface $container): Resource\ProcessedFileRepository
    {
        return self::new($container, Resource\ProcessedFileRepository::class);
    }

    public static function getStorageRepository(ContainerInterface $container): Resource\StorageRepository
    {
        return self::new($container, Resource\StorageRepository::class);
    }

    public static function getDriverRegistry(ContainerInterface $container): Resource\Driver\DriverRegistry
    {
        return self::new($container, Resource\Driver\DriverRegistry::class);
    }

    public static function getFlexformService(ContainerInterface $container): Service\FlexformService
    {
        return self::new($container, Service\FlexformService::class);
    }

    /**
     * @param ContainerInterface $container
     * @return Http\MiddlewareStackResolver
     */
    public static function getMiddlewareStackResolver(ContainerInterface $container): Http\MiddlewareStackResolver
    {
        return new Http\MiddlewareStackResolver(
            $container,
            $container->get(Service\DependencyOrderingService::class),
            $container->get('cache.core')
        );
    }

    /**
     * @param ContainerInterface $container
     * @return array
     */
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
