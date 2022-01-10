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

namespace TYPO3\CMS\Core\Page;

use TYPO3\CMS\Core\Cache\Frontend\FrontendInterface;
use TYPO3\CMS\Core\Core\Environment;
use TYPO3\CMS\Core\Package\PackageInterface;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Core\Utility\PathUtility;

/**
 * @internal
 */
class ImportMap
{
    protected array $packages;

    protected ?FrontendInterface $cache = null;

    protected string $cacheIdentifier = '';

    protected bool $bustSuffix;

    protected array $extensionsToLoad = [];

    private ?array $importMaps = null;

    /**
     * @param array<string, PackageInterface> $packages
     */
    public function __construct(
        array $packages,
        ?FrontendInterface $assetsCache = null,
        string $cacheIdentifier = '',
        bool $bustSuffix = true
    ) {
        $this->packages = $packages;
        $this->cache = $assetsCache;
        $this->cacheIdentifier = $cacheIdentifier;
        $this->bustSuffix = $bustSuffix;
    }

    public function includeAllImports(): void
    {
        $this->extensionsToLoad['*'] = true;
    }

    public function includeImportsFor(string $specifier): void
    {
        if (!isset($this->extensionsToLoad['*'])) {
            $this->resolveImport($specifier, true);
        }
    }

    public function resolveImport(string $specifier, bool $loadImportConfiguration = true): ?string
    {
        foreach (array_reverse($this->getImportMaps()) as $package => $config) {
            $imports = $config['imports'] ?? [];
            if (isset($imports[$specifier])) {
                if ($loadImportConfiguration) {
                    $this->loadDependency($package);
                }
                return $imports[$specifier];
            }

            $specifierParts = explode('/', $specifier);
            for ($i = 1; $i < count($specifierParts); ++$i) {
                $prefix = implode('/', array_slice($specifierParts, 0, $i)) . '/';
                if (isset($imports[$prefix])) {
                    if ($loadImportConfiguration) {
                        $this->loadDependency($package);
                    }
                    return $imports[$prefix] . implode(array_slice($specifierParts, $i));
                }
            }
        }

        return null;
    }

    public function __toString(): string
    {
        $importMap = $this->composeImportMap();
        return json_encode(
            $importMap,
            JSON_FORCE_OBJECT | JSON_UNESCAPED_SLASHES | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_TAG
        );
    }

    public function render(string $nonce, bool $includePolyfill = true)
    {
        $html = [];

        $importmapPolyfill = PathUtility::getPublicResourceWebPath('EXT:core/Resources/Public/JavaScript/Contrib/es-module-shims.js');

        // @todo: Add API for random nonce generation and registration in CSP Headers
        // The static (and of course insecure!) nonce "rAnd0m" is currently only used in acceptance tests,
        // and will need to be replaced by proper API later on.
        $html[] = sprintf('<script nonce="%s" type="importmap">%s</script>', $nonce, $this->__toString());
        if ($includePolyfill) {
            $html[] = sprintf('<script src="' . htmlspecialchars($importmapPolyfill) . '"></script>');
        }

        return implode(PHP_EOL, $html);
    }

    public function warmupCaches(): void
    {
        $this->computeImportMaps();
    }

    protected function getImportMaps(): array
    {
        return $this->importMaps ?? $this->getFromCache() ?? $this->computeImportMaps();
    }

    protected function getFromCache(): ?array
    {
        if ($this->cache === null) {
            return null;
        }
        if (!$this->cache->has($this->cacheIdentifier)) {
            return null;
        }
        return $this->cache->get($this->cacheIdentifier);
    }

    protected function computeImportMaps(): array
    {
        $extensionVersions = [];
        $importMaps = [];
        foreach ($this->packages as $packageName => $package) {
            $configurationFile = $package->getPackagePath() . 'Configuration/JavaScriptModules.php';
            if (!is_readable($configurationFile)) {
                continue;
            }
            $extensionVersions[$packageName] = $package->getPackageKey() . ':' . $package->getPackageMetadata()->getVersion();
            $packageConfiguration = require($configurationFile);
            $importMaps[$packageName] = $packageConfiguration ?? [];
        }

        $bust = '';
        $isDevelopment = Environment::getContext()->isDevelopment();
        if ($isDevelopment) {
            $bust = (string)$GLOBALS['EXEC_TIME'];
        } else {
            $bust = GeneralUtility::hmac(Environment::getProjectPath() . implode('|', $extensionVersions));
        }

        foreach ($importMaps as $packageName => $config) {
            $importMaps[$packageName]['imports'] = $this->resolvePaths($config['imports'] ?? [], $this->bustSuffix ? $bust : null);
        }

        $this->importMaps = $importMaps;
        if ($this->cache !== null) {
            $this->cache->set($this->cacheIdentifier, $importMaps);
        }
        return $importMaps;
    }

    protected function resolveRecursiveImportMap(string $prefix, string $path, array $exclude, string $bust): array
    {
        // @todo: Check path location (getPublicResourceWebPath)
        $path = GeneralUtility::getFileAbsFileName($path);
        $exclude = array_map(fn (string $excludePath) => GeneralUtility::getFileAbsFileName($excludePath), $exclude);

        $fileIterator = new \RegexIterator(
            new \RecursiveIteratorIterator(
                new \RecursiveDirectoryIterator($path)
            ),
            '#^' . preg_quote($path, '#') . '(.+\.js)$#',
            \RecursiveRegexIterator::GET_MATCH
        );

        $map = [];
        foreach ($fileIterator as $match) {
            $fileName = $match[0];
            $specifier = $prefix . $match[1] ?? '';

            // @todo: Abstract into an iterator?
            foreach ($exclude as $excludedPath) {
                if (str_starts_with($fileName, $excludedPath)) {
                    continue 2;
                }
            }

            $webPath = PathUtility::getAbsoluteWebPath($fileName, false) . '?bust=' . $bust;

            $map[$specifier] = $webPath;
        }

        return $map;
    }

    protected function resolvePaths(array $imports, string $bust = null): array
    {
        $cacheBustingSpecifiers = [];
        foreach ($imports as $specifier => $address) {
            $url = '';
            if (str_ends_with($specifier, '/')) {
                $path = is_array($address) ? ($address['path'] ?? '') : $address;
                $exclude = is_array($address) ? ($address['exclude'] ?? []) : [];

                $url = PathUtility::getPublicResourceWebPath($path, false);
                if ($bust !== null) {
                    // Resolve recursive importmap in order to add a bust suffix
                    // to each file.
                    $cacheBustingSpecifiers = array_merge(
                        $cacheBustingSpecifiers,
                        $this->resolveRecursiveImportMap($specifier, $path, $exclude, $bust)
                    );
                }
            } else {
                $url = PathUtility::getPublicResourceWebPath($address, false);
                if ($bust !== null) {
                    $url .= '?bust=' . $bust;
                }
            }
            $imports[$specifier] = $url;
        }

        return $imports + $cacheBustingSpecifiers;
    }

    protected function loadDependency(string $packageName): void
    {
        if (isset($this->extensionsToLoad[$packageName])) {
            return;
        }

        $this->extensionsToLoad[$packageName] = true;
        $dependencies = $this->importMaps[$packageName]['dependencies'] ?? [];
        foreach ($dependencies as $dependency) {
            $this->loadDependency($dependency);
        }
    }

    protected function composeImportMap(): array
    {
        $importMaps = $this->getImportMaps();

        if (!isset($this->extensionsToLoad['*'])) {
           $importMaps = array_intersect_key($importMaps, $this->extensionsToLoad);
        }

        $importMap = array_merge_recursive(...array_values($importMaps));

        unset($importMap['dependencies']);

        // @todo: get from request
        // rebase to site path
        $sitePath = GeneralUtility::getIndpEnv('TYPO3_SITE_PATH');
        foreach ($importMap['imports'] as $specifier => $url) {
            $importMap['imports'][$specifier] = $sitePath . $url;
        }

        return $importMap;
    }
}
