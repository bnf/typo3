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

namespace TYPO3\CMS\Core\Site\Set;

use Symfony\Component\DependencyInjection\Attribute\Autoconfigure;
use Symfony\Component\Yaml\Exception\ParseException;
use Symfony\Component\Yaml\Yaml;
use TYPO3\CMS\Core\Settings\SettingDefinition;

/**
 * @internal
 */
#[Autoconfigure(public: true)]
class YamlSetDefinitionProvider
{
    /** @var array<string, SetDefinition> */
    protected array $sets = [];

    /**
     * @return array<string, SetDefinition>
     */
    public function getSetDefinitions(): array
    {
        return $this->sets;
    }

    public function addSet(SetDefinition $set): void
    {
        $this->sets[$set->name] = $set;
    }

    public function get(\SplFileInfo $fileInfo): SetDefinition
    {
        $filename = $fileInfo->getPathname();
        // No placeholders or imports processed on purpose
        // Use dependencies for shared sets
        try {
            $set = Yaml::parseFile($filename);
        } catch (ParseException $e) {
            throw new InvalidSetException('Invalid set definition. Filename: ' . $filename, 1711024370, $e);
        }
        $version = (int)($set['version'] ?? 0);
        if ($version !== 1) {
            throw new InvalidSetException('Set schema `version: 1` expected. Filename: ' . $filename, 1711024372);
        }
        unset($set['version']);
        $path = dirname($filename);

        $settingsDefinitionsFile = $path . '/settings.definitions.yaml';
        if (is_file($settingsDefinitionsFile)) {
            try {
                $settingsDefinitions = Yaml::parseFile($settingsDefinitionsFile);
            } catch (ParseException $e) {
                throw new InvalidSetException('Invalid settings definition. Filename: ' . $settingsDefinitionsFile, 1711024374, $e);
            }
            $version = (int)($settingsDefinitions['version'] ?? 0);
            if ($version !== 1) {
                throw new \RuntimeException('Settings definitions schema `version: 1` expected. Filename: ' . $settingsDefinitionsFile, 1711024376);
            }
            unset($settingsDefinitions['version']);
            if (!is_array($settingsDefinitions['settings'] ?? null)) {
                throw new \RuntimeException('Missing "settings" key in settings definitions. Filename: ' . $settingsDefinitionsFile, 1711024378);
            }
            $set['settingsDefinitions'] = $settingsDefinitions['settings'];
        }

        $settingsFile = $path . '/settings.yaml';
        if (is_file($settingsFile)) {
            try {
                $settings = Yaml::parseFile($settingsFile);
            } catch (ParseException $e) {
                throw new InvalidSetException('Invalid settings format. Filename: ' . $settingsFile, 1711024380, $e);
            }
            if (!is_array($settings)) {
                throw new \RuntimeException('Invalid settings format. Filename: ' . $settingsFile, 1711024382);
            }
            $set['settings'] = $settings;
        }

        return $this->createDefinition($set, $path);
    }

    protected function createDefinition(array $set, string $basePath): SetDefinition
    {
        try {
            $settingsDefinitions = [];
            foreach (($set['settingsDefinitions'] ?? []) as $setting => $options) {
                try {
                    $definition = new SettingDefinition(...[...['key' => $setting], ...$options]);
                } catch (\Error $e) {
                    throw new \Exception('Invalid setting definition: ' . json_encode($options), 1702623312, $e);
                }
                $settingsDefinitions[] = $definition;
            }
            $setData = [
                ...$set,
                'settingsDefinitions' => $settingsDefinitions,
            ];
            $setData['typoscript'] ??= $basePath;
            $setData['pagets'] ??= $basePath . '/page.tsconfig';
            return new SetDefinition(...$setData);
        } catch (\Error $e) {
            throw new \Exception('Invalid set definition: ' . json_encode($set), 1170859526, $e);
        }
    }
}
