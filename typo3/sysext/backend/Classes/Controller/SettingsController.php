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
use TYPO3\CMS\Backend\Template\ModuleTemplateFactory;
use TYPO3\CMS\Core\Settings\Category;
use TYPO3\CMS\Core\Settings\CategoryAccumulator;
use TYPO3\CMS\Core\Settings\SettingsManager;
use TYPO3\CMS\Core\Settings\SettingsRegistry;
use TYPO3\CMS\Core\Settings\SettingsTypeRegistry;

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
        protected SettingsTypeRegistry $settingsTypeRegistry
    ) {}

    public function overviewAction(ServerRequestInterface $request): ResponseInterface
    {
        $view = $this->moduleTemplateFactory->create($request);

        $definitions = $this->settingsRegistry->getDefinitions();
        $settings = $this->settingsManager->getSettings('system');
        $extensions = $this->settingsManager->getSettings('extensions');

        $view->assign('definitions', $definitions['system']);
        $view->assign('settings', $settings);

        $categoryAccumulator = new CategoryAccumulator();
        $categories = $categoryAccumulator->getCategories(
            $this->settingsRegistry->getCategoryDefinitions(),
            $this->settingsRegistry->getDefinitions()['system'],
        );

        $activeCategory = null;
        $activeCategoryKey = $request->getQueryParams()['category'] ?? null;
        if ($activeCategoryKey !== null) {
            $activeCategory = $this->findCategory($categories, $activeCategoryKey);
            if ($activeCategory === null) {
                throw new \RuntimeException('Invalid category key', 1724075962);
            }
        }

        $editableSettings = [];
        foreach ($this->filterDefinitions($definitions['system'], $activeCategory) as $definition) {
            $value = $settings->has($definition->key) ? $settings->get($definition->key) : $definition->default;
            if (!$this->settingsTypeRegistry->has($definition->type)) {
                // @todo
                continue;
            }
            $type = $this->settingsTypeRegistry->get($definition->type);
            $editableSettings[] = new EditableSetting(
                definition: $definition,
                value: $value,
                systemDefault: $definition->default,
                status: 'none',
                warnings: [],
                typeImplementation: $type->getJavaScriptModule(),
            );
        }
        $view->assign('editableSettings', $editableSettings);
        $view->assign('categories', $categories);
        $view->assign('category', $activeCategory);

        return $view->renderResponse('Settings/Edit');
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

    private function filterDefinitions(iterable $settingsDefinitions, ?Category $category = null): array
    {
        $definitions = [];
        foreach ($settingsDefinitions as $settingDefinition) {
            // @todo: handle child-categories as well
            if ($category !== null && !in_array($category->key, $settingDefinition->categories, true)) {
                continue;
            }
            $definitions[$settingDefinition->key] = $settingDefinition;
        }
        return $definitions;
    }
}
