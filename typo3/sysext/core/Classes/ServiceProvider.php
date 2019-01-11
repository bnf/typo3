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

/**
 * @internal
 */
class ServiceProvider extends AbstractServiceProvider
{
    const PATH = __DIR__ . '/../';

    public function getFactories(): array
    {
        return [
            Cache\CacheManager::class => [ static::class, 'getCacheManager' ],
            Console\CommandApplication::class => [ static::class, 'getConsoleCommandApplication' ],
            Http\MiddlewareStackResolver::class => [ static::class, 'getMiddlewareStackResolver' ],
            Service\DependencyOrderingService::class => [ static::class, 'getDependencyOrderingService' ],
            'middlewares' => [ static::class, 'getMiddlewares' ],
            'configuration' => [ static::class, 'getConfiguration' ],
            'tca' => [ static::class, 'getTca' ],
            'typo3-services' => [ static::class, 'getTypo3Services' ],
        ];
    }

    public static function getCacheManager(ContainerInterface $container): Cache\CacheManager
    {
        $cacheConfigurations = $container->get('configuration')['SYS']['caching']['cacheConfigurations'] ?? [];
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

    public static function getConfiguration(ContainerInterface $container): array
    {
        // At some point this should be changed to a new confiuration retrieval method, replacing ext_localconf.php
        return $GLOBALS['TYPO3_CONF_VARS'];
    }

    public static function getTca(ContainerInterface $container): array
    {
        // At some point this should load TCA on demand, loadBaseTca would be removed from Bootstrap then
        return $GLOBALS['TCA'];
    }

    public static function getTypo3Services(ContainerInterface $container): array
    {
        // At some point this should be changed to a new confiuration retrieval method, replacing ext_localconf.php
        return $GLOBALS['T3_SERVICES'];
    }
}
