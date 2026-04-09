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

namespace TYPO3\CMS\Hub\Http\Middleware;

use League\OAuth2\Server\Exception\OAuthServerException;
use League\OAuth2\Server\ResourceServer;
use Psr\Http\Message\ResponseFactoryInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;
use TYPO3\CMS\Backend\Http\ActionHandler;
use TYPO3\CMS\Backend\Routing\RouteResult;
use TYPO3\CMS\Core\Localization\LanguageServiceFactory;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Hub\Authentication\AppUserAuthentication;

/**
 * Hooks into the backend request, and checks if an app invoked this request
 * in order to initialize impersonated user configuration and dispatch
 * the action handler.
 *
 * @internal
 */
final readonly class AppResolver implements MiddlewareInterface
{
    public function __construct(
        private ResourceServer $resourceServer,
        private ResponseFactoryInterface $responseFactory,
        private LanguageServiceFactory $languageServiceFactory,
        private ActionHandler $actionHandler,
    ) {}

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        /** @var RouteResult $routeResult */
        $routeResult = $request->getAttribute('routing');
        // @todo add a route option `isAction`/`api` instead?
        $target = $routeResult->getRoute()->getOptions()['target'] ?? null;
        if ($target !== ActionHandler::class . '::handle') {
            return $handler->handle($request);
        }

        if (isset($request->getCookieParams()[$this->getBackendCookieName()])) {
            // pass on to be handled by regular backend action handler
            return $handler->handle($request);
        }

        $handlerName = (string)($routeResult->getArguments()['handler'] ?? '');

        try {
            $request = $this->resourceServer->validateAuthenticatedRequest($request);
            $accessToken = $request->getAttribute('api.access_token');
        } catch (OAuthServerException $exception) {
            return $exception->generateHttpResponse($this->responseFactory->createResponse());
        }

        // Create app user authentication, that create BE_USER
        $user = GeneralUtility::makeInstance(AppUserAuthentication::class, $accessToken);
        //$user->start($request);
        $user->doStart();

        // Prepare the user and language object before calling the app execution process
        $GLOBALS['LANG'] = $this->languageServiceFactory->createFromUserPreferences($user);
        $GLOBALS['BE_USER'] = $user;

        return $this->actionHandler->handle($request);
    }

    public static function getBackendCookieName(): string
    {
        $configuredCookieName = trim((string)($GLOBALS['TYPO3_CONF_VARS']['BE']['cookieName'] ?? ''));
        return $configuredCookieName !== '' ? $configuredCookieName : 'be_typo_user';
    }
}
