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

namespace TYPO3\CMS\Backend\Middleware;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;
use TYPO3\CMS\Core\Context\Context;
use TYPO3\CMS\Core\Scope\ScopeRegistry;
use TYPO3\CMS\Core\Scope\ScopeUser;

/**
 * @internal
 */
readonly class BackendScopes implements MiddlewareInterface
{
    public function __construct(
        private Context $context,
        private ScopeRegistry $scopeRegistry,
    ) {}

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        if ($this->context->getAspect('backend.user')->isLoggedIn()) {
            $scopes = [];
            foreach ($this->scopeRegistry as $identifier => $scope) {
                if ($scope->allowedForUser(new ScopeUser($GLOBALS['BE_USER']))) {
                    $scopes[$identifier] = $scope;
                }
            }
            $request = $request->withAttribute('api.scopes', $scopes);
        }
        return $handler->handle($request);
    }
}
