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
            'tca.base' => [ static::class, 'initTcaBase' ],
            'tca.overrides' => [ static::class, 'initTcaOverrides' ],
            'tca.uncached' => [ static::class, 'getTcaUncached' ],
            'tca' => [ static::class, 'getTca' ],
        ];
    }

    public static function getConsoleCommandApplication(ContainerInterface $container): Console\CommandApplication
    {
        // Load base TCA
        $GLOBALS['TCA'] = $container->get('tca');

        return new Console\CommandApplication;
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
}
