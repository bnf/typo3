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
    protected static function getPackagePath(): string
    {
        return __DIR__ . '/../';
    }

    public function getFactories(): array
    {
        return [
            Cache\CacheManager::class => [ static::class, 'getCacheManager' ],
            Console\CommandApplication::class => [ static::class, 'getConsoleCommandApplication' ],
            Http\MiddlewareStackResolver::class => [ static::class, 'getMiddlewareStackResolver' ],
            Service\DependencyOrderingService::class => [ static::class, 'getDependencyOrderingService' ],
            Registry::class => [ static::class, 'getRegistry' ],
            Imaging\IconRegistry::class => [ static::class, 'getIconRegistry' ],
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
            Service\FlexFormService::class => [ static::class, 'getFlexFormService' ],
            'middlewares' => [ static::class, 'getMiddlewares' ],
        ];
    }

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

    public static function getConsoleCommandApplication(ContainerInterface $container): Console\CommandApplication
    {
        return new Console\CommandApplication;
    }

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

    public static function getFlexFormService(ContainerInterface $container): Service\FlexFormService
    {
        return self::new($container, Service\FlexFormService::class);
    }

    public static function getMiddlewareStackResolver(ContainerInterface $container): Http\MiddlewareStackResolver
    {
        return new Http\MiddlewareStackResolver(
            $container,
            $container->get(Service\DependencyOrderingService::class),
            $container->get('cache.core')
        );
    }

    public static function getMiddlewares(ContainerInterface $container): array
    {
        return [];
    }
}
