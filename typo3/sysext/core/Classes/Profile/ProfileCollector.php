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

use Symfony\Component\DependencyInjection\Attribute\Autoconfigure;
use TYPO3\CMS\Core\Settings\SettingDefinition;

/**
 * @internal
 */
#[Autoconfigure(public: true)]
class ProfileCollector
{
    /** @var array<string, ProfileDefinition> */
    protected array $profiles = [];

    public function addProfile(array $profile, string $basePath): void
    {
        $profile = $this->createDefinition($profile, $basePath);
        $this->profiles[$profile->name] = $profile;
    }

    /**
     * @return array<string, ProfileDefinition>
     */
    public function getProfileDefinitions(): array
    {
        return $this->profiles;
    }

    protected function createDefinition(array $profile, string $basePath): ProfileDefinition
    {
        try {
            $settingsSchema = [];
            foreach (($profile['settingsSchema'] ?? []) as $setting => $options) {
                try {
                    $definition = new SettingDefinition(...[...['key' => $setting], ...$options]);
                } catch (\Error $e) {
                    throw new \Exception('Invalid setting definition: ' . json_encode($options), 1702623312, $e);
                }
                $settingsSchema[] = $definition;
            }
            $profileData = [
                ...$profile,
                'settingsSchema' => $settingsSchema,
            ];
            $profileData['typoscript'] ??= $basePath;
            return new ProfileDefinition(...$profileData);
        } catch (\Error $e) {
            throw new \Exception('Invalid profile definition: ' . json_encode($profile), 1170859526, $e);
        }
    }
}
