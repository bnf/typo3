<?php
namespace TYPO3\CMS\Core\DependencyInjection;

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

use Bnf\Di\Container;
use Bnf\Interop\ServiceProviderBridgeBundle\InteropServiceProviderBridgeBundle;
use Composer\Autoload\ClassLoader;
use Psr\Container\ContainerInterface;
use Symfony\Component\Config\FileLocator;
use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder as SymfonyContainerBuilder;
use Symfony\Component\DependencyInjection\Dumper\GraphvizDumper;
use Symfony\Component\DependencyInjection\Dumper\PhpDumper;
use Symfony\Component\DependencyInjection\Loader\PhpFileLoader;
use Symfony\Component\DependencyInjection\Loader\YamlFileLoader;
use TYPO3\CMS\Core\Cache\CacheManager;
use TYPO3\CMS\Core\Cache\Frontend\FrontendInterface;
use TYPO3\CMS\Core\Configuration\ConfigurationManager;
use TYPO3\CMS\Core\Core\ApplicationContext;
use TYPO3\CMS\Core\Core\Bootstrap;
use TYPO3\CMS\Core\Core\Environment;
use TYPO3\CMS\Core\Localization\Locales;
use TYPO3\CMS\Core\Log\LogManager;
use TYPO3\CMS\Core\Package\PackageManager;
use TYPO3\CMS\Core\SingletonInterface;

/**
 * This class encapsulates bootstrap related methods.
 * It is required directly as the very first thing in entry scripts and
 * used to define all base things like constants and paths and so on.
 *
 * Most methods in this class have dependencies to each other. They can
 * not be called in arbitrary order. The methods are ordered top down, so
 * a method at the beginning has lower dependencies than a method further
 * down. Do not fiddle with the load order in own scripts except you know
 * exactly what you are doing!
 */
class ContainerBuilder
{
    /** @var FrontendInterface */
    protected $cache;

    /** @var PackageManager */
    protected $packageManager;

    /** @var string */
    protected $cacheIdentifier;

    /** @var array */
    protected $defaultServices = [
        'configuration',
        'tca',
        'typo3-services',
        'typo3-misc',
        'exec-time',

        'env.is_unix',
        'env.is_windows',
        'env.is_cli',
        'env.is_composer_mode',
        'env.request_id',

        ClassLoader::class,
        ApplicationContext::class,
        ConfigurationManager::class,
        LogManager::class,
        CacheManager::class,
        PackageManager::class,
        Locales::class,
        'cache.core',
    ];

    /**
     */
    public function __construct(FrontendInterface $coreCache, PackageManager $packageManager)
    {
        $this->cache = $coreCache;
        $this->packageManager = $packageManager;
    }

    /**
     * @internal
     */
    public function warmupCache()
    {
        $serviceProviderBundle = new InteropServiceProviderBridgeBundle($this->getServiceProviders());
        $containerBuilder = $this->buildContainer([$serviceProviderBundle], $this->defaultServices);
        $this->dumpContainer($containerBuilder);
    }

    /**
     * @return string
     * @internal
     */
    public function plotContainer()
    {
        $serviceProviderBundle = new InteropServiceProviderBridgeBundle($this->getServiceProviders());
        $containerBuilder = $this->buildContainer([$serviceProviderBundle], $this->defaultServices);
        $graphvizDumper = new GraphvizDumper($containerBuilder);
        return $graphvizDumper->dump(['graph' => ['rankdir' => 'LR']]);
    }

    public function createDependencyInjectionContainer(array $defaultEntries): ContainerInterface
    {
        $container = null;

        $cacheIdentifier = $this->getCacheIdentifier();
        $containerClassName = $cacheIdentifier;

        $serviceProviders = $this->getServiceProviders(false);

        $serviceProviderBundle = new InteropServiceProviderBridgeBundle($serviceProviders);

        if ($this->cache->has($cacheIdentifier)) {
            $this->cache->requireOnce($cacheIdentifier);
        } else {
            $bundles = [
                $serviceProviderBundle,
            ];
            $containerBuilder = $this->buildContainer($bundles, array_keys($defaultEntries));
            $code = $this->dumpContainer($containerBuilder);

            // In theory we could use the $containerBuilder directly as $container,
            // but as we patch the compiled source to use
            // GeneralUtility::makeInstanceInternal, we need to use the compiled container.
            // Once we remove support for singletons configured in ext_localconf.php
            // and $GLOBALS['TYPO_CONF_VARS']['SYS']['Objects'], we can remove this,
            // and use `$container = $containerBuilder` directly
            if ($this->cache->has($cacheIdentifier)) {
                $this->cache->requireOnce($cacheIdentifier);
            } else {
                // $cacheIdentifier may be unavailable if cache_core is configured to
                // use the  NullBackend
                eval($code);
            }
        }
        $fullyQualifiedContainerClassName = '\\' . $containerClassName;
        $container = new $fullyQualifiedContainerClassName();

        $serviceProviderBundle->setContainer($container);
        $serviceProviderBundle->boot();

        foreach ($defaultEntries as $id => $service) {
            $container->set('_early.' . $id, $service);
        }

        return $container;
    }

    /**
     * Helper to retrieve vendor dir
     * @todo: adapt typo3/cms-composer-installers to set a constant
     * instead of reading composer.json here
     */
    protected function getVendorDir(): string
    {
        if (!Environment::isComposerMode()) {
            return Environment::getBackendPath() . '/../vendor';
        }

        // @untested
        $manifest = json_decode(Environment::getProjectPath() . '/composer.json');
        // @untested
        if (!isset($manifest->config->{'vendor-dir'})) {
            return Environment::getProjectPath() . '/vendor';
        }

        // @untested
        return Environment::getProjectPath() . '/' . str_replace(['$HOME', '~'], getenv('HOME'), $manifest->config->{'vendor-dir'});
    }

    /**
     * @return array
     */
    protected function getStaticParameters(): array
    {
        // @todo: as vendor dir is configurable in composer mode, we need to patch
        // typo3/cms-composer-installers to set an environment variable for that
        $vendorFolder = Environment::isComposerMode() ? Environment::getProjectPath() . '/vendor' : Environment::getBackendPath() . '/../vendor';

        return [
            'path.project' => Environment::getProjectPath(),
            'path.public' => Environment::getPublicPath(),
            'path.var' => Environment::getVarPath(),
            'path.config' => Environment::getConfigPath(),
            'path.script' => Environment::getCurrentScript(),
            'path.vendor' => $this->getVendorDir(),
        ];
    }

    /**
     * @return SymfonyContainerBuilder
     */
    protected function buildContainer(array $bundles, array $defaultEntries): SymfonyContainerBuilder
    {
        $containerBuilder = new SymfonyContainerBuilder();
        $containerBuilder->getParameterBag()->add($this->getStaticParameters());

        foreach ($bundles as $bundle) {
            $bundle->build($containerBuilder);
        }

        $loggerAwareCompilerPass = new LoggerAwareCompilerPass();
        // Auto-tag classes that implement LoggerAwareInterface
        $loggerAwareCompilerPass->registerAutoconfiguration($containerBuilder);
        // Decorate classes that implement LoggerAwareInterface
        $containerBuilder->addCompilerPass($loggerAwareCompilerPass);

        $injectMethodsCompilerPass = new AutowireInjectMethodsPass();
        $containerBuilder->addCompilerPass($injectMethodsCompilerPass);

        $containerBuilder->registerForAutoconfiguration(SingletonInterface::class)->addTag('typo3.singleton');

        // Services, to be read from container aware dispatchers, directly from the container (on demand), therefore marked 'public'
        $containerBuilder->registerForAutoconfiguration(\Psr\Http\Server\MiddlewareInterface::class)->addTag('public');
        $containerBuilder->registerForAutoconfiguration(\Psr\Http\Server\RequestHandlerInterface::class)->addTag('public');
        $containerBuilder->registerForAutoconfiguration(\TYPO3\CMS\Core\Core\ApplicationInterface::class)->addTag('public');
        $containerBuilder->registerForAutoconfiguration(\TYPO3Fluid\Fluid\Core\ViewHelper\ViewHelperInterface::class)->addTag('fluid.viewhelper');

        // Autoconfigure all available backend routes to be dispatchable, which means on-demand creation (public)
        $backendRoutes = Bootstrap::readBackendRoutes($this->packageManager);
        foreach ($backendRoutes as $route) {
            list($className) = explode('::', $route['target']);
            // The class will only be registered if it actually found, that means if the extension of the route
            // doesn't contain a Services.yaml this will *not* automatically load that class. (which is good)
            $containerBuilder->registerForAutoconfiguration($className)->addTag('public')/*->addTag('backend.controller')*/;
        }

        $containerBuilder->addCompilerPass(
            new class implements CompilerPassInterface {
                public function process(SymfonyContainerBuilder $container)
                {
                    foreach ($container->findTaggedServiceIds('typo3.singleton') as $id => $tags) {
                        // Singletons need to be shared (that's symfony's configuration for singletons)
                        // They also need to be public to be usable through Extbase
                        // ObjectManager::get()
                        // @todo: Maybe setPublic(true) is not required, no that we push singletons
                        //       implicitly to the singletonInstances array in GeneralUtility.
                        //       That means they would be availbe thorugh ObjectManager::get
                        //       which resorts to GeneralUtility::makeInstance. And we can
                        //       add some more deprecations ;)
                        //       But that means the extbase object container would configure
                        //       these "again".
                        $container->findDefinition($id)->setShared(true)->setPublic(true);
                    }
                    foreach ($container->findTaggedServiceIds('public') as $id => $tags) {
                        $container->findDefinition($id)->setPublic(true);
                    }
                    foreach ($container->findTaggedServiceIds('prototype') as $id => $tags) {
                        $container->findDefinition($id)->setShared(false);
                    }
                    foreach ($container->findTaggedServiceIds('fluid.viewhelper') as $id => $tags) {
                        $container->findDefinition($id)->setPublic(true)->setShared(false);
                    }
                    foreach ($container->findTaggedServiceIds('backend.module_controller') as $id => $tags) {
                        $container->findDefinition($id)->setPublic(true);
                    }
                }
            }
        );

        $packages = $this->packageManager->getActivePackages();
        foreach ($packages as $package) {
            $diConfigDir = $package->getPackagePath() . 'Configuration/';
            if (file_exists($diConfigDir . 'Services.php')) {
                $phpFileLoader = new PhpFileLoader($containerBuilder, new FileLocator($diConfigDir));
                $phpFileLoader->load('Services.php');
            }
            if (file_exists($diConfigDir . 'Services.yaml')) {
                $yamlFileLoader = new YamlFileLoader($containerBuilder, new FileLocator($diConfigDir));
                $yamlFileLoader->load('Services.yaml');
            }
        }
        // Store defaults entries in the DIC container
        // We need to use a workaround using aliases for synthetic services
        // But that's common in symfony (same technique is used to provide the
        // symfony container interface as well.
        foreach ($defaultEntries as $id) {
            $syntheticId = '_early.' . $id;
            //$containerBuilder->set($syntheticId, $service);
            $containerBuilder->register($syntheticId)->setSynthetic(true)->setPublic(true);
            $containerBuilder->setAlias($id, $syntheticId)->setPublic(true);
        }

        $containerBuilder->compile();

        return $containerBuilder;
    }

    /**
     * @return string
     */
    protected function dumpContainer(SymfonyContainerBuilder $containerBuilder): string
    {
        $cacheIdentifier = $this->getCacheIdentifier();
        $containerClassName = $cacheIdentifier;

        $phpDumper = new PhpDumper($containerBuilder);
        $code = $phpDumper->dump(['class' => $containerClassName]);
        $code = str_replace('<?php', '', $code);
        // We need to patch the generated source code to use GeneralUtility::makeInstance
        // instead of `new`
        // @todo: find a way to replace all news with makeInstance in symfony directly
        // seems we would need to define a factory for every service for that to work, but the factory
        // can't know the class name – maybe we could fake a factory using `static function __call`?
        $code = str_replace(', )', ')', preg_replace('/new ([^\(]+)\(/', '\\TYPO3\\CMS\\Core\\Utility\\GeneralUtility::makeInstanceForDi(\\1::class, ', $code));

        $this->cache->set($cacheIdentifier, $code);

        return $code;
    }

    /**
     * Instantiate and return array of service providers for active packages
     *
     * @param PackageManager $packageManager
     * @param bool $failsafe
     * @param bool $lazy
     * @return array
     */
    protected function getServiceProviders(bool $failsafe = false, bool $lazy = null): array
    {
        $serviceProviders = [];
        $lazy = $lazy ?? !$failsafe;

        $packages = $this->packageManager->getActivePackages();
        foreach ($packages as $package) {
            if ($failsafe && $package->isPartOfMinimalUsableSystem() === false) {
                continue;
            }
            $serviceProviderClassName = $package->getServiceProvider();
            if ($lazy) {
                $serviceProviders[] = [ $serviceProviderClassName, [ $package ] ];
            } else {
                $serviceProviders[] = new $serviceProviderClassName($package);
            }
        }

        return $serviceProviders;
    }

    /**
     * @return string
     */
    protected function getCacheIdentifier(): string
    {
        return $this->cacheIdentifier ?? $this->createCacheIdentifier();
    }

    /**
     * @return string
     */
    protected function createCacheIdentifier(): string
    {
        return $this->cacheIdentifier = 'DependencyInjectionContainer_' . sha1(TYPO3_version . Environment::getProjectPath() . 'DependencyInjectionContainer');
    }
}
