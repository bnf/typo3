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
        protected \stdClass $bootState,
    ) {}

    public function getSettings(
        ?string $namespace = null,
        ?string $settingsClass = null,
        ?string $source = null,
    ): SettingsInterface {
        if (!$this->bootState->complete) {
            throw new \LogicException('Settings can not be injected/instantiated during ext_localconf.php or TCA loading. Use lazy loading for services that need settings instead.', 1758277703);
        }
        $definitions = $this->settingsRegistry->getDefinitions('system');
        $values = $this->extractDefinedValues(
            $GLOBALS['TYPO3_CONF_VARS'] ?? [],
            $definitions,
            $namespace
        );
        $settings = $this->settingsFactory->resolveSettings(
            new SettingsProvider(
                'definitions',
                $values,
                $definitions,
            )
        );
        if ($settingsClass !== null) {
            return $settingsClass::fromSettings($settings);
        }
        return $settings;
    }

    /**
     * @internal
     */
    public function getDefaultSettings(): SettingsInterface
    {
        $definitions = $this->settingsRegistry->getDefinitions('system');
        return $this->settingsFactory->resolveSettings(
            new SettingsProvider(
                'definitions',
                [],
                $definitions,
            )
        );
    }

    /**
     * @internal
     */
    public function getSettingsFromLocalConfigurationOnly(): SettingsInterface
    {
        $definitions = $this->settingsRegistry->getDefinitions('system');
        $values = $this->extractDefinedValues(
            $this->configurationManager->getLocalConfiguration(),
            $definitions
        );
        return $this->settingsFactory->resolveSettings(
            new SettingsProvider(
                'definitions',
                $values,
                $definitions,
            )
        );
    }

    /**
     * @internal
     */
    public function createSettingsFromFormData(array $settings): SettingsInterface
    {
        $definitions = $this->settingsRegistry->getDefinitions('system');
        return $this->settingsFactory->createSettingsFromFormData($settings, $definitions);
    }

    protected function extractDefinedValues(array $settingsTree, array $definitions, ?string $namespace = null): array
    {
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
