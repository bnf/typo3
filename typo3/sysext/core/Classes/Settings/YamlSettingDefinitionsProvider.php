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

use Symfony\Component\Yaml\Exception\ParseException;
use Symfony\Component\Yaml\Yaml;

class YamlSettingDefinitionsProvider
{
    public function __construct(
        private SettingsRegistry $settingsRegistry,
    ) {}

    public function loadSettingsDefinitions(string $path)
    {
        $settingsDefinitions = $path . 'Configuration/settings.definitions.yaml';
        if (!file_exists($settingsDefinitions)) {
            return;
        }

        try {
            $definitions = Yaml::parseFile($settingsDefinitions);
        } catch (ParseException $e) {
            throw new \RuntimeException('Invalid setting.definition.yaml. Filename: ' . $settingsDefinitions, 1712357722, $e);
        }

        $categories = $definitions['categories'] ?? [];
        unset($definitions['categories']);

        $this->settingsRegistry->parseCategoryDefinitions($categories);
        $this->settingsRegistry->parseDefinitions($definitions, 'system');
    }
}
