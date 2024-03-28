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

        $values = $this->resolveSettings($definitions);

        return new $settingsClass(...$values);
    }

    protected function resolveSettings(array $definitions): array
    {
        return [];
    }
}
