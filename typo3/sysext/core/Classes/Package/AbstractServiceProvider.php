<?php

declare(strict_types=1);

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

namespace TYPO3\CMS\Core\Package;

use Psr\Container\ContainerInterface;
use Psr\Log\LoggerAwareInterface;
use Symfony\Component\Finder\Finder;
use TYPO3\CMS\Core\Configuration\Loader\YamlFileLoader;
use TYPO3\CMS\Core\DependencyInjection\ServiceProviderInterface;
use TYPO3\CMS\Core\Log\LogManager;
use TYPO3\CMS\Core\Profile\ProfileCollector;
use TYPO3\CMS\Core\Security\ContentSecurityPolicy\MutationCollection;
use TYPO3\CMS\Core\Security\ContentSecurityPolicy\MutationOrigin;
use TYPO3\CMS\Core\Security\ContentSecurityPolicy\MutationOriginType;
use TYPO3\CMS\Core\Security\ContentSecurityPolicy\Scope;
use TYPO3\CMS\Core\Settings\SettingsRegistry;
use TYPO3\CMS\Core\Type\Map;
use TYPO3\CMS\Core\Utility\GeneralUtility;

/**
 * @internal
 */
abstract class AbstractServiceProvider implements ServiceProviderInterface
{
    /**
     * Return the path to the package location, including trailing slash
     * should return the value of: __DIR__ . '/../'
     * for ServiceProviders located in the Classes/ directory
     */
    abstract protected static function getPackagePath(): string;

    /**
     * Return the composer package name. This is the 'name' attribute in composer.json.
     * Note composer.json existence for 'extensions' is still not mandatory
     * in non-composer mode, the method returns empty string in this case.
     */
    abstract protected static function getPackageName(): string;

    abstract public function getFactories(): array;

    public function getExtensions(): array
    {
        return [
            'middlewares' => [ static::class, 'configureMiddlewares' ],
            'backend.routes' => [ static::class, 'configureBackendRoutes' ],
            'backend.modules' => [ static::class, 'configureBackendModules' ],
            'content.security.policies' => [ static::class, 'configureContentSecurityPolicies' ],
            'icons' => [ static::class, 'configureIcons' ],
            ProfileCollector::class => [ static::class, 'configureProfileCollector' ],
            SettingsRegistry::class => [ static::class, 'configureSettingsRegistry' ],
        ];
    }

    /**
     * @param string|null $path supplied when invoked internally through PseudoServiceProvider
     */
    public static function configureMiddlewares(ContainerInterface $container, \ArrayObject $middlewares, string $path = null): \ArrayObject
    {
        $packageConfiguration = ($path ?? static::getPackagePath()) . 'Configuration/RequestMiddlewares.php';
        if (file_exists($packageConfiguration)) {
            $middlewaresInPackage = require $packageConfiguration;
            if (is_array($middlewaresInPackage)) {
                $middlewares->exchangeArray(array_replace_recursive($middlewares->getArrayCopy(), $middlewaresInPackage));
            }
        }

        return $middlewares;
    }

    /**
     * @param string|null $path supplied when invoked internally through PseudoServiceProvider
     * @param string|null $packageName supplied when invoked internally through PseudoServiceProvider
     */
    public static function configureBackendRoutes(ContainerInterface $container, \ArrayObject $routes, string $path = null, string $packageName = null): \ArrayObject
    {
        $path = $path ?? static::getPackagePath();
        $packageName = $packageName ?? static::getPackageName();
        $routesFileNameForPackage = $path . 'Configuration/Backend/Routes.php';
        if (file_exists($routesFileNameForPackage)) {
            $definedRoutesInPackage = require $routesFileNameForPackage;
            if (is_array($definedRoutesInPackage)) {
                array_walk($definedRoutesInPackage, static function (array &$options) use ($packageName, $path): void {
                    // Add packageName and absolutePackagePath to all routes
                    $options['packageName'] = $packageName;
                    $options['absolutePackagePath'] = $path;
                });
                $routes->exchangeArray(array_merge($routes->getArrayCopy(), $definedRoutesInPackage));
            }
        }
        $routesFileNameForPackage = $path . 'Configuration/Backend/AjaxRoutes.php';
        if (file_exists($routesFileNameForPackage)) {
            $definedRoutesInPackage = require $routesFileNameForPackage;
            if (is_array($definedRoutesInPackage)) {
                foreach ($definedRoutesInPackage as $routeIdentifier => $routeOptions) {
                    // prefix the route with "ajax_" as "namespace"
                    $routeOptions['path'] = '/ajax' . $routeOptions['path'];
                    $routeOptions['packageName'] = $packageName;
                    $routeOptions['absolutePackagePath'] = $path;
                    $routes['ajax_' . $routeIdentifier] = $routeOptions;
                    $routes['ajax_' . $routeIdentifier]['ajax'] = true;
                }
            }
        }

        return $routes;
    }

    /**
     * @param string|null $path supplied when invoked internally through PseudoServiceProvider
     * @param string|null $packageName supplied when invoked internally through PseudoServiceProvider
     */
    public static function configureBackendModules(ContainerInterface $container, \ArrayObject $modules, string $path = null, string $packageName = null): \ArrayObject
    {
        $path = $path ?? static::getPackagePath();
        $packageName = $packageName ?? static::getPackageName();
        $modulesFileNameForPackage = $path . 'Configuration/Backend/Modules.php';
        if (file_exists($modulesFileNameForPackage)) {
            $definedModulesInPackage = require $modulesFileNameForPackage;
            if (is_array($definedModulesInPackage)) {
                array_walk($definedModulesInPackage, static function (array &$module) use ($packageName, $path): void {
                    // Add packageName and absolutePackagePath to all modules
                    $module['packageName'] = $packageName;
                    $module['absolutePackagePath'] = $path;
                });
                $modules->exchangeArray(array_merge($modules->getArrayCopy(), $definedModulesInPackage));
            }
        }
        return $modules;
    }

    /**
     * @param Map<Scope, Map<MutationOrigin, MutationCollection>> $mutations
     * @return Map<Scope, Map<MutationOrigin, MutationCollection>>
     */
    public static function configureContentSecurityPolicies(ContainerInterface $container, Map $mutations, string $path = null, string $packageName = null): Map
    {
        $path = $path ?? static::getPackagePath();
        $packageName = $packageName ?? static::getPackageName();
        $fileName = $path . 'Configuration/ContentSecurityPolicies.php';
        if (file_exists($fileName)) {
            /** @var Map<Scope, MutationCollection> $mutationsInPackage */
            $mutationsInPackage = require $fileName;
            foreach ($mutationsInPackage as $scope => $mutation) {
                if (!isset($mutations[$scope])) {
                    $mutations[$scope] = new Map();
                }
                $origin = new MutationOrigin(MutationOriginType::package, $packageName);
                $mutations[$scope][$origin] = $mutation;
            }
        }
        return $mutations;
    }

    public static function configureIcons(ContainerInterface $container, \ArrayObject $icons, string $path = null): \ArrayObject
    {
        $path = $path ?? static::getPackagePath();
        $iconsFileNameForPackage = $path . 'Configuration/Icons.php';
        if (file_exists($iconsFileNameForPackage)) {
            $definedIconsInPackage = require $iconsFileNameForPackage;
            if (is_array($definedIconsInPackage)) {
                $icons->exchangeArray(array_merge($icons->getArrayCopy(), $definedIconsInPackage));
            }
        }
        return $icons;
    }

    public static function configureProfileCollector(ContainerInterface $container, ProfileCollector $profileRegistry, string $path = null): ProfileCollector
    {
        $path = $path ?? static::getPackagePath();
        $profilePath = $path . 'Configuration/Profiles';

        try {
            $finder = Finder::create()
                ->files()
                ->sortByName()
                ->depth(1)
                ->name('profile.yaml')
                ->in($profilePath);
        } catch (\InvalidArgumentException) {
            // No such directory in this package
            return $profileRegistry;
        }

        $yamlFileLoader = $container->get(YamlFileLoader::class);
        foreach ($finder as $fileInfo) {
            $filename = $fileInfo->getPathname();
            // No placeholders or imports processed on purpose
            // Use dependencies for shared profiles
            $profile = $yamlFileLoader->load($filename, 0, true);
            $profileRegistry->addProfile($profile, dirname($filename));
        }
        return $profileRegistry;
    }

    public static function configureSettingsRegistry(ContainerInterface $container, SettingsRegistry $settingsRegistry, string $path = null): SettingsRegistry
    {
        $path = $path ?? static::getPackagePath();
        $settingsSchema = $path . 'Configuration/Settings.schema.yaml';
        if (file_exists($settingsSchema)) {
            $yamlFileLoader = $container->get(YamlFileLoader::class);
            $definitions = $yamlFileLoader->load($settingsSchema, YamlFileLoader::PROCESS_IMPORTS, true);
            $settingsRegistry->addDefinitions($definitions);
        }
        return $settingsRegistry;
    }

    /**
     * Create an instance of a class. Supports auto injection of the logger.
     *
     * @param string $className name of the class to instantiate, must not be empty and not start with a backslash
     * @param array $constructorArguments Arguments for the constructor
     * @return mixed
     */
    protected static function new(ContainerInterface $container, string $className, array $constructorArguments = [])
    {
        // Support $GLOBALS['TYPO3_CONF_VARS']['SYS']['Objects'] (xclasses) and class alias maps
        $instance = GeneralUtility::makeInstanceForDi($className, ...$constructorArguments);

        if ($instance instanceof LoggerAwareInterface) {
            $instance->setLogger($container->get(LogManager::class)->getLogger($className));
        }
        return $instance;
    }
}
