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
use TYPO3\CMS\Backend\Routing\UriBuilder;
use TYPO3\CMS\Core\Scope\ScopeRegistry;

/**
 * @internal This is a specific Request controller implementation and is not considered part of the Public TYPO3 API.
 */
final readonly class Metadata implements MiddlewareInterface
{
    public function __construct(
        private ResponseFactoryInterface $responseFactory,
        private StreamFactoryInterface $streamFactory,
        private UriBuilder $uriBuilder,
        private ScopeRegistry $scopeRegistry,
    ) {}

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $normalizedParams = $request->getAttribute('normalizedParams');
        $uri = $normalizedParams->getRequestUri();

        return match (true) {
            str_starts_with($uri, '/.well-known/oauth-authorization-server') =>
                $this->renderAuthorizationServerMetadata($request),
            default => $handler->handle($request),
        };
    }

    /**
     * OAuth 2.0 Authorization Server Metadata
     *
     * https://datatracker.ietf.org/doc/html/rfc8414
     */
    public function renderAuthorizationServerMetadata(ServerRequestInterface $request): ResponseInterface
    {
        $normalizedParams = $request->getAttribute('normalizedParams');

        if ($request->getMethod() === 'OPTIONS') {
            return $this->withCorsHeaders($this->responseFactory->createResponse());
        }

        $payload = json_encode([
            'issuer' => $normalizedParams->getSiteUrl(),
            'authorization_endpoint' => (string)$this->uriBuilder->buildUriFromRoute('oauth_authorize', [], UriBuilder::ABSOLUTE_URL),
            'token_endpoint' => (string)$this->uriBuilder->buildUriFromRoute('oauth_token', [], UriBuilder::ABSOLUTE_URL),
            //'token_endpoint_auth_methods_supported' => ['client_secret_basic', 'private_key_jwt'],
            'token_endpoint_auth_methods_supported' => ['client_secret_basic'],
            // @todo check
            'token_endpoint_auth_signing_alg_values_supported' => ['HS256', 'RS256', 'ES256'],
            //'userinfo_endpoint' => 'https://server.example.com/userinfo',
            //'jwks_uri' => 'https://server.example.com/jwks.json',
            //'registration_endpoint' => 'https://server.example.com/register',
            // @todo
            'scopes_supported' => $this->scopeRegistry->getIdentifiers(),
            'response_types_supported' => ['code', 'code token'],
            //'service_documentation' => 'http://server.example.com/service_documentation.html',
            //'ui_locales_supported' => ['en-US', 'en-GB', 'en-CA', 'fr-FR', 'fr-CA']
            'ui_locales_supported' => [],
        ]);

        $response = $this->responseFactory
            ->createResponse(200)
            ->withHeader('Content-Type', 'application/json')
            ->withBody(
                $this->streamFactory->createStream($payload)
            );
        return $this->withCorsHeaders($response);
    }

    private function withCorsHeaders(ResponseInterface $response): ResponseInterface
    {
        return $response
            ->withHeader('Access-Control-Allow-Origin', '*')
            ->withHeader('Access-Control-Allow-Headers', 'mcp-protocol-version');
    }
}
