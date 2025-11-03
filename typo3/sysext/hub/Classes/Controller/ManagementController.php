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

namespace TYPO3\CMS\Hub\Controller;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use TYPO3\CMS\Backend\Attribute\AsController;
use TYPO3\CMS\Backend\Routing\UriBuilder;
use TYPO3\CMS\Backend\Template\Components\ComponentFactory;
use TYPO3\CMS\Backend\Template\Components\MultiRecordSelection\Action;
use TYPO3\CMS\Backend\Template\ModuleTemplate;
use TYPO3\CMS\Backend\Template\ModuleTemplateFactory;
use TYPO3\CMS\Core\Imaging\IconFactory;
use TYPO3\CMS\Core\Imaging\IconSize;
use TYPO3\CMS\Core\Localization\LanguageService;
use TYPO3\CMS\Core\Pagination\SimplePagination;
use TYPO3\CMS\Hub\Pagination\DemandedArrayPaginator;
use TYPO3\CMS\Hub\Repository\AppDemand;
use TYPO3\CMS\Hub\Repository\AppRepository;

/**
 * The System > App module: Rendering the listing of hub.
 *
 * @internal This class is a specific Backend controller implementation and is not part of the TYPO3's Core API.
 */
#[AsController]
class ManagementController
{
    public function __construct(
        private readonly UriBuilder $uriBuilder,
        private readonly IconFactory $iconFactory,
        private readonly ModuleTemplateFactory $moduleTemplateFactory,
        private readonly AppRepository $appRepository,
        private readonly ComponentFactory $componentFactory,
    ) {}

    public function overviewAction(ServerRequestInterface $request): ResponseInterface
    {
        $view = $this->moduleTemplateFactory->create($request);
        $demand = AppDemand::fromRequest($request);

        $this->registerDocHeaderButtons($view, $request->getAttribute('normalizedParams')->getRequestUri(), $demand);
        $view->makeDocHeaderModuleMenu();

        $appRecords = $this->appRepository->getAppRecords($demand);
        $paginator = new DemandedArrayPaginator($appRecords, $demand->getPage(), $demand->getLimit(), $this->appRepository->countAll($demand));
        $pagination = new SimplePagination($paginator);

        $requestUri = $request->getAttribute('normalizedParams')->getRequestUri();
        $languageService = $this->getLanguageService();

        return $view->assignMultiple([
            'demand' => $demand,
            'paginator' => $paginator,
            'pagination' => $pagination,
            'actions' => [
                new Action(
                    'edit',
                    [
                        'idField' => 'uid',
                        'tableName' => 'sys_app',
                        'returnUrl' => $requestUri,
                    ],
                    'actions-open',
                    'LLL:EXT:core/Resources/Private/Language/locallang_core.xlf:cm.edit'
                ),
                new Action(
                    'delete',
                    [
                        'idField' => 'uid',
                        'tableName' => 'sys_app',
                        'title' => $languageService->sL('LLL:EXT:hub/Resources/Private/Language/module.xlf:labels.delete.title'),
                        'content' => $languageService->sL('LLL:EXT:hub/Resources/Private/Language/module.xlf:labels.delete.message'),
                        'ok' => $languageService->sL('LLL:EXT:core/Resources/Private/Language/locallang_core.xlf:cm.delete'),
                        'cancel' => $languageService->sL('LLL:EXT:core/Resources/Private/Language/locallang_core.xlf:labels.cancel'),
                        'returnUrl' => $requestUri,
                    ],
                    'actions-edit-delete',
                    'LLL:EXT:core/Resources/Private/Language/locallang_core.xlf:cm.delete'
                ),
            ],
        ])->renderResponse('Management/Overview');
    }

    protected function registerDocHeaderButtons(ModuleTemplate $view, string $requestUri, AppDemand $demand): void
    {
        $languageService = $this->getLanguageService();

        $newRecordButton = $this->componentFactory->createLinkButton()
            ->setHref((string)$this->uriBuilder->buildUriFromRoute(
                'record_edit',
                [
                    'edit' => ['sys_app' => ['new']],
                    'module' => 'integrations_hub',
                    'returnUrl' => (string)$this->uriBuilder->buildUriFromRoute('integrations_hub'),
                ]
            ))
            ->setShowLabelText(true)
            ->setTitle($languageService->sL('LLL:EXT:hub/Resources/Private/Language/module.xlf:app_create'))
            ->setIcon($this->iconFactory->getIcon('actions-plus', IconSize::SMALL));
        $view->getDocHeaderComponent()->getButtonBar()->addButton($newRecordButton);

        $view->getDocHeaderComponent()->setShortcutContext(
            routeIdentifier: 'integrations_hub',
            displayName: $languageService->sL('LLL:EXT:reactions/Resources/Private/Language/module.xlf:title'),
            arguments: array_filter([
                'demand' => $demand->getParameters(),
                'orderField' => $demand->getOrderField(),
                'orderDirection' => $demand->getOrderDirection(),
            ])
        );
    }

    protected function getLanguageService(): LanguageService
    {
        return $GLOBALS['LANG'];
    }
}
