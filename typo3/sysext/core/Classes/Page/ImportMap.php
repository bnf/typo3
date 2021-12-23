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
    /**
     * @param array<string, PackageInterface> $packages
     * @return object The importmap
     */
    public function computeImportMap(array $packages): object
    {
        $importMap = new \stdClass();
        $importMap->imports = new \stdClass();

        $jsPaths = [];
        $exensionVersions = [];

        $publicPackageNames = ['core', 'frontend', 'backend'];

        $aliases = [
            'lit/index' => 'lit',
            'lit-html/lit-html' => 'lit-html',
            'lit-element/index' => 'lit-element',
            '@lit/reactive-element/reactive-element' => '@lit/reactive-element',
            'TYPO3/CMS/Dashboard/Contrib/muuri' => 'muuri',
            'TYPO3/CMS/Dashboard/Contrib/web-animate' => 'web-animate',
        ];

        $extensionVersions = [];
        foreach ($packages as $packageName => $package) {
            $absoluteJsPath = $package->getPackagePath() . 'Resources/Public/JavaScript/';
            $fullJsPath = PathUtility::getAbsoluteWebPath($absoluteJsPath);
            $fullJsPath = rtrim($fullJsPath, '/');
            if (!empty($fullJsPath) && is_dir($absoluteJsPath)) {
                //$type = in_array($packageName, $publicPackageNames, true) ? 'public' : 'internal';
                $jsPaths[$packageName] = $absoluteJsPath;
                $extensionVersions[$packageName] = $package->getPackageKey() . ':' . $package->getPackageMetadata()->getVersion();
            }
        }

        $bust = '';
        $isDevelopment = Environment::getContext()->isDevelopment();
        if ($isDevelopment) {
            $bust = $GLOBALS['EXEC_TIME'];
        } else {
            $bust = GeneralUtility::hmac(Environment::getProjectPath() . implode('|', $extensionVersions));
        }

        foreach ($jsPaths as $packageName => $absoluteJsPath) {
            $prefix = 'TYPO3/CMS/' . GeneralUtility::underscoredToUpperCamelCase($packageName) . '/';

            $fileIterator = new \RegexIterator(
                new \RecursiveIteratorIterator(
                    new \RecursiveDirectoryIterator($absoluteJsPath)
                ),
                '#^' . preg_quote($absoluteJsPath, '#') . '(.+)\.esm\.js$#',
                \RecursiveRegexIterator::GET_MATCH
            );
            foreach ($fileIterator as $match) {
                $fileName = $match[0];
                $moduleName = $prefix . $match[1] ?? '';
                $webPath = PathUtility::getAbsoluteWebPath($fileName) . '?bust=' . $bust;

                $contribName = str_replace('TYPO3/CMS/Core/Contrib/', '', $moduleName);
                if ($contribName !== $moduleName) {
                    $importMap->imports->{$contribName} = $webPath;
                    $moduleName = $contribName;
                }
                $importMap->imports->{$moduleName . '.esm.js'} = $webPath;
                if (isset($aliases[$moduleName])) {
                    $alias = $aliases[$moduleName];
                    $importMap->imports->{$alias} = $webPath;
                    $importMap->imports->{$alias . '.esm.js'} = $webPath;
                }
            }
        }

        return $importMap;
    }
}
