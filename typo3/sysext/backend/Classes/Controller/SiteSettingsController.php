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
                'siteTitle' => $this->getSiteTitle($site),
                'localSettings' => $this->siteSettingsFactory->createSettings($site->getIdentifier(), $site->getRawConfiguration()['settings'] ?? [], []),
            ];
        }

        $view->assign('sites', $sites);

        return $view->renderResponse('SiteSettings/Overview');
    }

    private function getDefinitions(Site $site, ?Category $category = null): array
    {
        $sets = $this->setRegistry->getSets(...$site->getSets());
        $definitions = [];
        foreach ($sets as $set) {
            foreach ($set->settingsDefinitions as $settingDefinition) {
                // @todo: handle child-categories as well
                if ($category !== null && !in_array($category->key, $settingDefinition->categories, true)) {
                    continue;
                }
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

        $site = $this->siteFinder->getSiteByIdentifier($identifier);
        $view = $this->moduleTemplateFactory->create($request);
        $this->addDocHeaderCloseAndSaveButtons($view, $site);
        // @todo: take security (sudo action?)
        $this->addDocHeaderExportButton($view, $site);
        $this->pageRenderer->addInlineLanguageLabelFile('EXT:backend/Resources/Private/Language/locallang_copytoclipboard.xlf');

        $categories = $this->categoryRegistry->getCategories(...$site->getSets());

        $activeCategory = null;
        $activeCategoryKey = $request->getQueryParams()['category'] ?? null;
        if ($activeCategoryKey !== null) {
            $activeCategory = $this->findCategory($categories, $activeCategoryKey);
            if ($activeCategory === null) {
                throw new \RuntimeException('Invalid category key', 1724075961);
            }
        }

        $definitions = $this->getDefinitions($site, $activeCategory);
        $setSettings = $this->siteSettingsFactory->createSettings(null, [], $site->getSets());
        // create a fresh Settings instance instead of using
        // $site->getSettings() which might be cache-stale
        $settings = $this->siteSettingsFactory->createSettings(
            $site->getIdentifier(),
            $site->getRawConfiguration()['settings'] ?? [],
            $site->getSets()
        );

        $editableSettings = [];
        foreach ($definitions as $definition) {
            $value = $settings->get($definition->key);
            $type = $this->settingsTypeRegistry->get($definition->type);
            $editableSettings[] = new EditableSetting(
                definition: $definition,
                value: $value,
                systemDefault: $setSettings->get($definition->key),
                status: 'none',
                warnings: [],
                typeImplementation: $type->getJavaScriptModule(),
            );
        }

        $view->assign('editableSettings', $editableSettings);
        $view->assign('siteIdentifier', $site->getIdentifier());
        $view->assign('siteTitle', $this->getSiteTitle($site));
        $view->assign('categories', $categories);
        $view->assign('category', $activeCategory);
        $view->assign('dumpUri', (string)$this->uriBuilder->buildUriFromRoute('site_settings.dump', ['site' => $site->getIdentifier()]));

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

        $overviewRoute = $this->uriBuilder->buildUriFromRoute('site_settings');
        $CMD = $parsedBody['CMD'] ?? '';
        $isSave = $CMD === 'save' || $CMD === 'saveclose';
        $isSaveClose = $parsedBody['CMD'] === 'saveclose';
        if (!$isSave) {
            return new RedirectResponse($overviewRoute);
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
            return new RedirectResponse($overviewRoute);
        }
        $editRoute = $this->uriBuilder->buildUriFromRoute('site_settings.edit', ['site' => $site->getIdentifier()]);
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

    private function findCategory(array $categories, string $key): ?Category
    {
        foreach ($categories as $category) {
            if ($category->key === $key) {
                return $category;
            }
            $possibleCategory = $this->findCategory($category->categories ?? [], $key);
            if ($possibleCategory !== null) {
                return $possibleCategory;
            }
        }
        return null;
    }

    protected function addDocHeaderCloseAndSaveButtons(ModuleTemplate $moduleTemplate, Site $site): void
    {
        $languageService = $this->getLanguageService();
        $buttonBar = $moduleTemplate->getDocHeaderComponent()->getButtonBar();
        $closeButton = $buttonBar->makeLinkButton()
            ->setTitle($languageService->sL('LLL:EXT:core/Resources/Private/Language/locallang_common.xlf:close'))
            ->setIcon($this->iconFactory->getIcon('actions-close', IconSize::SMALL))
            ->setShowLabelText(true)
            ->setHref((string)$this->uriBuilder->buildUriFromRoute('site_settings', ['site' => $site->getIdentifier()]))
            ->setClasses('t3js-scheduler-close');
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
        $exportButton = $buttonBar->makeLinkButton()
            ->setTitle($languageService->sL('LLL:EXT:core/Resources/Private/Language/locallang_common.xlf:close'))
            // @todo
            ->setTitle('YAML Export')
            ->setIcon($this->iconFactory->getIcon('actions-database-export', IconSize::SMALL))
            ->setShowLabelText(true)
            ->setDataAttributes([
                'form' => 'sitesettings_form',
            ])
            ->setHref((string)$this->uriBuilder->buildUriFromRoute('site_settings.dump', ['site' => $site->getIdentifier()]))
            ->setClasses('t3js-sitesettings-export');
        $buttonBar->addButton($exportButton, ButtonBar::BUTTON_POSITION_RIGHT, 2);
        $this->pageRenderer->loadJavaScriptModule('@typo3/backend/settings/editor/export-button.js');
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
