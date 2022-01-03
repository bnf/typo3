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

use TYPO3\CMS\Core\Core\Environment;
use TYPO3\CMS\Core\Package\PackageInterface;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Core\Utility\PathUtility;

/**
 * @internal
 */
class ImportMap
{
    protected ?array $importMap = null;

    /**
     * @param array<string, PackageInterface> $packages
     * @param bool $bustSuffix
     * @return array The importmap
     */
    public function computeImportMap(array $packages, bool $bustSuffix = true): array
    {
        $publicPackageNames = ['core', 'frontend', 'backend'];
        $extensionVersions = [];
        $importMap = [];
        foreach ($packages as $packageName => $package) {
            $configurationFile = $package->getPackagePath() . 'Configuration/JavaScriptModules.php';
            if (!is_readable($configurationFile)) {
                continue;
            }
            $extensionVersions[$packageName] = $package->getPackageKey() . ':' . $package->getPackageMetadata()->getVersion();
            $packageConfiguration = require($configurationFile);
            $importMap = array_merge_recursive($importMap, $packageConfiguration['backend']);
        }

        $bust = '';
        $isDevelopment = Environment::getContext()->isDevelopment();
        if ($isDevelopment) {
            $bust = (string)$GLOBALS['EXEC_TIME'];
        } else {
            $bust = GeneralUtility::hmac(Environment::getProjectPath() . implode('|', $extensionVersions));
        }

        $cacheBustingSpecifiers = [];
        foreach ($importMap['imports'] as $specifier => $address) {
            $url = '';
            if (str_ends_with($specifier, '/')) {
                $path = is_array($address) ? ($address['path'] ?? '') : $address;
                $exclude = is_array($address) ? ($address['exclude'] ?? []) : [];

                $url = PathUtility::getPublicResourceWebPath($path);
                if ($bustSuffix) {
                    // Resolve recursive importmap in order to add a bust suffix
                    // to each file.
                    $cacheBustingSpecifiers = array_merge(
                        $cacheBustingSpecifiers,
                        $this->resolveRecursiveImportMap($specifier, $path, $exclude, $bust)
                    );
                }
            } else {
                $url = PathUtility::getPublicResourceWebPath($address);
                if ($bustSuffix) {
                   $url .= '?bust=' . $bust;
                }
            }
            $importMap['imports'][$specifier] = $url;
        }

        if ($bustSuffix) {
            $importMap['imports'] += $cacheBustingSpecifiers;
        }

        return $this->importMap = $importMap;
    }


    protected function resolveRecursiveImportMap(string $prefix, string $path, array $exclude, string $bust): array
    {
        // @todo: Check path location (getPublicResourceWebPath)
        $path = GeneralUtility::getFileAbsFileName($path);
        $exclude = array_map(fn(string $excludePath) => GeneralUtility::getFileAbsFileName($excludePath), $exclude);

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

            // @todo: Abstract into iterator
            foreach ($exclude as $excludedPath) {
                if (str_starts_with($fileName, $excludedPath)) {
                    continue 2;
                }
            }

            $webPath = PathUtility::getAbsoluteWebPath($fileName) . '?bust=' . $bust;

            $map[$specifier] = $webPath;
        }

        return $map;
    }

    public function mapToUrl(string $moduleName): ?string
    {
        $imports = $this->importMap['imports'] ?? new \stdClass;

        if (isset($imports[$moduleName])) {
            return $imports[$moduleName];
        }

        $moduleParts = explode('/', $moduleName);
        for ($i = 1; $i < count($moduleParts); ++$i) {
            $prefix = implode('/', array_slice($moduleParts, 0, $i)) . '/';
            if (isset($imports[$prefix])) {
                return $imports[$prefix] . implode(array_slice($moduleParts, $i));
            }
        }

        return null;
    }

    public function __toString(): string
    {
        return json_encode(
            $this->importMap ?? [],
            JSON_FORCE_OBJECT | JSON_UNESCAPED_SLASHES | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_TAG
        );
    }
}
