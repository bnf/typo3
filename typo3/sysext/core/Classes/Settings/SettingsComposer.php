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
readonly class SettingsComposer
{
    public function __construct(
        private SettingsTypeRegistry $settingsTypeRegistry,
    ) {}

    public function computeSettingsDiff(
        array $definitions,
        SettingsInterface $systemDefaultSettings,
        array $localSettingsTree,
        array $incomingSettings,
        bool $minify = true
    ): array {

        $settings = [];
        foreach ($incomingSettings as $key => $value) {
            $definition = $definitions[$key] ?? null;
            if ($definition === null) {
                throw new \RuntimeException('Unexpected setting ' . $key . ' is not defined', 1724067004);
            }
            if ($definition->readonly) {
                continue;
            }
            $type = $this->settingsTypeRegistry->get($definition->type);
            $settings[$key] = $type->transformValue($value, $definition);
        }

        // Read existing settings from local settings tree.
        // Note: we *must* not remove any settings that may be present before
        //  * TYPO3 v10-style site settings must not be removed
        //  * TYPO3 system/settings.php may have unspecified settings which need to be preserved
        $settingsTree = $localSettingsTree;

        // Merge incoming settings into current settingsTree
        $changes = [];
        $deletions = [];
        foreach ($settings as $key => $value) {
            if ($minify && $value === $systemDefaultSettings->get($key)) {
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
