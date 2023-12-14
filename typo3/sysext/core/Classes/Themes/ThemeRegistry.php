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

namespace TYPO3\CMS\Core\Themes;

use TYPO3\CMS\Core\Settings\SettingDefinition;

class ThemeRegistry
{
    /** @var ThemeDefinition[] */
    private array $themes = [];

    public function addTheme(array $theme): void
    {
        $this->themes[] = $this->createDefinition($theme);
    }

    public function getThemes(): array
    {
        return $this->themes;
    }

    protected function createDefinition(array $theme): ThemeDefinition
    {
        try {
            $settings = array_map(fn(array $definitions) => new SettingDefinition(...$definitions), $theme['settings']);
            return new ThemeDefinition(...[...$theme, 'settings' => $settings]);
        } catch (\Error $e) {
            throw new \Exception('Invalid theme definition: ' . json_encode($theme), 1170859526, $e);
        }
    }
}
