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

class SettingsRegistry
{
    /** @var SettingDefinition[] */
    private array $definitions = [];

    public function addSettingDefinition(SettingDefinition $definition): void
    {
        $this->definitions[] = $definition;
    }

    public function addDefinitions(array $definitions): void
    {
        foreach ($definitions as $groupName => $group) {
            $this->processGroup($groupName, $group);
        }
    }

    public function getDefinitions(): array
    {
        return $this->definitions;
    }

    protected function processGroup(string $groupName, array $group): void
    {
        foreach ($group['settings'] as $setting => $options) {
            try {
                $definition = new SettingDefinition(...[...['key' => $setting], ...$options]);
            } catch (\Error $e) {
                throw new \Exception('Invalid setting definition: ' . json_encode($options), 1702623311, $e);
            }
            $this->definitions[$groupName][] = $definition;
        }
    }
}
