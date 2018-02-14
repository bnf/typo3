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

use Interop\Container\ServiceProviderInterface;
use Psr\Container\ContainerInterface;

abstract class AbstractServiceProvider implements ServiceProviderInterface
{
    /**
     * @param string $extkey
     */
    public function __construct(string $extkey, string $path)
    {
        $this->extkey = $extkey;
        $this->path = $path;
    }

    public function getFactories(): array
    {
        return [
        ];
    }

    public function getExtensions(): array
    {
        return [
            'TCAConfiguration' => function (ContainerInterface $container, array $TCA): array {
                $tcaConfigurationDirectory = $this->path . 'Configuration/TCA';
                if (is_dir($tcaConfigurationDirectory)) {
                    $files = scandir($tcaConfigurationDirectory);
                    foreach ($files as $file) {
                        if (
                            is_file($tcaConfigurationDirectory . '/' . $file)
                            && ($file !== '.')
                            && ($file !== '..')
                            && (substr($file, -4, 4) === '.php')
                        ) {
                            $tcaOfTable = require($tcaConfigurationDirectory . '/' . $file);
                            if (is_array($tcaOfTable)) {
                                // TCA table name is filename without .php suffix, eg 'sys_notes', not 'sys_notes.php'
                                $tcaTableName = substr($file, 0, -4);
                                $TCA[$tcaTableName] = $tcaOfTable;
                            }
                        }
                    }
                }

                return $TCA;
            },
            'TCAOverrides' => function (ContainerInterface $container, array $TCA): array {

                // Execute override files from Configuration/TCA/Overrides
                $tcaOverridesPathForPackage = $this->path . 'Configuration/TCA/Overrides';
                if (!is_dir($tcaOverridesPathForPackage)) {
                    return $TCA;
                }

                $files = scandir($tcaOverridesPathForPackage);
                if (empty($files)) {
                    return $TCA;
                }

                $GLOBALS['TCA'] = $TCA;
                foreach ($files as $file) {
                    if (
                        is_file($tcaOverridesPathForPackage . '/' . $file)
                        && ($file !== '.')
                        && ($file !== '..')
                        && (substr($file, -4, 4) === '.php')
                    ) {
                        require($tcaOverridesPathForPackage . '/' . $file);
                    }
                }
                $TCA = $GLOBALS['TCA'];

                return $TCA;
            },
            'middlewares' => function (ContainerInterface $container, array $middlewares): array {
                $packageConfiguration = $this->path . 'Configuration/RequestMiddlewares.php';
                if (file_exists($packageConfiguration)) {
                    $middlewaresInPackage = require $packageConfiguration;
                    if (is_array($middlewaresInPackage)) {
                        $middlewares = array_merge_recursive($middlewares, $middlewaresInPackage);
                    }
                }

                return $middlewares;
            }
        ];
    }
}
