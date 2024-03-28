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

namespace TYPO3\CMS\Core\Settings;

use Psr\Container\ContainerInterface;
use TYPO3\CMS\Core\Configuration\Loader\YamlFileLoader;

class YamlSettingDefinitionsProvider
{
    public function __construct(
        private ContainerInterface $container,
        private SettingsRegistry $settingsRegistry,
    ) {}

    public function loadSettingsDefinitions(string $path)
    {
        $settingsSchema = $path . 'Configuration/Settings.schema.yaml';
        if (!file_exists($settingsSchema)) {
            return;
        }
        $yamlFileLoader = $this->container->get(YamlFileLoader::class);
        $definitions = $yamlFileLoader->load($settingsSchema, YamlFileLoader::PROCESS_IMPORTS, true);
        $version = (int)($definitions['version'] ?? 0);
        if ($version !== 1) {
            throw new \RuntimeException('Settings schema version 1 expected. Filename: ' . $settingsSchema, 1711025983);
        }
        unset($definitions['version']);
        $this->settingsRegistry->addDefinitions($definitions);
    }
}
