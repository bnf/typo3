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
            Console\CommandApplication::class => [ static::class, 'getConsoleCommandApplication' ],
            Imaging\IconFactory::class => [ static::class, 'getIconFactory' ],
            Imaging\IconRegistry::class => [ static::class, 'getIconRegistry' ],
            'tca.base' => [ static::class, 'initTcaBase' ],
            'tca.overrides' => [ static::class, 'initTcaOverrides' ],
            'tca.uncached' => [ static::class, 'getTcaUncached' ],
            'tca' => [ static::class, 'getTca' ],
            'configuration' => [ static::class, 'getConfiguration' ],
            'configuration.uncached' => [ Utility\ExtensionManagementUtility::class, 'loadSingleExtLocalconfFiles' ],
            'typo3-services' => [ static::class, 'getTypo3Service' ],
            'typo3-misc' => [ static::class, 'getTypo3Misc' ],
        ];
    }

    public static function getConsoleCommandApplication(ContainerInterface $container): Console\CommandApplication
    {
        // Load base TCA
        $GLOBALS['TCA'] = $container->get('tca');

        return new Console\CommandApplication;
    }

    public static function getIconFactory(ContainerInterface $container): Imaging\IconFactory
    {
        return static::new($container, Imaging\IconFactory::class, [$container->get(Imaging\IconRegistry::class)]);
    }

    public static function getIconRegistry(ContainerInterface $container): Imaging\IconRegistry
    {
        return static::new($container, Imaging\IconRegistry::class);
    }

    public static function initTcaBase(ContainerInterface $container): array
    {
        return [];
    }

    public static function initTcaOverrides(ContainerInterface $container): array
    {
        return $container->get('tca.base');
    }

    public static function getTcaUncached(ContainerInterface $container): array
    {
        return $container->get('tca.overrides');
    }

    public static function getTca(ContainerInterface $container): array
    {
        $TCA = [];

        $codeCache = $container->get(Cache\CacheManager::class)->getCache('cache_core');
        $cacheIdentifier = 'tca_base_' . sha1(TYPO3_version . PATH_site . 'tca_code' . serialize($GLOBALS['TYPO3_CONF_VARS']['EXT']['runtimeActivatedPackages']));
        $cacheData = $codeCache->requireOnce($cacheIdentifier);

        if (is_array($cacheData) && isset($cacheData['tca'])) {
            $TCA = $cacheData['tca'];

            // @todo remove; this needs to be retrieved from the container
            // problem: the cache can only be required once
            GeneralUtility::setSingletonInstance(
                \TYPO3\CMS\Core\Category\CategoryRegistry::class,
                unserialize(
                    $cacheData['categoryRegistry'],
                    ['allowed_classes' => [\TYPO3\CMS\Core\Category\CategoryRegistry::class]]
                )
            );
        } else {
            $TCA = $container->get('tca.uncached');

            $codeCache->set(
                $cacheIdentifier,
                'return '
                    . var_export(['tca' => $TCA, 'categoryRegistry' => serialize(\TYPO3\CMS\Core\Category\CategoryRegistry::getInstance())], true)
                    . ';'
            );
        }

        return $TCA;
    }

    public static function getConfiguration(ContainerInterface $container): array
    {
        $codeCache = $container->get(Cache\CacheManager::class)->getCache('cache_core');
        // todo: $codeCache = $container->get('cache.core');

        $cacheIdentifier = Utility\ExtensionManagementUtility::getExtLocalconfCacheIdentifier();
        if ($codeCache->has($cacheIdentifier)) {
            $codeCache->requireOnce($cacheIdentifier);
        } else {
            $GLOBALS['TYPO3_CONF_VARS'] = $container->get('configuration.uncached');
            $codeCache->set($cacheIdentifier, Utility\ExtensionManagementUtility::createExtLocalconfCacheEntry());
        }

        return $GLOBALS['TYPO3_CONF_VARS'];
    }

    public static function initTypo3Services(ContainerInterface $container): array
    {
        $container->get('configuration');
        return $GLOBALS['T3_SERVICES'];
    }

    public static function getTypo3Misc(ContainerInterface $container): array
    {
        $container->get('configuration');
        return $GLOBALS['TYPO3_MISC'];
    }
}
