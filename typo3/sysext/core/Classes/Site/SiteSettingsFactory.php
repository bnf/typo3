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

use TYPO3\CMS\Core\Configuration\Loader\YamlFileLoader;
use TYPO3\CMS\Core\Settings\SettingsRegistry;
use TYPO3\CMS\Core\Site\Entity\SiteSettings;
use TYPO3\CMS\Core\Utility\GeneralUtility;

readonly class SiteSettingsFactory
{
    public function __construct(
        protected string $configPath,
        protected SettingsRegistry $settingsRegistry,
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
        $fileName = $this->configPath . '/' . $siteIdentifier . '/' . $this->settingsFileName;
        if (file_exists($fileName)) {
            $settings = $this->yamlFileLoader->load(GeneralUtility::fixWindowsFilePath($fileName));
        } else {
            $settings = $siteConfiguration['settings'] ?? [];
        }

        return new SiteSettings($settings);
    }
}
