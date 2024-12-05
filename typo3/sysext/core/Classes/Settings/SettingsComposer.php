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

use Symfony\Component\DependencyInjection\Attribute\Autoconfigure;
use TYPO3\CMS\Core\Utility\ArrayUtility;

/**
 * @internal
 */
#[Autoconfigure(public: true)]
//readonly class SettingsTreeNormalizer
readonly class SettingsComposer
{
    public function __construct(
        private SettingsTypeRegistry $settingsTypeRegistry,
    ) {}

    /**
     * Calculate a new (minimal) settings tree that resolves into
     * $targetSettings when applied to $defaultSettings, keeping
     * all current (anonymous) values in $currentSettingsTree untouched,
     * that are not defined in $defaultSettings.
     *
     * @template SettingsValue of string|int|float|bool|array
     * // @todo Should actually be `Tree|SettingsValue`, but phpstan can not parse that
     * @template Tree of array<string, SettingsValue>
     *
     * @param SettingsInterface $defaultSettings Default settings, without local settings tree applied.
     *                                           In case of site settings: Combination of all settings
     *                                           defined in settings.definitions.yaml + setting.yaml
     *                                           from the enabled sets combined
     * @param Tree $currentSettingsTree Current settings tree (recursive structure)
     *                                  (e.g. config/sites/…/settings.yaml if this method is handling site settings)
     * @param array<string, SettingsValue> $targetSettings Target settings (key-value structure)
     *                                                     (e.g. values as edited in the settings editor)
     * @return array{settings: Tree, changes: string[], deletions: string[]}
     */
    public function computeSettingsTreeDelta(
        SettingsInterface $defaultSettings,
        array $currentSettingsTree,
        array $targetSettings,
        bool $minify = true
    ): array {

        //$settings = $this->transformSettings($definitions, $targetSettings);

        // Copy existing settings from current settings tree, to keep any settings
        // that have been present before (and are not defined in $defaultSettings)
        // Usecase for site settings:
        // Preserve "anonymous" v12-style site settings that have no definition in settings.definitions.yaml
        $settingsTree = $currentSettingsTree;

        // Merge target settings into current settingsTree
        $changes = [];
        $deletions = [];
        foreach ($targetSettings as $key => $value) {
            if ($minify && $value === $defaultSettings->get($key)) {
                if (ArrayUtility::isValidPath($settingsTree, $key, '.')) {
                    $settingsTree = $this->removeByPathWithAncestors($settingsTree, $key, '.');
                    $deletions[] = $key;
                }
                continue;
            }
            if (!ArrayUtility::isValidPath($settingsTree, $key, '.') ||
                $value !== ArrayUtility::getValueByPath($settingsTree, $key, '.')
            ) {
                $settingsTree = ArrayUtility::setValueByPath($settingsTree, $key, $value, '.');
                $changes[] = $key;
            }
        }
        return [
            'settings' => $settingsTree,
            'changes' => $changes,
            'deletions' => $deletions,
        ];
    }

    private function removeByPathWithAncestors(array $array, string $path, string $delimiter): array
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
                return $this->removeByPathWithAncestors($array, $parentPath, $delimiter);
            }
        }
        return $array;
    }
}
