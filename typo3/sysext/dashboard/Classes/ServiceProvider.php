<?php
declare(strict_types = 1);
namespace TYPO3\CMS\Dashboard;

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

use ArrayObject;
use Psr\Container\ContainerInterface;
use TYPO3\CMS\Core\Core\Environment;
use TYPO3\CMS\Core\Information\Typo3Version;
use TYPO3\CMS\Core\Package\AbstractServiceProvider;
use TYPO3\CMS\Core\Package\PackageManager;
use TYPO3\CMS\Core\Utility\GeneralUtility;

/**
 * @internal
 */
class ServiceProvider extends AbstractServiceProvider
{

    /**
     * @inheritDoc
     */
    protected static function getPackagePath(): string
    {
        return __DIR__ . '/../';
    }

    /**
     * @inheritDoc
     */
    public function getFactories(): array
    {
        return [
            'dashboard.presets' => [ static::class, 'getDashboardPresets' ],
            'dashboard.widgetGroups' => [ static::class, 'getWidgetGroups' ],
            'dashboard.widgets' => [ static::class, 'getWidgets' ],
        ];
    }

    public function getExtensions(): array
    {
        return [
            DashboardPresetRegistry::class => [ static::class, 'configureDashboardPresetRepository' ],
            WidgetGroupRegistry::class => [ static::class, 'configureWidgetGroupRepository' ],
            WidgetRegistry::class => [ static::class, 'configureWidgetRepository' ],
            'dashboard.presets' => [ static::class, 'configureDashboardPresets' ],
            'dashboard.widgetGroups' => [ static::class, 'configureWidgetGroups' ],
            'dashboard.widgets' => [ static::class, 'configureWidgets' ]
        ] + parent::getExtensions();
    }

    public static function getDashboardPresets(ContainerInterface $container): ArrayObject
    {
        return new ArrayObject();
    }

    public static function getWidgetGroups(ContainerInterface $container): ArrayObject
    {
        return new ArrayObject();
    }

    public static function getWidgets(ContainerInterface $container): ArrayObject
    {
        return new ArrayObject();
    }

    public static function configureDashboardPresetRepository(
        ContainerInterface $container,
        DashboardPresetRegistry $dashboardPresetRepository = null
    ): DashboardPresetRegistry {
        $dashboardPresetRepository = $dashboardPresetRepository ?? self::new($container, DashboardPresetRegistry::class);
        $cache = $container->get('cache.core');

        $cacheIdentifier = 'Dashboard_' . sha1((string)(new Typo3Version()) . Environment::getProjectPath() . 'DashboardPresets');
        if ($cache->has($cacheIdentifier)) {
            $dashboardPresetsFromPackages = $cache->require($cacheIdentifier);
        } else {
            $dashboardPresetsFromPackages = $container->get('dashboard.presets')->getArrayCopy();
            $cache->set($cacheIdentifier, 'return ' . var_export($dashboardPresetsFromPackages, true) . ';');
        }

        foreach ($dashboardPresetsFromPackages as $identifier => $options) {
            $preset = new DashboardPreset(
                $identifier,
                $options['title'],
                $options['description'],
                $options['iconIdentifier'],
                $options['defaultWidgets'],
                $options['showInWizard']
            );
            $dashboardPresetRepository->registerDashboardPreset($preset);
        }

        return $dashboardPresetRepository;
    }

    public static function configureWidgetGroupRepository(
        ContainerInterface $container,
        WidgetGroupRegistry $widgetGroupRepository = null
    ): WidgetGroupRegistry {
        $widgetGroupRepository = $widgetGroupRepository ?? self::new($container, WidgetGroupRegistry::class);
        $cache = $container->get('cache.core');

        $cacheIdentifier = 'Dashboard_' . sha1((string)(new Typo3Version()) . Environment::getProjectPath() . 'WidgetGroups');
        if ($cache->has($cacheIdentifier)) {
            $widgetGroupsFromPackages = $cache->require($cacheIdentifier);
        } else {
            $widgetGroupsFromPackages = $container->get('dashboard.widgetGroups')->getArrayCopy();
            $cache->set($cacheIdentifier, 'return ' . var_export($widgetGroupsFromPackages, true) . ';');
        }

        foreach ($widgetGroupsFromPackages as $identifier => $options) {
            $group = new WidgetGroup(
                $identifier,
                $options['title']
            );
            $widgetGroupRepository->registerWidgetGroup($group);
        }

        return $widgetGroupRepository;
    }

    public static function configureWidgetRepository(
        ContainerInterface $container,
        WidgetRegistry $widgetRepository = null
    ): WidgetRegistry {
        $widgetRepository = $widgetRepository ?? self::new($container, WidgetRegistry::class);
        $cache = $container->get('cache.core');

        $cacheIdentifier = 'Dashboard_' . sha1((string)(new Typo3Version()) . Environment::getProjectPath() . 'Widgets');
        if ($cache->has($cacheIdentifier)) {
            $widgetsFromPackages = $cache->require($cacheIdentifier);
        } else {
            $widgetsFromPackages = $container->get('dashboard.widgets')->getArrayCopy();
            $cache->set($cacheIdentifier, 'return ' . var_export($widgetsFromPackages, true) . ';');
        }

        foreach ($widgetsFromPackages as $identifier => $options) {
            $widgetRepository->registerWidget(
                $identifier,
                $options['class'],
                (array)$options['widgetGroups']
            );
        }

        return $widgetRepository;
    }

    /**
     * @param ContainerInterface $container
     * @param ArrayObject $presets
     * @return ArrayObject
     */
    public static function configureDashboardPresets(ContainerInterface $container, ArrayObject $presets): ArrayObject
    {
        $paths = self::getPathsOfInstalledPackages();

        foreach ($paths as $pathOfPackage) {
            $dashboardPresetsFileNameForPackage = $pathOfPackage . 'Configuration/Backend/DashboardPresets.php';
            if (file_exists($dashboardPresetsFileNameForPackage)) {
                $definedPresetsInPackage = require $dashboardPresetsFileNameForPackage;
                if (is_array($definedPresetsInPackage)) {
                    $presets->exchangeArray(array_merge($presets->getArrayCopy(), $definedPresetsInPackage));
                }
            }
        }

        return $presets;
    }

    /**
     * @param ContainerInterface $container
     * @param ArrayObject $widgetGroups
     * @param string $path supplied when invoked internally through PseudoServiceProvider
     * @return ArrayObject
     */
    public static function configureWidgetGroups(ContainerInterface $container, ArrayObject $widgetGroups, string $path = null): ArrayObject
    {
        $paths = self::getPathsOfInstalledPackages();

        foreach ($paths as $pathOfPackage) {
            $widgetGroupsFileNameForPackage = $pathOfPackage . 'Configuration/Backend/DashboardWidgetGroups.php';
            if (file_exists($widgetGroupsFileNameForPackage)) {
                $definedGroupsInPackage = require $widgetGroupsFileNameForPackage;
                if (is_array($definedGroupsInPackage)) {
                    $widgetGroups->exchangeArray(array_merge($widgetGroups->getArrayCopy(), $definedGroupsInPackage));
                }
            }
        }
        return $widgetGroups;
    }

    /**
     * @param ContainerInterface $container
     * @param ArrayObject $widgets
     * @param string $path supplied when invoked internally through PseudoServiceProvider
     * @return ArrayObject
     */
    public static function configureWidgets(ContainerInterface $container, ArrayObject $widgets, string $path = null): ArrayObject
    {
        $paths = self::getPathsOfInstalledPackages();

        foreach ($paths as $pathOfPackage) {
            $widgetsFileNameForPackage = $pathOfPackage . 'Configuration/Backend/DashboardWidgets.php';
            if (file_exists($widgetsFileNameForPackage)) {
                $definedWidgetsInPackage = require $widgetsFileNameForPackage;
                if (is_array($definedWidgetsInPackage)) {
                    $widgets->exchangeArray(array_merge($widgets->getArrayCopy(), $definedWidgetsInPackage));
                }
            }
        }
        return $widgets;
    }

    protected static function getPathsOfInstalledPackages(): array
    {
        $paths = [];
        $packageManager = GeneralUtility::makeInstance(PackageManager::class);

        foreach ($packageManager->getActivePackages() as $package) {
            $paths[] = $package->getPackagePath();
        }

        return $paths;
    }
}
