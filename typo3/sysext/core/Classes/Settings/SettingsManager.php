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

readonly class SettingsManager
{
    public function __construct(
        protected SettingsRegistry $settingsRegistry
    ) {}

    public function getSettings(string $type, string $settingsClass = Settings::class): SettingsInterface
    {
        $path = explode('.', $type);
        $type = array_shift($path);
        $definitions = $this->settingsRegistry->getDefinitions($type);

        $values = $this->resolveSettings($type, $path, $definitions);

        return $settingsClass::__set_state($values);
    }

    protected function getGlobals(string $type): array
    {
        return match ($type) {
            'system' => $GLOBALS['TYPO3_CONF_VARS'] ?? [],
            'extension' => $GLOBALS['TYPO3_CONF_VARS']['EXTENSIONS'] ?? [],
            default => [],
        };
    }

    protected function resolveSettings(string $type, array $path, array $definitions): array
    {
        $settings = $this->getGlobals($type);
        $arrayPath = implode('/', $path);

        $values = ArrayUtility::isValidPath($settings, $arrayPath) ? ArrayUtility::getValueByPath($settings, $arrayPath) : [];

        $prefix = implode('.', $path) . '.';
        foreach ($definitions as $definition) {
            if (!str_starts_with($definition->key, $prefix)) {
                continue;
            }
            $key = substr($definition->key, strlen($prefix));
            $values[$key] = $values[$key] ?? $definition->default;
            // @todo add SettingTypeInterface and SettingTypeRegistry
            if ($definition->type === 'int') {
                $values[$key] = (int)$values[$key];
            }
        }

        return $values;
    }
}
