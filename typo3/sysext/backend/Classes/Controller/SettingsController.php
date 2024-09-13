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
use TYPO3\CMS\Backend\Attribute\AsController;
use TYPO3\CMS\Backend\Dto\Settings\EditableSetting;
use TYPO3\CMS\Backend\Routing\UriBuilder;
use TYPO3\CMS\Backend\Template\Components\ButtonBar;
use TYPO3\CMS\Backend\Template\Components\Buttons\DropDown\DropDownItemInterface;
use TYPO3\CMS\Backend\Template\Components\Buttons\DropDown\DropDownToggle;
use TYPO3\CMS\Backend\Template\ModuleTemplate;
use TYPO3\CMS\Backend\Template\ModuleTemplateFactory;
use TYPO3\CMS\Core\Authentication\BackendUserAuthentication;
use TYPO3\CMS\Core\Imaging\IconFactory;
use TYPO3\CMS\Core\Imaging\IconSize;
use TYPO3\CMS\Core\Localization\LanguageService;
use TYPO3\CMS\Core\Page\PageRenderer;
use TYPO3\CMS\Core\Settings\Category;
use TYPO3\CMS\Core\Settings\CategoryAccumulator;
use TYPO3\CMS\Core\Settings\SettingDefinition;
use TYPO3\CMS\Core\Settings\SettingsManager;
use TYPO3\CMS\Core\Settings\SettingsMode;
use TYPO3\CMS\Core\Settings\SettingsRegistry;
use TYPO3\CMS\Core\Settings\SettingsTypeRegistry;
use TYPO3\CMS\Core\Utility\GeneralUtility;

/**
 * Backend controller: The "Settings" module
 *
 * @internal This class is a specific Backend controller implementation and is not considered part of the Public TYPO3 API.
 */
#[AsController]
readonly class SettingsController
{
    public function __construct(
        protected ModuleTemplateFactory $moduleTemplateFactory,
        protected SettingsRegistry $settingsRegistry,
        protected SettingsManager $settingsManager,
        protected SettingsTypeRegistry $settingsTypeRegistry,
        protected PageRenderer $pageRenderer,
        protected UriBuilder $uriBuilder,
        protected IconFactory $iconFactory,
    ) {}

    public function overviewAction(ServerRequestInterface $request): ResponseInterface
    {
        $moduleData = $request->getAttribute('moduleData');
        $targetMode = $request->getQueryParams()['mode'] ?? null;
        if ($targetMode) {
            $newSettingsMode = SettingsMode::tryFrom($targetMode) ?? SettingsMode::BASIC->value;
            $moduleData->set('mode', $newSettingsMode->value);
            $this->getBackendUser()->pushModuleData($moduleData->getModuleIdentifier(), $moduleData->toArray());
        }
        $mode = SettingsMode::tryFrom($moduleData->get('mode') ?? '') ?? SettingsMode::BASIC;
        $returnUrl = GeneralUtility::sanitizeLocalUrl(
            (string)($request->getQueryParams()['returnUrl'] ?? '')
        ) ?: null;
        $overviewUrl = (string)$this->uriBuilder->buildUriFromRoute('settings');

        $view = $this->moduleTemplateFactory->create($request);
        $this->addDocHeaderCloseAndSaveButtons($view, $returnUrl ?? $overviewUrl);
        $this->addDocHeaderViewModeButton($view, $mode);

        $this->pageRenderer->addInlineLanguageLabelFile('EXT:backend/Resources/Private/Language/locallang_copytoclipboard.xlf');
        // @todo create an own xlf file
        $this->pageRenderer->addInlineLanguageLabelFile('EXT:backend/Resources/Private/Language/locallang_sitesettings.xlf');

        $definitions = $this->settingsRegistry->getDefinitions();
        $settings = $this->settingsManager->getSettings('system');

        $categoryAccumulator = new CategoryAccumulator();
        $categories = $categoryAccumulator->getCategories(
            $this->settingsRegistry->getCategoryDefinitions(),
            $this->settingsRegistry->getDefinitions()['system'],
        );

        $categoryEnhancer = function (Category $category) use (&$categoryEnhancer, $settings): Category {
            return new Category(...[
                ...get_object_vars($category),
                'label' => $this->getLanguageService()->sL($category->label),
                'description' => $category->description !== null ? $this->getLanguageService()->sL($category->description) : $category->description,
                'categories' => array_map($categoryEnhancer, $category->categories),
                'settings' => array_map(
                    fn(SettingDefinition $definition): EditableSetting => new EditableSetting(
                        definition: $this->resolveSettingLabels($definition),
                        value: $settings->has($definition->key) ? $settings->get($definition->key) : null,
                        systemDefault: $definition->default,
                        // @todo implement all types
                        typeImplementation: $this->settingsTypeRegistry->has($definition->type) ? $this->settingsTypeRegistry->get($definition->type)->getJavaScriptModule() : '',
                    ),
                    $category->settings
                ),
            ]);
        };

        $categories = array_map(
            $categoryEnhancer,
            $categories
        );

        $view->assign('categories', $categories);
        $view->assign('mode', $mode);
        $view->assign('actionUrl', (string)$this->uriBuilder->buildUriFromRoute('settings.save', array_filter([
            'returnUrl' => $returnUrl,
        ], static fn(?string $v): bool => $v !== null)));
        $view->assign('returnUrl', $returnUrl);

        return $view->renderResponse('Settings/Edit');
    }

    private function resolveSettingLabels(SettingDefinition $definition): SettingDefinition
    {
        $languageService = $this->getLanguageService();
        return new SettingDefinition(...[
            ...get_object_vars($definition),
            'label' => $languageService->sL($definition->label),
            'description' => $definition->description !== null ? $languageService->sL($definition->description) : null,
        ]);
    }

    protected function addDocHeaderCloseAndSaveButtons(ModuleTemplate $moduleTemplate, string $closeUrl): void
    {
        $languageService = $this->getLanguageService();
        $buttonBar = $moduleTemplate->getDocHeaderComponent()->getButtonBar();
        /*
        $closeButton = $buttonBar->makeLinkButton()
            ->setTitle($languageService->sL('LLL:EXT:core/Resources/Private/Language/locallang_common.xlf:close'))
            ->setIcon($this->iconFactory->getIcon('actions-close', IconSize::SMALL))
            ->setShowLabelText(true)
            ->setHref($closeUrl);
        $buttonBar->addButton($closeButton, ButtonBar::BUTTON_POSITION_LEFT, 2);
        */
        $saveButton = $buttonBar->makeInputButton()
            ->setName('CMD')
            ->setValue('save')
            ->setForm('settings_form')
            ->setIcon($this->iconFactory->getIcon('actions-document-save', IconSize::SMALL))
            ->setTitle($languageService->sL('LLL:EXT:core/Resources/Private/Language/locallang_common.xlf:save'))
            ->setShowLabelText(true);
        $buttonBar->addButton($saveButton, ButtonBar::BUTTON_POSITION_LEFT, 4);
    }

    protected function addDocHeaderViewModeButton(ModuleTemplate $moduleTemplate, SettingsMode $mode): void
    {
        $languageService = $this->getLanguageService();
        $buttonBar = $moduleTemplate->getDocHeaderComponent()->getButtonBar();

        $viewModeItems[] = GeneralUtility::makeInstance(DropDownToggle::class)
            ->setActive(($mode === SettingsMode::BASIC))
            ->setHref(
                (string)$this->uriBuilder->buildUriFromRoute(
                    'settings',
                    [
                        'mode' => SettingsMode::BASIC->value,
                    ]
                )
            )
            ->setLabel($languageService->sL('LLL:EXT:backend/Resources/Private/Language/locallang_settingseditor.xlf:settingseditor.mode.basic'))
            ->setIcon($this->iconFactory->getIcon('actions-window', IconSize::SMALL));

        $viewModeItems[] = GeneralUtility::makeInstance(DropDownToggle::class)
            ->setActive(($mode === SettingsMode::ADVANCED))
            ->setHref(
                (string)$this->uriBuilder->buildUriFromRoute(
                    'settings',
                    [
                        'mode' => SettingsMode::ADVANCED->value,
                    ]
                )
            )
            ->setLabel($languageService->sL('LLL:EXT:backend/Resources/Private/Language/locallang_settingseditor.xlf:settingseditor.mode.advanced'))
            ->setIcon($this->iconFactory->getIcon('actions-window-cog', IconSize::SMALL));

        $viewModeButton = $buttonBar->makeDropDownButton()
            ->setLabel($languageService->sL('LLL:EXT:core/Resources/Private/Language/locallang_core.xlf:labels.view'))
            ->setShowLabelText(true);
        foreach ($viewModeItems as $viewModeItem) {
            /** @var DropDownItemInterface $viewModeItem */
            $viewModeButton->addItem($viewModeItem);
        }

        $buttonBar->addButton($viewModeButton, ButtonBar::BUTTON_POSITION_RIGHT, 2);
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
