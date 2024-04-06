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

use TYPO3\CMS\Core\Utility\ArrayUtility;

/**
 * @internal
 */
final readonly class SettingsDiff
{
    /**
     * @param string[] $changes
     * @param string[] $deletions
     */
    public function __construct(
        public array $settings,
        public array $anonymousSettings,
        public array $changes,
        public array $deletions,
    ) {}

    public function asArray(): array
    {
        return [
            ...$this->anonymousSettings,
            ...$this->settings,
        ];
    }

    public function asTree(): array
    {
        $settings = $this->anonymousSettings;
        foreach ($this->settings as $key => $value) {
            $settings = ArrayUtility::setValueByPath($settings, $key, $value, '.');
        }
        return $settings;
    }

    /**
     * Calculate a new settings tree for the given $targetSettings
     *
     * Settings that have the same value as their default value
     * are removed (tree is minified) if the list of default settings
     * via $defaultSettings.
     *
     * @param array $currentSettings Current settings
     *                               In case of site settings: config/sites/…/settings.yaml
     * @param SettingsInterface $targetSettings Target settings
     *                                          (values as supplied via the settings editor)
     * @param SettingsInterface $defaultSettings Default settings, without local settings tree applied.
     *                                           In case of site settings: Combination of all settings
     *                                           defined in settings.definitions.yaml + setting.yaml
     *                                           from all selected sets combined
     */
    public static function create(
        array $currentSettings,
        SettingsInterface $targetSettings,
        ?SettingsInterface $defaultSettings = null,
    ): self {
        // Copy existing settings from current settings map/tree, to keep any settings
        // that have been present before (and are not defined in $defaultSettings)
        // Usecase for site settings:
        // Preserve "anonymous" v12-style site settings that have no definition in settings.definitions.yaml
        // and are stored as a tree instead of a map
        $anonymousSettings = $currentSettings;
        $settings = [];

        // Merge target settings into current settings
        $changes = [];
        $deletions = [];
        foreach ($targetSettings->getIdentifiers() as $key) {
            $value = $targetSettings->get($key);
            if ($defaultSettings !== null && $value === $defaultSettings->get($key)) {
                if (ArrayUtility::isValidPath($anonymousSettings, $key, '.')) {
                    $anonymousSettings = self::removeByPathWithAncestors($anonymousSettings, $key, '.');
                    $deletions[] = $key;
                }
                if (array_key_exists($key, $anonymousSettings)) {
                    unset($anonymousSettings[$key]);
                    $deletions[] = $key;
                }
                continue;
            }
            $settings[$key] = $value;

            // Remove key from legacy tree
            $currentValue = null;
            $hasValue = false;
            if (str_contains($key, '.') && ArrayUtility::isValidPath($anonymousSettings, $key, '.')) {
                $currentValue = ArrayUtility::getValueByPath($anonymousSettings, $key, '.');
                $anonymousSettings = self::removeByPathWithAncestors($anonymousSettings, $key, '.');
                $hasValue = true;
            }
            if (array_key_exists($key, $anonymousSettings)) {
                $currentValue = $anonymousSettings[$key];
                unset($anonymousSettings[$key]);
                $hasValue = true;
            }

            if (!$hasValue || $currentValue !== $value) {
                $changes[] = $key;
            }
        }

        return new self(
            $settings,
            $anonymousSettings,
            $changes,
            $deletions
        );
    }

    private static function removeByPathWithAncestors(array $array, string $path, string $delimiter): array
    {
        if ($path === '' || !ArrayUtility::isValidPath($array, $path, $delimiter)) {
            return $array;
        }

        $array = ArrayUtility::removeByPath($array, $path, $delimiter);
        $parts = explode($delimiter, $path);
        array_pop($parts);
        $parentPath = implode($delimiter, $parts);

        if ($parentPath !== '' && ArrayUtility::isValidPath($array, $parentPath, $delimiter)) {
            $parent = ArrayUtility::getValueByPath($array, $parentPath, $delimiter);
            if ($parent === []) {
                return self::removeByPathWithAncestors($array, $parentPath, $delimiter);
            }
        }
        return $array;
    }
}
