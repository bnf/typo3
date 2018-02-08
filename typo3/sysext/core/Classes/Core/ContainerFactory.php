<?php
declare(strict_types = 1);
namespace TYPO3\CMS\Core\Core;

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

use Composer\Autoload\ClassLoader;
use Doctrine\Common\Annotations\AnnotationReader;
use Doctrine\Common\Annotations\AnnotationRegistry;
use Interop\Container\ServiceProviderInterface;
use Psr\Container\ContainerInterface;
use TYPO3\CMS\Core\Cache\CacheManager;
use TYPO3\CMS\Core\Configuration\ConfigurationManager;
use TYPO3\CMS\Core\Core\ApplicationContext;
use TYPO3\CMS\Core\Package\PackageManager;
use TYPO3\CMS\Core\Utility\ExtensionManagementUtility;
use TYPO3\CMS\Core\Utility\GeneralUtility;

class ContainerFactory
{
    /**
     * @param ClassLoader $classLoader an instance of the class loader
     * @param string $packageManagerClassName
     */
    public static function create(
        ClassLoader $classLoader,
        int $entryPointLevel = 0,
        int $requestType = 1,
        bool $allowCaching = true,
        string $packageManagerClassName = PackageManager::class
    ): ContainerInterface {

        $requestId = substr(md5(uniqid('', true)), 0, 13);

        ClassLoadingInformation::setClassLoader($classLoader);
        static::initializeAnnotations($classLoader);

        static::defineTypo3RequestTypes();
        $applicationContext = static::getApplicationContext();

        define('TYPO3_REQUESTTYPE', $requestType);
        static::baseSetup($entryPointLevel, $applicationContext);

        $configurationManager = new ConfigurationManager;

        static::populateLocalConfiguration($configurationManager);
        static::initializeErrorHandling();
        if (!$allowCaching) {
            static::disableCoreCache();
        }

        $cacheManager = static::initializeCachingFramework();
        $packageManager = static::initializePackageManagement($packageManagerClassName, $cacheManager);

        $serviceProviders = static::getServiceProviders($packageManager);

        $container = new Container(
            $serviceProviders,
            [
                'requestId' => $requestId,
                ApplicationContext::class => $applicationContext,
                ConfigurationManager::class => $configurationManager,
                ClassLoader::class => $classLoader,
                CacheManager::class => $cacheManager,
                PackageManager::class => $packageManager,
            ]
        );

        return $container;
    }

    /**
     * @return ApplicationContext
     */
    protected static function getApplicationContext(): ApplicationContext
    {
        $applicationContext = getenv('TYPO3_CONTEXT') ?: (getenv('REDIRECT_TYPO3_CONTEXT') ?: 'Production');

        return new ApplicationContext($applicationContext);
    }

    /**
     * Define TYPO3_REQUESTTYPE* constants that can be used for developers to see if any context has been hit
     * also see setRequestType(). Is done at the very beginning so these parameters are always available.
     */
    protected static function defineTypo3RequestTypes()
    {
        define('TYPO3_REQUESTTYPE_FE', 1);
        define('TYPO3_REQUESTTYPE_BE', 2);
        define('TYPO3_REQUESTTYPE_CLI', 4);
        define('TYPO3_REQUESTTYPE_AJAX', 8);
        define('TYPO3_REQUESTTYPE_INSTALL', 16);
    }

    /**
     * Sets the class loader to the bootstrap
     *
     * @param \Composer\Autoload\ClassLoader $classLoader an instance of the class loader
     */
    protected static function initializeAnnotations(ClassLoader $classLoader)
    {
        /** @see initializeAnnotationRegistry */
        AnnotationRegistry::registerLoader([$classLoader, 'loadClass']);

        /*
         * All annotations defined by and for Extbase need to be
         * ignored during their deprecation. Later, their usage may and
         * should throw an Exception
         */
        AnnotationReader::addGlobalIgnoredName('inject');
        AnnotationReader::addGlobalIgnoredName('transient');
        AnnotationReader::addGlobalIgnoredName('lazy');
        AnnotationReader::addGlobalIgnoredName('validate');
        AnnotationReader::addGlobalIgnoredName('cascade');
        AnnotationReader::addGlobalIgnoredName('ignorevalidation');
        AnnotationReader::addGlobalIgnoredName('cli');
        AnnotationReader::addGlobalIgnoredName('flushesCaches');
        AnnotationReader::addGlobalIgnoredName('uuid');
        AnnotationReader::addGlobalIgnoredName('identity');

        // Annotations used in unit tests
        AnnotationReader::addGlobalIgnoredName('test');

        // Annotations that control the extension scanner
        AnnotationReader::addGlobalIgnoredName('extensionScannerIgnoreFile');
        AnnotationReader::addGlobalIgnoredName('extensionScannerIgnoreLine');
    }

    /**
     * Run the base setup that checks server environment, determines paths,
     * populates base files and sets common configuration.
     *
     * Script execution will be aborted if something fails here.
     *
     * @param int $entryPointLevel Number of subdirectories where the entry script is located under the document root
     * @param ApplicationContext $applicationContext
     * @throws \RuntimeException when TYPO3_REQUESTTYPE was not set before, setRequestType() needs to be called before
     */
    protected static function baseSetup($entryPointLevel = 0, ApplicationContext $applicationContext)
    {
        if (!defined('TYPO3_REQUESTTYPE')) {
            throw new \RuntimeException('No Request Type was set, TYPO3 does not know in which context it is run.', 1450561838);
        }
        SystemEnvironmentBuilder::run($entryPointLevel);
        $usesComposerClassLoading = defined('TYPO3_COMPOSER_MODE') && TYPO3_COMPOSER_MODE;
        if (!$usesComposerClassLoading && ClassLoadingInformation::isClassLoadingInformationAvailable()) {
            ClassLoadingInformation::registerClassLoadingInformation();
        }
        GeneralUtility::presetApplicationContext($applicationContext);
    }

    /**
     * @return array
     */
    protected static function getServiceProviders(PackageManager $packageManager): array
    {
        $serviceProviders = [];

        $packages = $packageManager->getActivePackages();
        //\TYPO3\CMS\Extbase\Utility\DebuggerUtility::var_dump($packages);
        foreach ($packages as $package) {
            $autoload = $package->getValueFromComposerManifest('autoload');
            foreach ($autoload->{'psr-4'} ?? [] as $namespace => $directory) {
                $className = $namespace . 'ServiceProvider';
                //\TYPO3\CMS\Extbase\Utility\DebuggerUtility::var_dump($className);
                if (class_exists($className) && is_subclass_of($className, ServiceProviderInterface::class, true)) {
                    $serviceProviders[] = new $className;
                }
            }
        }

        return $serviceProviders;
    }

    /**
     * Set cache_core to null backend, effectively disabling eg. the cache for ext_localconf and PackageManager etc.
     */
    protected function disableCoreCache()
    {
        $GLOBALS['TYPO3_CONF_VARS']['SYS']['caching']['cacheConfigurations']['cache_core']['backend']
            = \TYPO3\CMS\Core\Cache\Backend\NullBackend::class;
        unset($GLOBALS['TYPO3_CONF_VARS']['SYS']['caching']['cacheConfigurations']['cache_core']['options']);
    }

    /**
     * We need an early instance of the configuration manager.
     * Since makeInstance relies on the object configuration, we create it here with new instead.
     */
    protected static function populateLocalConfiguration(ConfigurationManager $configurationManager)
    {
        $configurationManager->exportConfiguration();
    }

    /**
     * Configure and set up exception and error handling
     *
     * @throws \RuntimeException
     */
    protected static function initializeErrorHandling()
    {
        $productionExceptionHandlerClassName = $GLOBALS['TYPO3_CONF_VARS']['SYS']['productionExceptionHandler'];
        $debugExceptionHandlerClassName = $GLOBALS['TYPO3_CONF_VARS']['SYS']['debugExceptionHandler'];

        $errorHandlerClassName = $GLOBALS['TYPO3_CONF_VARS']['SYS']['errorHandler'];
        $errorHandlerErrors = $GLOBALS['TYPO3_CONF_VARS']['SYS']['errorHandlerErrors'];
        $exceptionalErrors = $GLOBALS['TYPO3_CONF_VARS']['SYS']['exceptionalErrors'];

        $displayErrorsSetting = (int)$GLOBALS['TYPO3_CONF_VARS']['SYS']['displayErrors'];
        switch ($displayErrorsSetting) {
            case -1:
                $ipMatchesDevelopmentSystem = GeneralUtility::cmpIP(GeneralUtility::getIndpEnv('REMOTE_ADDR'), $GLOBALS['TYPO3_CONF_VARS']['SYS']['devIPmask']);
                $exceptionHandlerClassName = $ipMatchesDevelopmentSystem ? $debugExceptionHandlerClassName : $productionExceptionHandlerClassName;
                $displayErrors = $ipMatchesDevelopmentSystem ? '1' : '0';
                $exceptionalErrors = $ipMatchesDevelopmentSystem ? $exceptionalErrors : 0;
                break;
            case 0:
                $exceptionHandlerClassName = $productionExceptionHandlerClassName;
                $displayErrors = '0';
                break;
            case 1:
                $exceptionHandlerClassName = $debugExceptionHandlerClassName;
                $displayErrors = '1';
                break;
            default:
                // Throw exception if an invalid option is set.
                throw new \RuntimeException(
                    'The option $TYPO3_CONF_VARS[SYS][displayErrors] is not set to "-1", "0" or "1".',
                    1476046290
                );
        }
        @ini_set('display_errors', $displayErrors);

        if (!empty($errorHandlerClassName)) {
            // Register an error handler for the given errorHandlerError
            $errorHandler = GeneralUtility::makeInstance($errorHandlerClassName, $errorHandlerErrors);
            $errorHandler->setExceptionalErrors($exceptionalErrors);
            if (is_callable([$errorHandler, 'setDebugMode'])) {
                $errorHandler->setDebugMode($displayErrors === 1);
            }
        }
        if (!empty($exceptionHandlerClassName)) {
            // Registering the exception handler is done in the constructor
            GeneralUtility::makeInstance($exceptionHandlerClassName);
        }
    }

    /**
     * Initialize caching framework, and re-initializes it (e.g. in the install tool) by recreating the instances
     * again despite the Singleton instance
     *
     * @return CacheManager
     */
    protected static function initializeCachingFramework(): CacheManager
    {
        $cacheManager = new CacheManager();
        $cacheManager->setCacheConfigurations($GLOBALS['TYPO3_CONF_VARS']['SYS']['caching']['cacheConfigurations']);
        GeneralUtility::setSingletonInstance(\TYPO3\CMS\Core\Cache\CacheManager::class, $cacheManager);

        return $cacheManager;
    }

    /**
     * Initializes the package system and loads the package configuration and settings
     * provided by the packages.
     *
     * @param string $packageManagerClassName Define an alternative package manager implementation (usually for the installer)
     * @return PackageManager
     */
    protected static function initializePackageManagement(string $packageManagerClassName, CacheManager $cacheManager): PackageManager
    {
        /** @var \TYPO3\CMS\Core\Package\PackageManager $packageManager */
        $packageManager = new $packageManagerClassName();
        ExtensionManagementUtility::setPackageManager($packageManager);
        $packageManager->injectCoreCache($cacheManager->getCache('cache_core'));
        $dependencyResolver = GeneralUtility::makeInstance(\TYPO3\CMS\Core\Package\DependencyResolver::class);
        $dependencyResolver->injectDependencyOrderingService(GeneralUtility::makeInstance(\TYPO3\CMS\Core\Service\DependencyOrderingService::class));
        $packageManager->injectDependencyResolver($dependencyResolver);
        $packageManager->initialize();
        GeneralUtility::setSingletonInstance(PackageManager::class, $packageManager);

        return $packageManager;
    }

}
