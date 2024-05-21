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
use TYPO3\CMS\Core\Site\Set\CategoryRegistry;
use TYPO3\CMS\Core\Site\Set\SetRegistry;
use TYPO3\CMS\Core\Site\SiteFinder;

/**
 * Backend controller: The "Site settings" module
 *
 * @internal This class is a specific Backend controller implementation and is not considered part of the Public TYPO3 API.
 */
#[AsController]
class SiteSettingsController
{
    public function __construct(
        protected readonly ModuleTemplateFactory $moduleTemplateFactory,
        protected readonly SiteFinder $siteFinder,
        protected readonly SetRegistry $setRegistry,
        protected readonly CategoryRegistry $categoryRegistry,
    ) {}

    public function overviewAction(ServerRequestInterface $request): ResponseInterface
    {
        $view = $this->moduleTemplateFactory->create($request);
        $view->assign('sites', $this->siteFinder->getAllSites());

        return $view->renderResponse('SiteSettings/Overview');
    }

    public function editAction(ServerRequestInterface $request): ResponseInterface
    {
        $identifier = $request->getQueryParams()['site'] ?? null;
        if ($identifier === null) {
            throw new \RuntimeException('Site identifier to edit must be set', 1713394528);
        }

        $description = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus vestibulum massa vel consectetur dictum. Etiam gravida tortor quis nisi gravida rutrum. Morbi quis semper urna.';

        $site = $this->siteFinder->getSiteByIdentifier($identifier);
        $view = $this->moduleTemplateFactory->create($request);

        $sets = $this->setRegistry->getSets(...$site->getSets());
        \TYPO3\CMS\Extbase\Utility\DebuggerUtility::var_dump($sets);
        // @todo: apply available settings to categories
        $categories = $this->categoryRegistry->getCategories(...$site->getSets());

        $view->assign('site', $site);
        $view->assign('settings', $site->getSettings());
        $view->assign('categories', $categories);

        return $view->renderResponse('SiteSettings/Edit');
    }
}
