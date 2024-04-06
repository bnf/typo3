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
        protected SettingsFactory $settingsFactory,
        protected SettingsTypeRegistry $settingsTypeRegistry,
        protected ConfigurationManager $configurationManager,
    ) {}

    public function getSettings(
        ?string $namespace = null,
        ?string $settingsClass = null,
        ?string $source = null,
    ): SettingsInterface {
        $definitions = $this->settingsRegistry->getDefinitions('system');
        $values = $this->resolveSettings($source ?? 'system', $namespace, $definitions);

        $provider = new SettingsProvider(
            'definitions',
            $values,
            $definitions,
        );
        $settings = $this->settingsFactory->resolveSettings($provider);
        if ($settingsClass === null) {
            return $settings;
        }
        return $settingsClass::fromSettings($settings);
    }

    public function createSettingsFromFormData(array $settings): SettingsInterface
    {
        $definitions = $this->settingsRegistry->getDefinitions('system');
        return $this->settingsFactory->createSettingsFromFormData($settings, $definitions);
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
            if (!ArrayUtility::isValidPath($settingsTree, $key, '.')) {
                continue;
            }
            $settings[$key] = ArrayUtility::getValueByPath($settingsTree, $key, '.');
        }
        return $settings;
    }
}
