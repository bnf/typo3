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
use Symfony\Component\Yaml\Exception\ParseException;
use Symfony\Component\Yaml\Yaml;
use TYPO3\CMS\Core\Settings\SettingDefinition;

/**
 * @internal
 */
#[Autoconfigure(public: true)]
class ProfileCollector
{
    /** @var array<string, ProfileDefinition> */
    protected array $profiles = [];

    /**
     * @return array<string, ProfileDefinition>
     */
    public function getProfileDefinitions(): array
    {
        return $this->profiles;
    }

    public function addProfile(ProfileDefinition $profile): void
    {
        $this->profiles[$profile->name] = $profile;
    }

    public function addProfileFromYaml(\SplFileInfo $fileInfo): void
    {
        $filename = $fileInfo->getPathname();
        // No placeholders or imports processed on purpose
        // Use dependencies for shared profiles
        try {
            $profile = Yaml::parseFile($filename);
        } catch (ParseException $e) {
            throw new InvalidProfileException('Invalid profile definition. Filename: ' . $filename, 1711024370, $e);
        }
        $version = (int)($profile['version'] ?? 0);
        if ($version !== 1) {
            throw new InvalidProfileException('Profile schema `version: 1` expected. Filename: ' . $filename, 1711024372);
        }
        unset($profile['version']);
        $path = dirname($filename);

        $settingsDefinitionsFile = $path . '/settings.definitions.yaml';
        if (is_file($settingsDefinitionsFile)) {
            try {
                $settingsDefinitions = Yaml::parseFile($settingsDefinitionsFile);
            } catch (ParseException $e) {
                throw new InvalidProfileException('Invalid settings definition. Filename: ' . $settingsDefinitionsFile, 1711024374, $e);
            }
            $version = (int)($settingsDefinitions['version'] ?? 0);
            if ($version !== 1) {
                throw new \RuntimeException('Settings definitions schema `version: 1` expected. Filename: ' . $settingsDefinitionsFile, 1711024376);
            }
            unset($settingsDefinitions['version']);
            if (!is_array($settingsDefinitions['settings'] ?? null)) {
                throw new \RuntimeException('Missing "settings" key in settings definitions. Filename: ' . $settingsDefinitionsFile, 1711024378);
            }
            $profile['settingsDefinitions'] = $settingsDefinitions['settings'];
        }

        $settingsFile = $path . '/settings.yaml';
        if (is_file($settingsFile)) {
            try {
                $settings = Yaml::parseFile($settingsFile);
            } catch (ParseException $e) {
                throw new InvalidProfileException('Invalid settings format. Filename: ' . $settingsFile, 1711024380, $e);
            }
            if (!is_array($settings)) {
                throw new \RuntimeException('Invalid settings format. Filename: ' . $settingsFile, 1711024382);
            }
            $profile['settings'] = $settings;
        }

        $this->addProfile($this->createDefinition($profile, $path));
    }

    protected function createDefinition(array $profile, string $basePath): ProfileDefinition
    {
        try {
            $settingsDefinitions = [];
            foreach (($profile['settingsDefinitions'] ?? []) as $setting => $options) {
                try {
                    $definition = new SettingDefinition(...[...['key' => $setting], ...$options]);
                } catch (\Error $e) {
                    throw new \Exception('Invalid setting definition: ' . json_encode($options), 1702623312, $e);
                }
                $settingsDefinitions[] = $definition;
            }
            $profileData = [
                ...$profile,
                'settingsDefinitions' => $settingsDefinitions,
            ];
            return new ProfileDefinition(...$profileData);
        } catch (\Error $e) {
            throw new \Exception('Invalid profile definition: ' . json_encode($profile), 1170859526, $e);
        }
    }
}
