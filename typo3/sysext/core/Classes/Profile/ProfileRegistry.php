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

namespace TYPO3\CMS\Core\Profile;

use TYPO3\CMS\Core\Settings\SettingDefinition;

class ProfileRegistry
{
    /** @var ProfileDefinition[] */
    private array $profiles = [];

    public function addProfile(array $profile): void
    {
        $this->profiles[] = $this->createDefinition($profile);
    }

    public function getProfiles(): array
    {
        return $this->profiles;
    }

    protected function createDefinition(array $profile): ProfileDefinition
    {
        try {

            $settings = [];
            foreach ($profile['settings'] as $setting => $options) {
                try {
                    $definition = new SettingDefinition(...[...['key' => $setting], ...$options]);
                } catch (\Error $e) {
                    throw new \Exception('Invalid setting definition: ' . json_encode($options), 1702623311, $e);
                }
                $settings[] = $definition;
            }
            //$settings = array_map(fn(array $definitions) => new SettingDefinition(...$definitions), $profile['settings']);
            $profileData = [
                ...$profile,
                'settings' => $settings,
            ];
            return new ProfileDefinition(...$profileData);
        } catch (\Error $e) {
            throw new \Exception('Invalid profile definition: ' . json_encode($profile), 1170859526, $e);
        }
    }
}
