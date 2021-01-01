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
use TYPO3\CMS\Core\Core\Environment;
use TYPO3\CMS\Core\Http\NormalizedParams;
use TYPO3\CMS\Core\Http\Response;
use TYPO3\CMS\Core\Http\SelfEmittableLazyOpenStream;
use TYPO3\CMS\Core\Middleware\NormalizedParamsAttribute;
use TYPO3\CMS\Core\Utility\GeneralUtility;

/**
 * @internal
 */
class EsmLoader implements MiddlewareInterface
{
    /**
     * Delivers javascript for /typo3/esm/{cacheBust}/path/to/esm/module (without suffix)
     *
     * Intended as fallback, if no webserver rewriterule has been configured.
     * Nginx for example would use following location block:
     *
     *   location /typo3/esm/ {
     *     rewrite ^/typo3/esm/[^/]+(/.*\.esm\.js) $1;
     *   }
     *
     * @param ServerRequestInterface $request
     * @param RequestHandlerInterface $handler
     * @return ResponseInterface
     */
    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $normalizedParams = $request->getAttribute('normalizedParams') ?? NormalizedParams::createFromRequest($request);
        $siteScript = $normalizedParams->getSiteScript();
        if (strpos($siteScript, 'typo3/esm/') !== 0 || substr($siteScript, -7) !== '.esm.js') {
            return $handler->handle($request);
        }

        $pathSegments = explode('/', $siteScript);
        if (count($pathSegments) < 4) {
            return $handler->handle($request);
        }

        array_shift($pathSegments);
        array_shift($pathSegments);
        array_shift($pathSegments);

        $fileName = Environment::getPublicPath() . '/' . implode('/', $pathSegments);
        $absFileName = GeneralUtility::getFileAbsFileName($fileName);

        if (!file_exists($absFileName)) {
            return new Response('php://temp', 404, ['Content-Type' => 'text/javascript']);
        }

        return new Response(
            new SelfEmittableLazyOpenStream($absFileName),
            200,
            [
                'Content-Type' => 'text/javascript',
                'Content-Length' => (string)filesize($absFileName),
                'Last-Modified' => gmdate('D, d M Y H:i:s', filemtime($absFileName)) . ' GMT',
                //@todo send 1year expiry.
            ]
        );
    }
}
