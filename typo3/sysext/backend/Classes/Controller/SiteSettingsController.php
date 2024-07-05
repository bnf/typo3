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

namespace TYPO3\CMS\Backend\Controller;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\Yaml\Yaml;
use TYPO3\CMS\Backend\Attribute\AsController;
use TYPO3\CMS\Backend\Dto\Settings\EditableSetting;
use TYPO3\CMS\Backend\Routing\UriBuilder;
use TYPO3\CMS\Backend\Template\Components\ButtonBar;
use TYPO3\CMS\Backend\Template\ModuleTemplate;
use TYPO3\CMS\Backend\Template\ModuleTemplateFactory;
use TYPO3\CMS\Backend\Utility\BackendUtility;
use TYPO3\CMS\Core\Authentication\BackendUserAuthentication;
use TYPO3\CMS\Core\Cache\Frontend\PhpFrontend;
use TYPO3\CMS\Core\Configuration\Exception\SiteConfigurationWriteException;
use TYPO3\CMS\Core\Configuration\SiteWriter;
use TYPO3\CMS\Core\Http\JsonResponse;
use TYPO3\CMS\Core\Http\RedirectResponse;
use TYPO3\CMS\Core\Imaging\IconFactory;
use TYPO3\CMS\Core\Imaging\IconSize;
use TYPO3\CMS\Core\Localization\LanguageService;
use TYPO3\CMS\Core\Messaging\FlashMessage;
use TYPO3\CMS\Core\Messaging\FlashMessageService;
use TYPO3\CMS\Core\Page\PageRenderer;
use TYPO3\CMS\Core\Settings\Category;
use TYPO3\CMS\Core\Settings\SettingDefinition;
use TYPO3\CMS\Core\Settings\SettingsTypeRegistry;
use TYPO3\CMS\Core\Site\Entity\Site;
use TYPO3\CMS\Core\Site\Set\CategoryRegistry;
use TYPO3\CMS\Core\Site\Set\SetRegistry;
use TYPO3\CMS\Core\Site\SiteFinder;
use TYPO3\CMS\Core\Site\SiteSettingsFactory;
use TYPO3\CMS\Core\SysLog\Action\Setting as SettingAction;
use TYPO3\CMS\Core\SysLog\Error as SystemLogErrorClassification;
use TYPO3\CMS\Core\SysLog\Type;
use TYPO3\CMS\Core\Type\ContextualFeedbackSeverity;
use TYPO3\CMS\Core\Utility\ArrayUtility;
use TYPO3\CMS\Core\Utility\GeneralUtility;

/**
 * Backend controller: The "Site settings" module
 *
 * @internal This class is a specific Backend controller implementation and is not considered part of the Public TYPO3 API.
 */
#[AsController]
readonly class SiteSettingsController
{
    public function __construct(
        protected ModuleTemplateFactory $moduleTemplateFactory,
        protected SiteFinder $siteFinder,
        protected SiteWriter $siteWriter,
        #[Autowire(service: 'cache.core')]
        protected PhpFrontend $codeCache,
        protected SetRegistry $setRegistry,
        protected SiteSettingsFactory $siteSettingsFactory,
        protected SettingsTypeRegistry $settingsTypeRegistry,
        protected CategoryRegistry $categoryRegistry,
        protected UriBuilder $uriBuilder,
        protected PageRenderer $pageRenderer,
        protected FlashMessageService $flashMessageService,
        protected IconFactory $iconFactory,
    ) {}

    public function overviewAction(ServerRequestInterface $request): ResponseInterface
    {
        $view = $this->moduleTemplateFactory->create($request);

        $sites = $this->siteFinder->getAllSites();
        $sites = array_filter($sites, static fn(Site $site): bool => $site->getSets() !== []);
        foreach ($sites as $key => $site) {
            $sites[$key] = [
                'site' => $site,
                'hasSettings' => count($this->getDefinitions($site)) > 0,
                'siteTitle' => $this->getSiteTitle($site),
                'localSettings' => $this->siteSettingsFactory->createSettings($site->getIdentifier(), $site->getRawConfiguration()['settings'] ?? [], []),
            ];
        }

        $view->assign('sites', $sites);

        return $view->renderResponse('SiteSettings/Overview');
    }

    private function getDefinitions(Site $site): array
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

    public function editAction(ServerRequestInterface $request): ResponseInterface
    {
        $identifier = $request->getQueryParams()['site'] ?? null;
        if ($identifier === null) {
            throw new \RuntimeException('Site identifier to edit must be set', 1713394528);
        }

        $returnUrl = GeneralUtility::sanitizeLocalUrl(
            (string)($request->getQueryParams()['returnUrl'] ?? '')
        ) ?: null;
        $overviewUrl = (string)$this->uriBuilder->buildUriFromRoute('site_settings');

        $site = $this->siteFinder->getSiteByIdentifier($identifier);
        $view = $this->moduleTemplateFactory->create($request);
        $this->addDocHeaderCloseAndSaveButtons($view, $site, $returnUrl ?? $overviewUrl);
        $this->addDocHeaderExportButton($view, $site);
        $this->addDocHeaderSiteConfigurationButton($view, $site);
        $this->pageRenderer->addInlineLanguageLabelFile('EXT:backend/Resources/Private/Language/locallang_copytoclipboard.xlf');

        $categories = $this->categoryRegistry->getCategories(...$site->getSets());

        $setSettings = $this->siteSettingsFactory->createSettings(null, [], $site->getSets());
        // create a fresh Settings instance instead of using
        // $site->getSettings() which might be cache-stale
        $settings = $this->siteSettingsFactory->createSettings(
            $site->getIdentifier(),
            $site->getRawConfiguration()['settings'] ?? [],
            $site->getSets()
        );

        $categoryEnhancer = function (Category $category) use (&$categoryEnhancer, $settings, $setSettings): Category {
            return $category
                ->withCategories(array_map($categoryEnhancer, $category->categories))
                ->withSettings(array_map(
                    fn(SettingDefinition $definition): EditableSetting => new EditableSetting(
                        definition: $definition,
                        value: $settings->get($definition->key),
                        systemDefault: $setSettings->get($definition->key),
                        status: 'none',
                        warnings: [],
                        typeImplementation: $this->settingsTypeRegistry->get($definition->type)->getJavaScriptModule(),
                    ),
                    $category->settings
                ));
        };

        $categories = array_map($categoryEnhancer, $categories);

        $view->assign('siteIdentifier', $site->getIdentifier());
        $view->assign('siteTitle', $this->getSiteTitle($site));
        $view->assign('rootPageId', $site->getRootPageId());

        $view->assign('actionUrl', (string)$this->uriBuilder->buildUriFromRoute('site_settings.save', array_filter([
            'site' => $site->getIdentifier(),
            'returnUrl' => $returnUrl,
        ], static fn(?string $v): bool => $v !== null)));
        $view->assign('returnUrl', $returnUrl);
        $view->assign('dumpUrl', (string)$this->uriBuilder->buildUriFromRoute('site_settings.dump', ['site' => $site->getIdentifier()]));
        $view->assign('categories', $categories);

        return $view->renderResponse('SiteSettings/Edit');
    }

    private function removeByPathWithAncestors(array $array, string $path, string $delimiter): array
    {
        if ($path === '') {
            return $array;
        }
        if (!ArrayUtility::isValidPath($array, $path, $delimiter)) {
            return $array;
        }

        $array = ArrayUtility::removeByPath($array, $path, $delimiter);
        $parts = explode($delimiter, $path);
        array_pop($parts);
        $parentPath = implode($delimiter, $parts);

        if ($parentPath !== '' && ArrayUtility::isValidPath($array, $parentPath, $delimiter)) {
            $parent = ArrayUtility::getValueByPath($array, $parentPath, $delimiter);
            if ($parent === []) {
                return $this->removeByPathWithAncestors($array, $parentPath, $delimiter);
            }
        }
        return $array;
    }

    /**
     * Save incoming data from editAction and redirect to overview or edit
     *
     * @throws \RuntimeException
     */
    public function saveAction(ServerRequestInterface $request): ResponseInterface
    {
        $identifier = $request->getQueryParams()['site'] ?? null;
        if ($identifier === null) {
            throw new \RuntimeException('Site identifier to edit must be set', 1713394529);
        }

        $site = $this->siteFinder->getSiteByIdentifier($identifier);

        $view = $this->moduleTemplateFactory->create($request);

        $parsedBody = $request->getParsedBody();

        $returnUrl = GeneralUtility::sanitizeLocalUrl(
            (string)($parsedBody['returnUrl'])
        ) ?: null;
        $overviewUrl = $this->uriBuilder->buildUriFromRoute('site_settings');
        $CMD = $parsedBody['CMD'] ?? '';
        $isSave = $CMD === 'save' || $CMD === 'saveclose';
        $isSaveClose = $parsedBody['CMD'] === 'saveclose';
        if (!$isSave) {
            return new RedirectResponse($returnUrl ?? $overviewUrl);
        }

        $changes = $this->computeSettings($site, $parsedBody['settings'] ?? []);
        $this->writeSettings($site, $changes['settings']);

        if ($changes['changes'] !== [] || $changes['deletions'] !== []) {
            $this->getBackendUser()->writelog(
                Type::SITE,
                SettingAction::CHANGE,
                SystemLogErrorClassification::MESSAGE,
                0,
                'Site settings changed for \'%s\': %s',
                [$site->getIdentifier(), json_encode($changes)],
                'site'
            );
            $flashMessage = GeneralUtility::makeInstance(FlashMessage::class, 'Settings updated.', '', ContextualFeedbackSeverity::OK, true);
            $flashMessageService = GeneralUtility::makeInstance(FlashMessageService::class);
            $defaultFlashMessageQueue = $this->flashMessageService->getMessageQueueByIdentifier();
            $defaultFlashMessageQueue->enqueue($flashMessage);
        }

        if ($isSaveClose) {
            return new RedirectResponse($returnUrl ?? $overviewUrl);
        }
        $editRoute = $this->uriBuilder->buildUriFromRoute('site_settings.edit', array_filter([
            'site' => $site->getIdentifier(),
            'returnUrl' => $returnUrl,
        ], static fn(?string $v): bool => $v !== null));
        return new RedirectResponse($editRoute);
    }

    public function dumpAction(ServerRequestInterface $request): ResponseInterface
    {
        $identifier = $request->getQueryParams()['site'] ?? null;
        if ($identifier === null) {
            throw new \RuntimeException('Site identifier to edit must be set', 1724772561);
        }

        $site = $this->siteFinder->getSiteByIdentifier($identifier);
        $parsedBody = $request->getParsedBody();
        $specificSetting = (string)($parsedBody['specificSetting'] ?? '');

        $minify = $specificSetting !== '' ? false : true;
        $changes = $this->computeSettings($site, $parsedBody['settings'] ?? [], $minify);
        $settings = $changes['settings'];
        if ($specificSetting !== '') {
            $value = ArrayUtility::getValueByPath($settings, $specificSetting, '.');
            $settings = ArrayUtility::setValueByPath([], $specificSetting, $value, '.');
        }

        $yamlFileContents = Yaml::dump($settings, 99, 2, Yaml::DUMP_EMPTY_ARRAY_AS_SEQUENCE);

        return new JsonResponse([
            'yaml' => $yamlFileContents,
        ]);
    }

    /**
     * Calculate new settings.yaml file from incoming key/value settings:
     *
     *  * Persist only values that differentiate from default values
     *  * Default values will be removed from settings.yaml
     *  * Existing ("undefined") values in settings.yaml remain unchanged
     *
     *  @todo move into some service
     */
    private function computeSettings(Site $site, array $rawSettings, bool $minify = true)
    {
        $settings = [];
        $localSettings = [];

        $definitions = $this->getDefinitions($site);
        foreach ($rawSettings as $key => $value) {
            $definition = $definitions[$key] ?? null;
            if ($definition === null) {
                throw new \RuntimeException('Unexpected setting ' . $key . ' is not defined', 1724067004);
            }
            $type = $this->settingsTypeRegistry->get($definition->type);
            $settings[$key] = $type->transformValue($value, $definition);
        }

        // Settings from sets – setting values without config/sites/*/settings.yaml applied
        $setSettings = $this->siteSettingsFactory->createSettings(null, [], $site->getSets());
        // Settings from config/sites/*/settings.yaml only (our persistence target)
        $localSettings = $this->siteSettingsFactory->createSettings($site->getIdentifier(), $site->getRawConfiguration()['settings'] ?? [], []);

        // Read existing settings, as we *must* not remove any settings that may be present because of
        //  * "undefined" settings that were supported since TYPO3 v12
        //  * (temporary) inactive sets
        $settingsTree = $localSettings->getAll();

        // Merge incoming settings into current settingsTree
        $changes = [];
        $deletions = [];
        foreach ($settings as $key => $value) {
            if ($minify && $value === $setSettings->get($key)) {
                if (ArrayUtility::isValidPath($settingsTree, $key, '.')) {
                    $settingsTree = $this->removeByPathWithAncestors($settingsTree, $key, '.');
                    $deletions[] = $key;
                }
                continue;
            }
            $settingsTree = ArrayUtility::setValueByPath($settingsTree, $key, $value, '.');
            $changes[] = $key;
        }
        // @todo return object?
        return [
            'settings' => $settingsTree,
            'changes' => $changes,
            'deletions' => $deletions,
        ];
    }

    private function writeSettings(Site $site, array $settings): void
    {
        try {
            $this->siteWriter->writeSettings($site->getIdentifier(), $settings);
        } catch (SiteConfigurationWriteException $e) {
            $flashMessage = GeneralUtility::makeInstance(FlashMessage::class, $e->getMessage(), '', ContextualFeedbackSeverity::ERROR, true);
            $flashMessageService = GeneralUtility::makeInstance(FlashMessageService::class);
            $defaultFlashMessageQueue = $this->flashMessageService->getMessageQueueByIdentifier();
            $defaultFlashMessageQueue->enqueue($flashMessage);
        }
        // @todo: SiteWriter should trigger a cache flush, see #103804
        $this->codeCache->flush();
    }

    protected function addDocHeaderCloseAndSaveButtons(ModuleTemplate $moduleTemplate, Site $site, string $closeUrl): void
    {
        $languageService = $this->getLanguageService();
        $buttonBar = $moduleTemplate->getDocHeaderComponent()->getButtonBar();
        $closeButton = $buttonBar->makeLinkButton()
            ->setTitle($languageService->sL('LLL:EXT:core/Resources/Private/Language/locallang_common.xlf:close'))
            ->setIcon($this->iconFactory->getIcon('actions-close', IconSize::SMALL))
            ->setShowLabelText(true)
            ->setHref($closeUrl);
        $buttonBar->addButton($closeButton, ButtonBar::BUTTON_POSITION_LEFT, 2);
        $saveButton = $buttonBar->makeInputButton()
            ->setName('CMD')
            ->setValue('save')
            ->setForm('sitesettings_form')
            ->setIcon($this->iconFactory->getIcon('actions-document-save', IconSize::SMALL))
            ->setTitle($languageService->sL('LLL:EXT:core/Resources/Private/Language/locallang_common.xlf:save'))
            ->setShowLabelText(true);
        $buttonBar->addButton($saveButton, ButtonBar::BUTTON_POSITION_LEFT, 4);
    }

    protected function addDocHeaderExportButton(ModuleTemplate $moduleTemplate, Site $site): void
    {
        $languageService = $this->getLanguageService();
        $buttonBar = $moduleTemplate->getDocHeaderComponent()->getButtonBar();
        $exportButton = $buttonBar->makeInputButton()
            // @todo
            ->setTitle('YAML Export')
            ->setIcon($this->iconFactory->getIcon('actions-database-export', IconSize::SMALL))
            ->setShowLabelText(true)
            ->setName('CMD')
            ->setValue('export')
            ->setForm('sitesettings_form');
        $buttonBar->addButton($exportButton, ButtonBar::BUTTON_POSITION_RIGHT, 2);
    }

    protected function addDocHeaderSiteConfigurationButton(ModuleTemplate $moduleTemplate, Site $site): void
    {
        $languageService = $this->getLanguageService();
        $buttonBar = $moduleTemplate->getDocHeaderComponent()->getButtonBar();
        $exportButton = $buttonBar->makeLinkButton()
            // @todo
            ->setTitle($languageService->sL('LLL:EXT:backend/Resources/Private/Language/locallang_siteconfiguration.xlf:overview.title'))
            ->setIcon($this->iconFactory->getIcon('actions-open', IconSize::SMALL))
            ->setShowLabelText(true)
            ->setHref((string)$this->uriBuilder->buildUriFromRoute('site_configuration.edit', [
                'site' => $site->getIdentifier(),
                'returnUrl' => $this->uriBuilder->buildUriFromRoute('site_settings.edit', [
                    'site' => $site->getIdentifier(),
                ]),
            ]));
        $buttonBar->addButton($exportButton, ButtonBar::BUTTON_POSITION_RIGHT, 3);
    }

    protected function getSiteTitle(Site $site): string
    {
        $websiteTitle = $site->getConfiguration()['websiteTitle'] ?? '';
        if ($websiteTitle !== '') {
            return $websiteTitle;
        }
        $rootPage = BackendUtility::getRecord('pages', $site->getRootPageId());
        $title = $rootPage['title'] ?? '';
        if ($title !== '') {
            return $title;
        }

        return '(unkown site)';
    }

    protected function getLanguageService(): LanguageService
    {
        return $GLOBALS['LANG'];
    }

    protected function getBackendUser(): BackendUserAuthentication
    {
        return $GLOBALS['BE_USER'];
    }
}
