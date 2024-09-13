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
use TYPO3\CMS\Backend\Template\ModuleTemplateFactory;
use TYPO3\CMS\Core\Localization\LanguageService;
use TYPO3\CMS\Core\Page\PageRenderer;
use TYPO3\CMS\Core\Settings\Category;
use TYPO3\CMS\Core\Settings\CategoryAccumulator;
use TYPO3\CMS\Core\Settings\SettingDefinition;
use TYPO3\CMS\Core\Settings\SettingsManager;
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
    ) {}

    public function overviewAction(ServerRequestInterface $request): ResponseInterface
    {
        $returnUrl = GeneralUtility::sanitizeLocalUrl(
            (string)($request->getQueryParams()['returnUrl'] ?? '')
        ) ?: null;

        $view = $this->moduleTemplateFactory->create($request);

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

    protected function getLanguageService(): LanguageService
    {
        return $GLOBALS['LANG'];
    }
}
