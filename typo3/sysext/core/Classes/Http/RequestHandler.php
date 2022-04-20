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

use Psr\Container\ContainerInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\RequestHandlerInterface;
use TYPO3\CMS\Backend\Http\Application as BackendApplication;
use TYPO3\CMS\Frontend\Http\Application as FrontendApplication;

final class RequestHandler implements RequestHandlerInterface
{
    public function __construct(
        protected readonly ContainerInterface $container,
    ) {
    }

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        $path = $request->getUri()->getPath();
        $normalizedParams = $request->getAttribute('normalizedParams');
        $backendUrl = $normalizedParams->getSitePath() . trim($GLOBALS['TYPO3_CONF_VARS']['BE']['backendUrl'], '/');

        if ($this->container->has(BackendApplication::class) && (
            $path === $backendUrl || str_starts_with($path, $backendUrl . '/')
        )) {
            return $this->container->get(BackendApplication::class)->handle($request);
        }

        if ($this->container->has(FrontendApplication::class)) {
            return $this->container->get(FrontendApplication::class)->handle($request);
        }

        return new Response(null, 404);
    }
}
