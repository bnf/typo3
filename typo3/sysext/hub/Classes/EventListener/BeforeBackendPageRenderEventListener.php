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

namespace TYPO3\CMS\Hub\EventListener;

use TYPO3\CMS\Backend\Controller\Event\BeforeBackendPageRenderEvent;
use TYPO3\CMS\Backend\Domain\Model\AccessToken;
use TYPO3\CMS\Backend\Routing\UriBuilder;
use TYPO3\CMS\Core\Attribute\AsEventListener;
use TYPO3\CMS\Core\Authentication\BackendUserAuthentication;
use TYPO3\CMS\Core\Page\PageRenderer;
use TYPO3\CMS\Core\Utility\GeneralUtility;

/**
 * Add data-api-prefix and data-api-token to the backend <body> tag
 *
 * @internal
 */
final readonly class BeforeBackendPageRenderEventListener
{
    public function __construct(
        private PageRenderer $pageRenderer,
        private UriBuilder $uriBuilder
    ) {}

    #[AsEventListener(identifier: 'hub/add-api-token')]
    public function __invoke(BeforeBackendPageRenderEvent $event): void
    {
        $backendUser = $this->getBackendUser();
        $apiPrefix = (string)$this->uriBuilder->buildUriFromRoute('api_prefix');
        $apiToken = (new AccessToken($backendUser->user['username']))->toString();
        $bodyAttributes = [
            'data-api-prefix' => $apiPrefix,
            'data-api-token' => $apiToken,
        ];
        $event->pageRenderer->addBodyContent('<body ' . GeneralUtility::implodeAttributes($bodyAttributes, true) . '>');
    }

    private function getBackendUser(): BackendUserAuthentication
    {
        return $GLOBALS['BE_USER'];
    }
}
