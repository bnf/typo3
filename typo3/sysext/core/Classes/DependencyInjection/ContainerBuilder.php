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
use Bnf\SymfonyServiceProviderCompilerPass\Registry;
use Bnf\SymfonyServiceProviderCompilerPass\ServiceProviderCompilationPass;
use Composer\Autoload\ClassLoader;
use Psr\Container\ContainerInterface;
use Symfony\Component\Config\FileLocator;
use Symfony\Component\DependencyInjection\ContainerBuilder as SymfonyContainerBuilder;
use Symfony\Component\DependencyInjection\Dumper\GraphvizDumper;
use Symfony\Component\DependencyInjection\Dumper\PhpDumper;
use Symfony\Component\DependencyInjection\Loader\PhpFileLoader;
use Symfony\Component\DependencyInjection\Loader\YamlFileLoader;
use TYPO3\CMS\Core\Cache\CacheManager;
use TYPO3\CMS\Core\Cache\Frontend\FrontendInterface;
use TYPO3\CMS\Core\Configuration\ConfigurationManager;
use TYPO3\CMS\Core\Core\ApplicationContext;
use TYPO3\CMS\Core\Core\Environment;
use TYPO3\CMS\Core\Localization\Locales;
use TYPO3\CMS\Core\Log\LogManager;
use TYPO3\CMS\Core\Package\PackageManager;

/**
 * @internal
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
     * @var string
     */
    protected $registryServiceName = 'service_provider_registry';

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
    public function warmupCache(): void
    {
        $registry = new Registry($this->getServiceProviders());
        $containerBuilder = $this->buildContainer($registry, $this->defaultServices);
        $this->dumpContainer($containerBuilder);
    }

    /**
     * @return string
     * @internal
     */
    public function plotContainer(): string
    {
        $registry = new Registry($this->getServiceProviders());
        $containerBuilder = $this->buildContainer($registry, $this->defaultServices);
        $graphvizDumper = new GraphvizDumper($containerBuilder);
        return $graphvizDumper->dump(['graph' => ['rankdir' => 'LR']]);
    }

    public function createDependencyInjectionContainer(array $defaultEntries): ContainerInterface
    {
        $container = null;

        $cacheIdentifier = $this->getCacheIdentifier();
        $containerClassName = $cacheIdentifier;

        $registry = new Registry($this->getServiceProviders(false));

        if ($this->cache->has($cacheIdentifier)) {
            $this->cache->requireOnce($cacheIdentifier);
        } else {
            $containerBuilder = $this->buildContainer($registry, array_keys($defaultEntries));
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

        $container->set($this->registryServiceName, $registry);

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
     * @internal
     */
    public function getStaticParameters(): array
    {
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
    protected function buildContainer(Registry $registry, array $defaultEntries): SymfonyContainerBuilder
    {
        $containerBuilder = new SymfonyContainerBuilder();
        $containerBuilder->getParameterBag()->add($this->getStaticParameters());

        $containerBuilder->addCompilerPass(new ServiceProviderCompilationPass($registry, $this->registryServiceName));

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
     * @internal
     */
    public function getServiceProviders(bool $failsafe = false, bool $lazy = null): array
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
