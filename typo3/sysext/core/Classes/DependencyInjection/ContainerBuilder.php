<?php
declare(strict_types = 1);
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

use Psr\Container\ContainerInterface;
use Symfony\Component\Config\FileLocator;
use Symfony\Component\DependencyInjection\ContainerBuilder as SymfonyContainerBuilder;
use Symfony\Component\DependencyInjection\Dumper\GraphvizDumper;
use Symfony\Component\DependencyInjection\Dumper\PhpDumper;
use Symfony\Component\DependencyInjection\Loader\PhpFileLoader;
use TYPO3\CMS\Core\Cache\Frontend\FrontendInterface;
use TYPO3\CMS\Core\Core\Environment;
use TYPO3\CMS\Core\Package\PackageManager;
use TYPO3\CMS\Core\Utility\GeneralUtility;

/**
 * @internal
 */
class ContainerBuilder
{
    /**
     * @var string
     */
    protected $cacheIdentifier;

    /**
     * @var array
     */
    protected $defaultServices;

    /**
     * @var string
     */
    protected $serviceProviderRegistryServiceName = 'service_provider_registry';

    /**
     * @var ContainerBuider
     * @todo remove once cache warmup command can inject dependencies (this class)
     */
    protected static $instance;

    /**
     * Constructor
     */
    public function __construct(array $earlyInstances)
    {
        // We provide static parameters as services, to be usable by service providers.
        $this->defaultServices = $earlyInstances + $this->getStaticParameters() + [ self::class => $this ];
        // @todo Remove once CommandRequestHandler can inject dependencies (this class)
        self::$instance = $this;
    }

    /**
     * @return ContainerBuilder
     * @todo Remove once CommandRequestHandler can inject dependencies (this class)
     */
    public static function getInstance(): self
    {
        return self::$instance;
    }

    /**
     * @param PackageManager $packageManager
     * @param FrontendInterface $cache
     * @internal
     */
    public function warmupCache(PackageManager $packageManager, FrontendInterface $cache): void
    {
        $registry = new ServiceProviderRegistry($packageManager);
        $containerBuilder = $this->buildContainer($packageManager, $registry);
        $this->dumpContainer($containerBuilder, $cache);
    }

    /**
     * @param PackageManager $packageManager
     * @return string
     * @internal
     */
    public function plotContainer(PackageManager $packageManager): string
    {
        $registry = new ServiceProviderRegistry($packageManager);
        $containerBuilder = $this->buildContainer($packageManager, $registry);
        $graphvizDumper = new GraphvizDumper($containerBuilder);
        return $graphvizDumper->dump(['graph' => ['rankdir' => 'LR']]);
    }

    /**
     * @param PackageManager $packageManager
     * @param FrontendInterface $cache
     * @param bool $failsafe
     * @return ContainerInterface
     */
    public function createDependencyInjectionContainer(PackageManager $packageManager, FrontendInterface $cache, bool $failsafe = false): ContainerInterface
    {
        $serviceProviderRegistry = new ServiceProviderRegistry($packageManager, $failsafe);

        if ($failsafe) {
            return new FailsafeContainer($serviceProviderRegistry, $this->defaultServices);
        }

        $container = null;

        $cacheIdentifier = $this->getCacheIdentifier();
        $containerClassName = $cacheIdentifier;

        if ($cache->has($cacheIdentifier)) {
            $cache->requireOnce($cacheIdentifier);
        } else {
            $containerBuilder = $this->buildContainer($packageManager, $serviceProviderRegistry);
            $code = $this->dumpContainer($containerBuilder, $cache);

            // In theory we could use the $containerBuilder directly as $container,
            // but as we patch the compiled source to use
            // GeneralUtility::makeInstanceForDi, we need to use the compiled container.
            // Once we remove support for singletons configured in ext_localconf.php
            // and $GLOBALS['TYPO_CONF_VARS']['SYS']['Objects'], we can remove this,
            // and use `$container = $containerBuilder` directly
            if ($cache->has($cacheIdentifier)) {
                $cache->requireOnce($cacheIdentifier);
            } else {
                // $cacheIdentifier may be unavailable if cache_core is configured to
                // use the NullBackend
                eval($code);
            }
        }
        $fullyQualifiedContainerClassName = '\\' . $containerClassName;
        $container = new $fullyQualifiedContainerClassName();

        foreach ($this->defaultServices as $id => $service) {
            $container->set('_early.' . $id, $service);
        }

        $container->set($this->serviceProviderRegistryServiceName, $serviceProviderRegistry);

        return $container;
    }

    /**
     * Helper to compute path to the composer vendor directory.
     *
     * @return string
     */
    protected function getVendorDir(): string
    {
        if (!Environment::isComposerMode()) {
            return implode(DIRECTORY_SEPARATOR, [Environment::getBackendPath(), '..', 'vendor']);
        }

        $vendorPath = 'vendor';

        // @todo: adapt typo3/cms-composer-installers to set a constant
        // instead of reading composer.json and expanding paths here
        $manifest = json_decode(file_get_contents(Environment::getProjectPath() . DIRECTORY_SEPARATOR . 'composer.json'));
        if (isset($manifest->config->{'vendor-dir'})) {
            $vendorPath = rtrim(str_replace(['$HOME', '~'], getenv('HOME'), $manifest->config->{'vendor-dir'}), DIRECTORY_SEPARATOR);
            if (GeneralUtility::isAbsPath($vendorPath)) {
                return $vendorPath;
            }
        }

        return Environment::getProjectPath() . DIRECTORY_SEPARATOR . $vendorPath;
    }

    /**
     * @return array
     */
    protected function getStaticParameters(): array
    {
        return [
            'path.project' => Environment::getProjectPath(),
            'path.public' => Environment::getPublicPath(),
            'path.var' => Environment::getVarPath(),
            'path.config' => Environment::getConfigPath(),
            'path.vendor' => $this->getVendorDir(),
        ];
    }

    /**
     * @param PackageManager $packageManager
     * @param ServiceProviderRegistry $registry
     * @return SymfonyContainerBuilder
     */
    protected function buildContainer(PackageManager $packageManager, ServiceProviderRegistry $registry): SymfonyContainerBuilder
    {
        $containerBuilder = new SymfonyContainerBuilder();
        $containerBuilder->getParameterBag()->add($this->getStaticParameters());

        $containerBuilder->addCompilerPass(new ServiceProviderCompilationPass($registry, $this->serviceProviderRegistryServiceName));

        $packages = $packageManager->getActivePackages();
        foreach ($packages as $package) {
            $diConfigDir = $package->getPackagePath() . 'Configuration/';
            if (file_exists($diConfigDir . 'Services.php')) {
                $phpFileLoader = new PhpFileLoader($containerBuilder, new FileLocator($diConfigDir));
                $phpFileLoader->load('Services.php');
            }
        }
        // Store defaults entries in the DIC container
        // We need to use a workaround using aliases for synthetic services
        // But that's common in symfony (same technique is used to provide the
        // symfony container interface as well.
        foreach (array_keys($this->defaultServices) as $id) {
            $syntheticId = '_early.' . $id;
            $containerBuilder->register($syntheticId)->setSynthetic(true)->setPublic(true);
            $containerBuilder->setAlias($id, $syntheticId)->setPublic(true);
        }

        $containerBuilder->compile();

        return $containerBuilder;
    }

    /**
     * @param SymfonyContainerBuilder $containerBuilder
     * @param FrontendInterface $cache
     * @return string
     */
    protected function dumpContainer(SymfonyContainerBuilder $containerBuilder, FrontendInterface $cache): string
    {
        $cacheIdentifier = $this->getCacheIdentifier();
        $containerClassName = $cacheIdentifier;

        $phpDumper = new PhpDumper($containerBuilder);
        $code = $phpDumper->dump(['class' => $containerClassName]);
        $code = str_replace('<?php', '', $code);
        // We need to patch the generated source code to use GeneralUtility::makeInstanceForDi() instead of `new`.
        // This is ugly, but has to stay, as long as we support SingletonInstances to be created/retrieved
        // through GeneralUtility::makeInstance.
        $code = str_replace(', )', ')', preg_replace('/new ([^\(]+)\(/', '\\TYPO3\\CMS\\Core\\Utility\\GeneralUtility::makeInstanceForDi(\\1::class, ', $code));

        $cache->set($cacheIdentifier, $code);

        return $code;
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
