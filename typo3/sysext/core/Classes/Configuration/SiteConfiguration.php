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

namespace TYPO3\CMS\Core\Configuration;

use Psr\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\Finder\Finder;
use Symfony\Component\Yaml\Yaml;
use TYPO3\CMS\Core\Attribute\AsEventListener;
use TYPO3\CMS\Core\Cache\Event\CacheWarmupEvent;
use TYPO3\CMS\Core\Cache\Exception\InvalidDataException;
use TYPO3\CMS\Core\Cache\Frontend\PhpFrontend;
use TYPO3\CMS\Core\Configuration\Event\SiteConfigurationChangedEvent;
use TYPO3\CMS\Core\Configuration\Event\SiteConfigurationLoadedEvent;
use TYPO3\CMS\Core\Configuration\Loader\YamlFileLoader;
use TYPO3\CMS\Core\SingletonInterface;
use TYPO3\CMS\Core\Site\Entity\Site;
use TYPO3\CMS\Core\Site\Entity\SiteSettings;
use TYPO3\CMS\Core\Utility\GeneralUtility;

/**
 * Responsibility: Handles the format of the configuration (currently yaml), and the location of the file system folder
 *
 * Reads all available site configuration options, and puts them into Site objects.
 *
 * @internal
 */
class SiteConfiguration implements SingletonInterface
{
    /**
     * Config yaml file name.
     *
     * @internal
     */
    protected string $configFileName = 'config.yaml';

    /**
     * YAML file name with all settings.
     *
     * @internal
     */
    protected string $settingsFileName = 'settings.yaml';

    /**
     * YAML file name with all settings related to Content-Security-Policies.
     *
     * @internal
     */
    protected string $contentSecurityFileName = 'csp.yaml';

    /**
     * Identifier to store all configuration data in the core cache.
     *
     * @internal
     */
    protected string $cacheIdentifier = 'sites-configuration';

    /**
     * Cache stores all configuration as Site objects, as long as they haven't been changed.
     * This drastically improves performance as SiteFinder utilizes SiteConfiguration heavily
     *
     * @var array|null
     */
    protected $firstLevelCache;

    public function __construct(
        #[Autowire('%env(TYPO3:configPath)%/sites')]
        protected string $configPath,
        protected EventDispatcherInterface $eventDispatcher,
        #[Autowire(service: 'cache.core')]
        protected PhpFrontend $cache
    ) {}

    /**
     * Return all site objects which have been found in the filesystem.
     *
     * @return Site[]
     */
    public function getAllExistingSites(bool $useCache = true): array
    {
        if ($useCache && $this->firstLevelCache !== null) {
            return $this->firstLevelCache;
        }
        return $this->resolveAllExistingSites($useCache);
    }

    /**
     * Resolve all site objects which have been found in the filesystem.
     *
     * @return Site[]
     */
    public function resolveAllExistingSites(bool $useCache = true): array
    {
        $sites = [];
        $siteConfiguration = $this->getAllSiteConfigurationFromFiles($useCache);
        foreach ($siteConfiguration as $identifier => $configuration) {
            // cast $identifier to string, as the identifier can potentially only consist of (int) digit numbers
            $identifier = (string)$identifier;
            $siteSettings = $this->getSiteSettings($identifier, $configuration);
            $configuration['contentSecurityPolicies'] = $this->getContentSecurityPolicies($identifier);

            $rootPageId = (int)($configuration['rootPageId'] ?? 0);
            if ($rootPageId > 0) {
                $sites[$identifier] = new Site($identifier, $rootPageId, $configuration, $siteSettings);
            }
        }
        $this->firstLevelCache = $sites;
        return $sites;
    }

    /**
     * Resolve all site objects which have been found in the filesystem containing settings only from the `config.yaml`
     * file ignoring values from the `settings.yaml` and `csp.yaml` file.
     *
     * @return Site[]
     * @internal Not part of public API. Used as intermediate solution until settings are handled by a dedicated GUI.
     */
    public function resolveAllExistingSitesRaw(): array
    {
        $sites = [];
        $siteConfiguration = $this->getAllSiteConfigurationFromFiles(false);
        foreach ($siteConfiguration as $identifier => $configuration) {
            // cast $identifier to string, as the identifier can potentially only consist of (int) digit numbers
            $identifier = (string)$identifier;
            $siteSettings = new SiteSettings($configuration['settings'] ?? []);

            $rootPageId = (int)($configuration['rootPageId'] ?? 0);
            if ($rootPageId > 0) {
                $sites[$identifier] = new Site($identifier, $rootPageId, $configuration, $siteSettings);
            }
        }
        return $sites;
    }

    /**
     * Returns an array of paths in which a site configuration is found.
     *
     * @internal
     */
    public function getAllSiteConfigurationPaths(): array
    {
        $finder = new Finder();
        $paths = [];
        try {
            $finder->files()->depth(0)->name($this->configFileName)->in($this->configPath . '/*');
        } catch (\InvalidArgumentException $e) {
            $finder = [];
        }

        foreach ($finder as $fileInfo) {
            $path = $fileInfo->getPath();
            $paths[basename($path)] = $path;
        }
        return $paths;
    }

    /**
     * Read the site configuration from config files.
     *
     * @throws InvalidDataException
     */
    protected function getAllSiteConfigurationFromFiles(bool $useCache = true): array
    {
        // Check if the data is already cached
        $siteConfiguration = $useCache ? $this->cache->require($this->cacheIdentifier) : false;
        if ($siteConfiguration !== false) {
            return $siteConfiguration;
        }
        $finder = new Finder();
        try {
            $finder->files()->depth(0)->name($this->configFileName)->in($this->configPath . '/*');
        } catch (\InvalidArgumentException $e) {
            // Directory $this->configPath does not exist yet
            $finder = [];
        }
        $loader = GeneralUtility::makeInstance(YamlFileLoader::class);
        $siteConfiguration = [];
        foreach ($finder as $fileInfo) {
            $configuration = $loader->load(GeneralUtility::fixWindowsFilePath((string)$fileInfo));
            $identifier = basename($fileInfo->getPath());
            $event = $this->eventDispatcher->dispatch(new SiteConfigurationLoadedEvent($identifier, $configuration));
            $siteConfiguration[$identifier] = $event->getConfiguration();
        }
        $this->cache->set($this->cacheIdentifier, 'return ' . var_export($siteConfiguration, true) . ';');

        return $siteConfiguration;
    }

    /**
     * Load plain configuration without additional settings.
     *
     * This method should only be used in case the original configuration as it exists in the file should be loaded,
     * for example for writing / editing configuration.
     *
     * All read related actions should be performed on the site entity.
     *
     * @param string $siteIdentifier
     */
    public function load(string $siteIdentifier): array
    {
        $fileName = $this->configPath . '/' . $siteIdentifier . '/' . $this->configFileName;
        $loader = GeneralUtility::makeInstance(YamlFileLoader::class);
        return $loader->load(GeneralUtility::fixWindowsFilePath($fileName), YamlFileLoader::PROCESS_IMPORTS);
    }

    /**
     * Fetch the settings for a specific site and return the parsed Site Settings object.
     *
     * @todo This method resolves placeholders during the loading, which is okay as this is only used in context where
     *       the replacement is needed. However, this may change in the future, for example if loading is needed for
     *       implementing a GUI for the settings - which should either get a dedicated method or a flag to control if
     *       placeholder should be resolved during yaml file loading or not. The SiteConfiguration save action currently
     *       avoid calling this method.
     */
    protected function getSiteSettings(string $siteIdentifier, array $siteConfiguration): SiteSettings
    {
        $fileName = $this->configPath . '/' . $siteIdentifier . '/' . $this->settingsFileName;
        if (file_exists($fileName)) {
            $loader = GeneralUtility::makeInstance(YamlFileLoader::class);
            $settings = $loader->load(GeneralUtility::fixWindowsFilePath($fileName));
        } else {
            $settings = $siteConfiguration['settings'] ?? [];
        }
        return new SiteSettings($settings);
    }

    protected function getContentSecurityPolicies(string $siteIdentifier): array
    {
        $fileName = $this->configPath . '/' . $siteIdentifier . '/' . $this->contentSecurityFileName;
        if (file_exists($fileName)) {
            $loader = GeneralUtility::makeInstance(YamlFileLoader::class);
            return $loader->load(GeneralUtility::fixWindowsFilePath($fileName), YamlFileLoader::PROCESS_IMPORTS);
        }
        return [];
    }

    #[AsEventListener(event: SiteConfigurationChangedEvent::class)]
    public function siteConfigurationChanged()
    {
        $this->firstLevelCache = null;
    }

    #[AsEventListener('typo3-core/site-configuration')]
    public function warmupCaches(CacheWarmupEvent $event): void
    {
        if ($event->hasGroup('system')) {
            $this->getAllSiteConfigurationFromFiles(false);
        }
    }
}
