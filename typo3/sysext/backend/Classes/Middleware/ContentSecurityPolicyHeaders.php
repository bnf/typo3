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
use TYPO3\CMS\Core\Http\NormalizedParams;
use TYPO3\CMS\Core\Http\Uri;
use TYPO3\CMS\Core\Security\ContentSecurityPolicy\NonceProvider;
use TYPO3\CMS\Core\Security\ContentSecurityPolicy\Policy;
use TYPO3\CMS\Core\Security\ContentSecurityPolicy\PolicyDirective;
use TYPO3\CMS\Core\Security\ContentSecurityPolicy\SourceKeyword;
use TYPO3\CMS\Core\Security\ContentSecurityPolicy\SourceScheme;
use TYPO3\CMS\Core\Security\Nonce;
use TYPO3\CMS\Core\Utility\GeneralUtility;

/**
 * @internal
 */
class ContentSecurityPolicyHeaders implements MiddlewareInterface
{
    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $normalizedParams = $request->getAttribute('normalizedParams');
        $nonce = Nonce::create();

        $request = $request->withAttribute('nonce', $nonce);
        $response = $handler->handle($request);

        // @todo parse existing header for `Content-Security-Policy` (backward compatibility)
        $response = $response->withAddedHeader('Content-Security-Policy-Report-Only', $this->createCspHeader($normalizedParams, $nonce));
        return $response;
    }

    protected function createCspHeader(NormalizedParams $normalizedParams, Nonce $nonce): string
    {
        $reportUri = (new Uri($normalizedParams->getSiteUrl() . TYPO3_mainDir))
            ->withQuery('csp=report');
        $policy = (new Policy())
            ->default(SourceKeyword::self)
            ->extend(PolicyDirective::ScriptSrc, $nonce)
            ->extend(PolicyDirective::StyleSrc, SourceKeyword::unsafeInline)
            ->declare(PolicyDirective::StyleSrcAttr, SourceKeyword::unsafeInline)
            ->extend(PolicyDirective::ImgSrc, SourceScheme::data)
            ->declare(PolicyDirective::WorkerSrc, SourceKeyword::self, SourceScheme::blob)
            ->extend(PolicyDirective::FrameSrc, SourceScheme::blob)
            ->report($reportUri);
        return (string)$policy;
    }
}
