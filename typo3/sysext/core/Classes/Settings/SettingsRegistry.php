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
    /** @var SettingDefinition[][] */
    private array $definitions = [];

    /** @var CategoryDefinition[] */
    private array $categoryDefinitions = [];

    public function parseDefinitions(array $definitions): void
    {
        foreach ($definitions as $groupName => $group) {
            $this->processGroup($groupName, $group);
        }
    }

    public function addDefinition(string $groupName, SettingDefinition $definition): void
    {
        $this->definitions[$groupName][] = $definition;
    }

    public function getDefinitions(?string $groupName = null): array
    {
        if ($groupName !== null) {
            return $this->definitions[$groupName] ?? [];
        }
        return $this->definitions ?? [];
    }

    protected function processGroup(string $groupName, array $group): void
    {
        foreach ($group['settings'] ?? [] as $setting => $options) {
            try {
                $definition = new SettingDefinition(...[...['key' => $setting], ...$options]);
            } catch (\Error $e) {
                throw new \Exception('Invalid setting definition: ' . json_encode($options), 1702623311, $e);
            }
            $this->addDefinition($groupName, $definition);
        }
    }

    public function addCategoryDefinition(CategoryDefinition $definition): void
    {
        $this->categoryDefinitions[] = $definition;
    }

    public function addCategoryDefinitions(CategoryDefinition ...$definitions): void
    {
        foreach ($definitions as $definition) {
            $this->addCategoryDefinition($definition);
        }
    }

    public function parseCategoryDefinitions(array $definitions)
    {
        foreach ($definitions as $category => $options) {
            try {
                $definition = new CategoryDefinition(...[...['key' => $category], ...$options]);
            } catch (\Error $e) {
                throw new \Exception('Invalid category definition: ' . json_encode($options), 1724926814, $e);
            }
            $this->addCategoryDefinition($definition);
        }
    }

    public function getCategoryDefinitions(): array
    {
        return $this->categoryDefinitions ?? [];
    }
}
