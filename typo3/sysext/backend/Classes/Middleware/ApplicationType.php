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
use TYPO3\CMS\Core\Core\SystemEnvironmentBuilder;

final class ApplicationType implements MiddlewareInterface
{
    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $path = $request->getUri()->getPath();
        $normalizedParams = $request->getAttribute('normalizedParams');
        $backendUrl = $normalizedParams->getSitePath() . trim($GLOBALS['TYPO3_CONF_VARS']['BE']['backendUrl'], '/');

        // Add applicationType attribute to request: This is backend and maybe backend ajax.
        $applicationType = SystemEnvironmentBuilder::REQUESTTYPE_BE;
        if (str_starts_with($path, $backendUrl . '/ajax/')) {
            $applicationType |= SystemEnvironmentBuilder::REQUESTTYPE_AJAX;
        }

        return $handler->handle(
            $request->withAttribute('applicationType', $applicationType)
        );
    }
}
