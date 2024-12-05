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

use Symfony\Component\DependencyInjection\Attribute\Autowire;
use TYPO3\CMS\Core\Cache\Frontend\PhpFrontend;
use TYPO3\CMS\Core\Configuration\Exception\SiteConfigurationWriteException;
use TYPO3\CMS\Core\Configuration\SiteWriter;
use TYPO3\CMS\Core\Messaging\FlashMessage;
use TYPO3\CMS\Core\Messaging\FlashMessageService;
use TYPO3\CMS\Core\Settings\SettingDefinition;
use TYPO3\CMS\Core\Settings\SettingsComposer;
use TYPO3\CMS\Core\Settings\SettingsTypeRegistry;
use TYPO3\CMS\Core\Site\Entity\Site;
use TYPO3\CMS\Core\Site\Entity\SiteSettings;
use TYPO3\CMS\Core\Site\Set\SetRegistry;
use TYPO3\CMS\Core\Type\ContextualFeedbackSeverity;
use TYPO3\CMS\Core\Utility\GeneralUtility;

/**
 * @internal
 */
readonly class SiteSettingsService
{
    public function __construct(
        protected SiteWriter $siteWriter,
        #[Autowire(service: 'cache.core')]
        protected PhpFrontend $codeCache,
        protected SetRegistry $setRegistry,
        protected SiteSettingsFactory $siteSettingsFactory,
        protected SettingsTypeRegistry $settingsTypeRegistry,
        protected SettingsComposer $settingsComposer,
        protected FlashMessageService $flashMessageService,
    ) {}

    public function hasSettingsDefinitions(Site $site): bool
    {
        return count($this->getDefinitions($site)) > 0;
    }

    public function getUncachedSettings(Site $site): SiteSettings
    {
        // create a fresh Settings instance instead of using
        // $site->getSettings() which may have been loaded from cache
        return $this->siteSettingsFactory->createSettings(
            $site->getSets(),
            $site->getIdentifier(),
            $site->getRawConfiguration()['settings'] ?? [],
        );
    }

    public function getSetSettings(Site $site): SiteSettings
    {
        return $this->siteSettingsFactory->createSettings($site->getSets());
    }

    public function getLocalSettings(Site $site): SiteSettings
    {
        $definitions = $this->getDefinitions($site);
        return $this->siteSettingsFactory->createSettingsForKeys(
            array_map(static fn(SettingDefinition $d) => $d->key, $definitions),
            $site->getIdentifier(),
            $site->getRawConfiguration()['settings'] ?? []
        );
    }

    /**
     * @param array<string, string> $newSettings (e.g. values as edited in the settings editor)
     */
    public function computeSettingsDiff(Site $site, array $newSettings, bool $minify = true): array
    {
        // Settings from sets only – setting values without site-local config/sites/*/settings.yaml applied
        $defaultSettings = $this->siteSettingsFactory->createSettings($site->getSets(), null);

        // Settings from config/sites/*/settings.yaml only (our persistence target)
        $localSettings = $this->siteSettingsFactory->loadLocalSettingsTree($site->getIdentifier()) ??
            $site->getRawConfiguration()['settings'] ?? [];

        $definitions = $this->getDefinitions($site);
        $newSettings = array_filter($newSettings, static fn($key): bool => !($definitions[$key]?->readonly), ARRAY_FILTER_USE_KEY);
        $newSettings = $this->transformSettingsMapValues($definitions, $newSettings);

        return $this->settingsComposer->computeSettingsTreeDelta(
            $defaultSettings,
            $localSettings,
            $newSettings,
            $minify,
        );
    }

    public function writeSettings(Site $site, array $settings): void
    {
        try {
            $this->siteWriter->writeSettings($site->getIdentifier(), $settings);
        } catch (SiteConfigurationWriteException $e) {
            $flashMessage = GeneralUtility::makeInstance(FlashMessage::class, $e->getMessage(), '', ContextualFeedbackSeverity::ERROR, true);
            $defaultFlashMessageQueue = $this->flashMessageService->getMessageQueueByIdentifier();
            $defaultFlashMessageQueue->enqueue($flashMessage);
        }
        // SiteWriter currently does not invalidate the code cache, see #103804
        $this->codeCache->flush();
    }

    /**
     * @return array<string, SettingDefinition>
     */
    public function getDefinitions(Site $site): array
    {
        $sets = $this->setRegistry->getSets(...$site->getSets());
        $definitions = [];
        foreach ($sets as $set) {
            foreach ($set->settingsDefinitions as $settingDefinition) {
                $definitions[$settingDefinition->key] = $settingDefinition;
            }
        }
        return $definitions;
    }

    /**
     * Transform a settings from string representation to their type specific values
     *
     * @param array<string, SettingDefinition> $definitions
     * @param array<string, string>
     * @return array<string, mixed>
     */
    protected function transformSettingsMapValues(array $definitions, array $settingsMap): array
    {
        foreach ($settingsMap as $key => $value) {
            $definition = $definitions[$key] ?? null;
            if ($definition === null) {
                throw new \RuntimeException('Unexpected setting ' . $key . ' is not defined', 1724067004);
            }
            $type = $this->settingsTypeRegistry->get($definition->type);
            $settingsMap[$key] = $type->transformValue($value, $definition);
        }
        return $settingsMap;
    }
}
