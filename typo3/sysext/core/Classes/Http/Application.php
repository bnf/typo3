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

namespace TYPO3\CMS\Core\Http;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Symfony\Component\DependencyInjection\Attribute\AutowireInline;
use TYPO3\CMS\Core\Configuration\ConfigurationManager;

/**
 * Entry point for TYPO3
 */
class Application extends AbstractApplication
{
    public function __construct(
        #[AutowireInline(
            class: MiddlewareDispatcher::class,
            arguments: [
                '$kernel' => '@' . RequestHandler::class,
                '$middlewares' => '@core.middlewares',
            ],
        )]
        RequestHandlerInterface $requestHandler,
        protected readonly ConfigurationManager $configurationManager,
    ) {
        $this->requestHandler = $requestHandler;
    }

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        $this->logger?->debug('received request', [
            'uri' => (string)$request->getUri(),
            'method' => $request->getMethod(),
            'query' => $request->getQueryParams(),
            'body' => (string)$request->getBody(),
            'headers' => $request->getHeaders(),
        ]);
        $res = parent::handle($request);
        $this->logger?->debug('responding with: ' . (string)$res->getBody());
        return $res;
    }
}
