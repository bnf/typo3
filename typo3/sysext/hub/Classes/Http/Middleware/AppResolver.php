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

use Psr\Http\Message\ResponseFactoryInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\StreamFactoryInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Uid\Uuid;
use TYPO3\CMS\Backend\Http\ActionHandler;
use TYPO3\CMS\Backend\Routing\RouteResult;
use TYPO3\CMS\Core\Security\JwtTrait;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Hub\Authentication\AppUserAuthentication;
use TYPO3\CMS\Hub\Http\AppHandler;
use TYPO3\CMS\Hub\Repository\AppRepository;

/**
 * Hooks into the backend request, and checks if a app is triggered,
 * if so, jump directly to the AppHandler.
 *
 * @internal This is a specific Request controller implementation and is not considered part of the Public TYPO3 API.
 */
class AppResolver implements MiddlewareInterface
{
    use JwtTrait;

    public function __construct(
        private readonly LoggerInterface $logger,
        private readonly AppHandler $appHandler,
        private readonly AppRepository $appRepository,
        private readonly ResponseFactoryInterface $responseFactory,
        private readonly StreamFactoryInterface $streamFactory,
    ) {}

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        /** @var RouteResult $routeResult */
        $routeResult = $request->getAttribute('routing');
        // @todo add a route option `isAction`/`api` instead?
        $target = $routeResult->getRoute()->getOptions()['target'] ?? null;
        if ($target !== ActionHandler::class . '::dispatch') {
            return $handler->handle($request);
        }

        $token = $this->resolveAppToken($request);
        $appIdentifier = '';
        $secretKey = '';
        if ($token) {
            $data = self::decodeJwt($token, self::createSigningKeyFromEncryptionKey(self::class));
            if (is_object($data) && $data->mode === 'static') {
                $appIdentifier = (string)($data->identifier ?? '');
                $secretKey = (string)($data->secret ?? '');
            }
        }

        // Security check
        $handlerName = (string)($routeResult->getArguments()['handler'] ?? '');

        if ($secretKey === '' || $appIdentifier === '' || !Uuid::isValid($appIdentifier)) {
            if (isset($request->getCookieParams()[$this->getBackendCookieName()])) {
                // pass on to be handled by AppHandler::handleApiInBackendUserContext
                return $handler->handle($request);
            }
            return $this->getFailureResponse('Invalid information', $request);
        }

        $app = $this->appRepository->getAppRecordByIdentifier($appIdentifier);
        if ($app === null) {
            return $this->getFailureResponse('No app found for given app', $request, 404);
        }

        if (!$app->isSecretValid($secretKey)) {
            return $this->getFailureResponse('Secret no longer valid', $request, 401);
        }

        // Handle app user authentication
        $user = GeneralUtility::makeInstance(AppUserAuthentication::class);
        $user->setAppInstruction($app);
        $user->start($request);

        return $this->appHandler->handleApp($request, $handlerName, $app, $user);
    }

    protected function resolveAppToken(ServerRequestInterface $request): string
    {
        $authorizationHeader = $request->getHeader('authorization')[0]
            ?? $request->getHeader('redirect_http_authorization')[0]
            ?? '';

        [$scheme, $token] = array_pad(explode(' ', $authorizationHeader, 2), 2, '');

        if (strtolower($scheme) === 'bearer') {
            return $token;
        }
        return $request->getHeaderLine('x-api-key');
    }

    protected function getFailureResponse(
        string $errorMessage,
        ServerRequestInterface $request,
        int $statusCode = 400
    ): ResponseInterface {
        $this->logger->warning($errorMessage, ['request' => $request]);

        return $this->responseFactory
            ->createResponse($statusCode)
            ->withHeader('Content-Type', 'application/json')
            ->withBody(
                $this->streamFactory->createStream((string)json_encode(['success' => false, 'error' => $errorMessage]))
            );
    }

    public static function getBackendCookieName(): string
    {
        $configuredCookieName = trim((string)($GLOBALS['TYPO3_CONF_VARS']['BE']['cookieName'] ?? ''));
        return $configuredCookieName !== '' ? $configuredCookieName : 'be_typo_user';
    }

}
