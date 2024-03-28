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

readonly class SettingsManager
{
    public function __construct(
        protected SettingsRegistry $settingsRegistry
    ) {}

    public function getSettings(string $type, string $settingsClass = Settings::class): SettingsInterface
    {
        $definitions = $this->settingsRegistry->getDefinitions($type);

        $values = $this->resolveSettings($type, $definitions);

        return new $settingsClass(...$values);
    }

    protected function getGlobals(string $type): array
    {
        return match($type) {
            'system' => $GLOBALS['TYPO3_CONF_VARS'] ?? [];
            'default' => []
        };
    }


    protected function resolveSettings(string $type, array $definitions): array
    {
        ArrayUtility::mergeRecursiveWithOverrule($extConfTemplateConfiguration, $currentLocalConfiguration);

        $globals = $this->getGlobals($type);

        if (!ArrayUtility::isValidPath($globals, $extension . '/' . $path)) {
            // This if() should not be hit at "casual" runtime, but only in early setup phases
            if (!$hasBeenSynchronized) {
                $this->synchronizeExtConfTemplateWithLocalConfigurationOfAllExtensions(true);
            }
            // If there is still no such entry, even after sync -> throw
            if (!ArrayUtility::isValidPath($GLOBALS['TYPO3_CONF_VARS']['EXTENSIONS'], $extension . '/' . $path)) {
                throw new ExtensionConfigurationPathDoesNotExistException(
                    'Path ' . $path . ' does not exist in extension configuration',
                    1509977699
                );
            }
        }
        return ArrayUtility::getValueByPath($GLOBALS['TYPO3_CONF_VARS']['EXTENSIONS'], $extension . '/' . $path);


        return [];
    }
}
