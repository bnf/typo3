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

namespace TYPO3\CMS\Hub\Controller;

use cebe\openapi\spec\MediaType;
use cebe\openapi\spec\Operation;
use cebe\openapi\spec\PathItem;
use cebe\openapi\spec\RequestBody;
use cebe\openapi\spec\Response;
use cebe\openapi\spec\Responses;
use cebe\openapi\spec\Schema;
use League\OAuth2\Server\AuthorizationServer;
use League\OAuth2\Server\Exception\OAuthServerException;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use TYPO3\CMS\Backend\Attribute\AsController;
use TYPO3\CMS\Core\Http\Response as HttpResponse;
use TYPO3\CMS\Core\Http\RouteConfiguration;
use TYPO3\CMS\Core\Http\RouteHandlerInterface;

#[AsController]
final readonly class TokenController implements RouteHandlerInterface
{
    public function __construct(
        private AuthorizationServer $authorizationServer,
    ) {}

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        $response = new HttpResponse();
        if ($request->getMethod() === 'OPTIONS') {
            return $response
                ->withHeader('Access-Control-Allow-Origin', '*')
                ->withHeader('Access-Control-Allow-Headers', 'authorization');
        }
        try {
            // Try to respond to the request
            return $this->authorizationServer
                ->respondToAccessTokenRequest($request, $response)
                // @todo make configurable per App?
                //       (required for MCP inspector)
                ->withHeader('Access-Control-Allow-Origin', '*');
        } catch (OAuthServerException $exception) {
            // All instances of OAuthServerException can be formatted into a HTTP response
            return $exception->generateHttpResponse($response);
        }
    }

    public function getRoutes(): array
    {
        return [
            new RouteConfiguration(
                '/oauth/token',
                new PathItem([
                    'post' => new Operation([
                        'summary' => 'Fetch OAuth access token',
                        'description' => 'Fetch OAuth access token for authorization_code grant type',
                        'tags' => [
                            'oauth',
                        ],
                        'requestBody' => new RequestBody([
                            'content' => [
                                'application/x-www-form-urlencoded' => new MediaType([
                                    'schema' => new Schema([
                                        'type' => 'object',
                                        'properties' => [
                                            'grant_type' => new Schema([
                                                'type' => 'string',
                                                'enum' => ['authorization_code'],
                                            ]),
                                            'code' => new Schema([
                                                'type' => 'string',
                                            ]),
                                            'client_id' => new Schema([
                                                'type' => 'string',
                                            ]),
                                            'client_secret' => new Schema([
                                                'type' => 'string',
                                            ]),
                                            'code_verifier' => new Schema([
                                                'type' => 'string',
                                            ]),
                                            'redirect_uri' => new Schema([
                                                'type' => 'string',
                                            ]),
                                        ],
                                        'required' => [
                                            'grant_type',
                                            'code',
                                            'client_id',
                                            'client_secret',
                                        ],
                                        'additionalProperties' => false,
                                    ]),
                                ]),
                            ],
                        ]),
                        'responses' => new Responses([
                            '200' => new Response([
                                'description' => 'OK',
                                'content' => [
                                    'application/json' => new MediaType([
                                        'schema' => new Schema([
                                            'type' => 'object',
                                            'properties' => [
                                                'token_type' => new Schema([
                                                    'type' => 'string',
                                                    'enum' => [
                                                        'bearer',
                                                    ],
                                                ]),
                                                'expires' => new Schema([
                                                    'type' => 'integer',
                                                ]),
                                                'access_token' => new Schema([
                                                    'type' => 'string',
                                                ]),
                                                'refresh_token' => new Schema([
                                                    'type' => 'string',
                                                ]),
                                            ],
                                            'required' => [
                                                'token_type',
                                                'expires',
                                                'access_token',
                                            ],
                                            'additionalProperties' => false,
                                        ]),
                                    ]),
                                ],
                            ]),
                        ]),
                    ]),
                ])
            ),
        ];
    }
}
