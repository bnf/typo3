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
use TYPO3\CMS\Core\Configuration\ConfigurationManager;
use TYPO3\CMS\Core\Utility\ArrayUtility;

#[Autoconfigure(public: true)]
readonly class SettingsManager
{
    public function __construct(
        protected SettingsRegistry $settingsRegistry,
        protected SettingsTypeRegistry $settingsTypeRegistry,
        protected ConfigurationManager $configurationManager,
    ) {}

    public function getSettings(string $type, ?string $namespace = null, string $settingsClass = Settings::class, ?string $source = null): SettingsInterface
    {
        $definitions = $this->settingsRegistry->getDefinitions($type);

        $values = $this->resolveSettings($source ?? $type, $namespace, $definitions);

        return $settingsClass::fromMap($values);
    }

    public function overruleGlobals(): void
    {
        $GLOBALS['TYPO3_CONF_VARS'] ??= [];
        $settings = $this->getSettings('system');
        $settingsTree = [];
        foreach ($settings->getIdentifiers() as $key) {
            $GLOBALS['TYPO3_CONF_VARS'] = ArrayUtility::setValueByPath($GLOBALS['TYPO3_CONF_VARS'], $key, $settings->get($key), '.');
        }
    }

    protected function getGlobals(string $type): array
    {
        return match ($type) {
            'system' => $GLOBALS['TYPO3_CONF_VARS'] ?? [],
            'systemLocal' => $this->configurationManager->getLocalConfiguration(),
            'systemDefault' => [],
            default => [],
        };
    }

    protected function resolveSettings(string $type, ?string $namespace, array $definitions): array
    {
        $settingsTree = $this->getGlobals($type);
        if ($namespace) {
            $settingsTree = ArrayUtility::isValidPath($settingsTree, $namespace, '.') ? ArrayUtility::getValueByPath($settingsTree, $namespace, '.') : [];
            $namespace .= '.';
        }
        $nslength = strlen($namespace ?? '');

        $settings = [];
        foreach ($definitions as $definition) {
            $key = $definition->key;
            if ($namespace && !str_starts_with($key, $namespace)) {
                continue;
            }
            $key = substr($key, $nslength);
            $settings[$key] = ArrayUtility::isValidPath($settingsTree, $key, '.') ? ArrayUtility::getValueByPath($settingsTree, $key, '.') : $definition->default;
            if ($this->settingsTypeRegistry->has($definition->type)) {
                $type = $this->settingsTypeRegistry->get($definition->type);
                /*
                if (!$type->validate($settings[$key], $definition)) {
                    continue;
                }
                */
                $settings[$key] = $type->transformValue($settings[$key], $definition);
            }
        }
        return $settings;
    }
}
