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
use TYPO3\CMS\Backend\Template\ModuleTemplateFactory;
use TYPO3\CMS\Core\Settings\Category;
use TYPO3\CMS\Core\Settings\SettingsRegistry;
use TYPO3\CMS\Core\Settings\SettingsManager;
use TYPO3\CMS\Core\Settings\SettingsTypeRegistry;
use TYPO3\CMS\Core\Site\Entity\Site;
use TYPO3\CMS\Core\Site\Set\CategoryRegistry;
use TYPO3\CMS\Core\Site\Set\SetRegistry;
use TYPO3\CMS\Core\Site\SiteFinder;


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

        return $view->renderResponse('Settings/Edit');
    }

    /*
    public function editAction(ServerRequestInterface $request): ResponseInterface
    {
        $identifier = $request->getQueryParams()['site'] ?? null;
        if ($identifier === null) {
            throw new \RuntimeException('Site identifier to edit must be set', 1713394528);
        }

        $site = $this->siteFinder->getSiteByIdentifier($identifier);
        $view = $this->moduleTemplateFactory->create($request);

        $sets = $this->setRegistry->getSets(...$site->getSets());
        $categories = $this->categoryRegistry->getCategories(...$site->getSets());

        $activeCategory = null;
        $activeCategoryKey = $request->getQueryParams()['category'] ?? null;
        if ($activeCategoryKey !== null) {
            $activeCategory = $this->findCategory($categories, $activeCategoryKey);
            if ($activeCategory === null) {
                throw new \RuntimeException('Invalid category key', 1713394529);
            }
        }

        $definitions = [];
        foreach ($sets as $set) {
            foreach ($set->settingsDefinitions as $settingDefinition) {
                // @todo: handle child-categories as well
                if ($activeCategory !== null && !in_array($activeCategory->key, $settingDefinition->categories, true)) {
                    continue;
                }
                $definitions[] = $settingDefinition;
            }
        }

        $view->assign('site', $site);
        $view->assign('definitions', $definitions);
        $view->assign('categories', $categories);
        $view->assign('category', $activeCategory);

        return $view->renderResponse('SiteSettings/Edit');
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
     */
}
