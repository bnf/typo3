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

namespace TYPO3\CMS\Hub\Http;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Log\LoggerInterface;
use TYPO3\CMS\Core\Localization\LanguageServiceFactory;
use TYPO3\CMS\Hub\Authentication\AppUserAuthentication;
use TYPO3\CMS\Hub\Exception\AppNotFoundException;
use TYPO3\CMS\Hub\Model\AppInstruction;
use TYPO3\CMS\Hub\AppRegistry;

/**
 * Endpoint for triggering the app handler.
 *
 * Resolves the payload and calls the actual App Type with the request,
 * the payload, and sends the response in return.
 *
 * At this point, the evaluation etc. all need to have happened.
 *
 * @internal This is a specific controller implementation and is not considered part of the Public TYPO3 API.
 */
class AppHandler
{
    public function __construct(
        private readonly AppRegistry $appRegistry,
        private readonly LoggerInterface $logger,
        private readonly LanguageServiceFactory $languageServiceFactory
    ) {}

    public function handleApp(ServerRequestInterface $request, ?AppInstruction $appInstruction, AppUserAuthentication $user): ResponseInterface
    {
        if ($appInstruction === null) {
            $this->logger->warning('No app given', [
                'request' => $request,
            ]);
            throw new AppNotFoundException('No app given', 1669757255);
        }
        $app = $this->appRegistry->getAppByType($appInstruction->getType());
        if ($app === null) {
            throw new AppNotFoundException('No app found for given app type', 1662458842);
        }

        // Prepare the user and language object before calling the app execution process
        $GLOBALS['LANG'] = $this->languageServiceFactory->createFromUserPreferences($user);
        $GLOBALS['BE_USER'] = $user;

        $payload = $this->getPayload($request);
        $response = $app->react($request, $payload, $appInstruction);
        $this->logger->info('App was handled successfully', [
            'request' => $request,
        ]);
        return $this->buildAppResponse($response);
    }

    protected function getPayload(ServerRequestInterface $request): array
    {
        $body = (string)$request->getBody();

        try {
            $payload = json_decode($body, true, 512, JSON_THROW_ON_ERROR);
            return is_array($payload) ? $payload : [];
        } catch (\JsonException $e) {
            // do nothing
            return [];
        }
    }

    protected function buildAppResponse(ResponseInterface $response): ResponseInterface
    {
        return $response
            ->withHeader('X-TYPO3-App-Success', $response->getStatusCode() >= 200 && $response->getStatusCode() < 300 ? 'true' : 'false');
    }
}
