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
use TYPO3\CMS\Core\Configuration\Loader\YamlFileLoader;
use TYPO3\CMS\Core\Settings\SettingDefinition;

/**
 * @internal
 */
#[Autoconfigure(public: true)]
class ProfileCollector
{
    /** @var array<string, ProfileDefinition> */
    protected array $profiles = [];

    public function __construct(
        protected YamlFileLoader $yamlFileLoader
    ) {}

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
        $profile = $this->yamlFileLoader->load($filename, 0, true);
        $version = (int)($profile['version'] ?? 0);
        if ($version !== 1) {
            throw new \RuntimeException('Profile schema `version: 1` expected. Filename: ' . $filename, 1711024377);
        }
        unset($profile['version']);
        $path = dirname($filename);

        $settingsSchemaFile = $path . '/settings.schema.yaml';
        if (is_file($settingsSchemaFile)) {
            $settingsSchema = $this->yamlFileLoader->load($settingsSchemaFile, 0, true);
            $version = (int)($settingsSchema['version'] ?? 0);
            if ($version !== 1) {
                throw new \RuntimeException('Settings schema `version: 1` expected. Filename: ' . $settingsSchemaFile, 1711024378);
            }
            unset($settingsSchema['version']);
            if (!is_array($settingsSchema['settings'] ?? null)) {
                throw new \RuntimeException('Missing "settings" key in settings schema. Filename: ' . $settingsSchemaFile, 1711024379);
            }
            $profile['settingsSchema'] = $settingsSchema['settings'];
        }

        $settingsFile = $path . '/settings.yaml';
        if (is_file($settingsFile)) {
            $settings = $this->yamlFileLoader->load($settingsFile, 0, true);
            if (!is_array($settings)) {
                throw new \RuntimeException('Invalid settings format. Filename: ' . $settingsFile, 1711024380);
            }
            $profile['settings'] = $settings;
        }

        $this->addProfile($this->createDefinition($profile, $path));
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
