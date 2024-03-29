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

namespace TYPO3\CMS\Core\Site;

use Symfony\Component\DependencyInjection\Attribute\Autoconfigure;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use TYPO3\CMS\Core\Configuration\Loader\YamlFileLoader;
use TYPO3\CMS\Core\Profile\ProfileRegistry;
use TYPO3\CMS\Core\Settings\SettingsTypeRegistry;
use TYPO3\CMS\Core\Site\Entity\SiteSettings;
use TYPO3\CMS\Core\Utility\ArrayUtility;
use TYPO3\CMS\Core\Utility\Exception\MissingArrayPathException;
use TYPO3\CMS\Core\Utility\GeneralUtility;

#[Autoconfigure(public: true)]
readonly class SiteSettingsFactory
{
    public function __construct(
        #[Autowire('%env(TYPO3:configPath)%/sites')]
        protected string $configPath,
        protected ProfileRegistry $profileRegistry,
        protected SettingsTypeRegistry $settingsTypeRegistry,
        protected YamlFileLoader $yamlFileLoader,
        protected string $settingsFileName = 'settings.yaml',
    ) {}

    /**
     * Fetch the settings for a specific site and return the parsed Site Settings object.
     *
     * @todo This method resolves placeholders during the loading, which is okay as this is only used in context where
     *       the replacement is needed. However, this may change in the future, for example if loading is needed for
     *       implementing a GUI for the settings - which should either get a dedicated method or a flag to control if
     *       placeholder should be resolved during yaml file loading or not. The SiteConfiguration save action currently
     *       avoid calling this method.
     */
    public function getSettings(string $siteIdentifier, array $siteConfiguration): SiteSettings
    {
        $profiles = $siteConfiguration['profiles'] ?? [];
        $settings = [];

        $definitions = [];
        $activeProfiles = [];
        if (is_array($profiles) && $profiles !== []) {
            $activeProfiles = $this->profileRegistry->getProfiles(...$profiles);
        }

        foreach ($activeProfiles as $profile) {
            foreach ($profile->settingsDefinitions as $settingDefinition) {
                $definitions[] = $settingDefinition;
            }
        }

        foreach ($definitions as $settingDefinition) {
            $settings = ArrayUtility::setValueByPath($settings, $settingDefinition->key, $settingDefinition->default, '.');
        }

        foreach ($activeProfiles as $profile) {
            ArrayUtility::mergeRecursiveWithOverrule($settings, $this->validateSettings($profile->settings, $definitions));
        }

        $fileName = $this->configPath . '/' . $siteIdentifier . '/' . $this->settingsFileName;
        if (file_exists($fileName)) {
            $siteSettings = $this->yamlFileLoader->load(GeneralUtility::fixWindowsFilePath($fileName));
        } else {
            $siteSettings = $siteConfiguration['settings'] ?? [];
        }

        ArrayUtility::mergeRecursiveWithOverrule($settings, $this->validateSettings($siteSettings, $definitions));

        return SiteSettings::__set_state($settings);
    }

    protected function validateSettings(array $settings, array $definitions): array
    {
        foreach ($definitions as $definition) {
            try {
                $value = ArrayUtility::getValueByPath($settings, $definition->key, '.');
            } catch (MissingArrayPathException) {
                //ArrayUtility::setValueByPath($settings, $definition->key, $definiton->default, '.');
                continue;
            }
            if (!$this->settingsTypeRegistry->has($definition->type)) {
                // @todo exception?
                continue;
            }
            $type = $this->settingsTypeRegistry->get($definition->type);
            if (!$type->validate($value, $definition)) {
                // @todo log error/warning
                $settings = ArrayUtility::removeByPath($settings, $definition->key, '.');
            }

            $newValue = $type->transformValue($value, $definition);
            if ($newValue !== $value) {
                ArrayUtility::setValueByPath($settings, $definition->key, $newValue, '.');
            }
        }

        return $settings;
    }

}
