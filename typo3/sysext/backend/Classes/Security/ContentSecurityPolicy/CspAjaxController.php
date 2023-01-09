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

namespace TYPO3\CMS\Backend\Security\ContentSecurityPolicy;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use TYPO3\CMS\Backend\Attribute\Controller;
use TYPO3\CMS\Core\Authentication\BackendUserAuthentication;
use TYPO3\CMS\Core\Http\JsonResponse;
use TYPO3\CMS\Core\Http\NullResponse;

#[Controller]
class CspAjaxController
{
    public function __construct(protected readonly CspRepository $repository) {}

    public function handleRequest(ServerRequestInterface $request): ResponseInterface
    {
        if (!$this->isSystemMaintainer()) {
            return (new NullResponse())->withStatus(500);
        }
        return $this->dispatchAction($request)
            ?? (new NullResponse())->withStatus(500);
    }

    protected function dispatchAction(ServerRequestInterface $request): ?ResponseInterface
    {
        $action = $request->getParsedBody()['action'] ?? null;
        if ($action === 'fetch') {
            return new JsonResponse($this->repository->findAll());
        }
        return null;
    }

    protected function isSystemMaintainer(): bool
    {
        // @todo sysMnt status did not seem to be checked for AJAX routes...
        $backendUser = $GLOBALS['BE_USER'] ?? null;
        return $backendUser instanceof BackendUserAuthentication && $backendUser->isSystemMaintainer();
    }
}
