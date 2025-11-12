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

namespace TYPO3\CMS\Backend\Controller;

use cebe\openapi\Reader;
use cebe\openapi\spec\Components;
use cebe\openapi\spec\Info;
use cebe\openapi\spec\OAuthFlow;
use cebe\openapi\spec\OAuthFlows;
use cebe\openapi\spec\OpenApi;
use cebe\openapi\spec\Operation;
use cebe\openapi\spec\PathItem;
use cebe\openapi\spec\Paths;
use cebe\openapi\spec\Response;
use cebe\openapi\spec\Responses;
use cebe\openapi\spec\Schema;
use cebe\openapi\spec\SecurityScheme;
use cebe\openapi\spec\Server;
use cebe\openapi\spec\Tag;
use Symfony\Component\DependencyInjection\Attribute\AutowireLocator;
use Symfony\Component\DependencyInjection\ServiceLocator;
use TYPO3\CMS\Backend\Routing\UriBuilder;
use TYPO3\CMS\Core\Action\ActionContext;
use TYPO3\CMS\Core\Action\ActionRegistry;
use TYPO3\CMS\Core\Attribute\AsAction;
use TYPO3\CMS\Core\Information\Typo3Version;
use TYPO3\CMS\Core\Routing\BackendEntryPointResolver;
use TYPO3\CMS\Core\Schema\TcaSchemaFactory;
use TYPO3\CMS\Core\Scope\ScopeRegistry;

/**
 * @todo rename into Action\OpenapiSchema
 */
class OpenApiController
{
    public function __construct(
        private readonly BackendEntryPointResolver $backendEntryPointResolver,
        private readonly TcaSchemaFactory $tcaSchemaFactory,
        private readonly ActionRegistry $actionRegistry,
        private readonly UriBuilder $uriBuilder,
        #[AutowireLocator(
            services: 'typo3.api_route_handler',
        )]
        private readonly ServiceLocator $routeHandlers,
        private ScopeRegistry $scopeRegistry,
    ) {}

    /**
     * @return mixed
     */
    #[AsAction(
        name: 'schema',
    )]
    public function getSchema(
        ActionContext $context
    ): mixed {
        $translator = $context->translator;
        $request = $context->request;
        $paths = [
            /*
            '/test' => new PathItem([
                'description' => 'something',
                'get' => new Operation([
                    'summary' => 'foo',
                    'description' => 'bar',
                    'responses' => new Responses([
                        '200' => new Response([
                            'description' => 'baz',
                            'content' => [
                                'application/json' => [
                                    'schema' => [
                                        'type' => 'string'
                                    ],
                                ],
                            ],
                        ]),
                    ]),
                ]),
            ])
            */
        ];

        $server = (string)$this->backendEntryPointResolver->getUriFromRequest($context->request);

        foreach ($this->actionRegistry->getActions() as $action) {
            $operations = str_replace('"#/$defs/', '"#/components/schemas/', $action->operations);
            $pathItem = Reader::readFromJson($operations, PathItem::class);
            $pathName = '/' . $action->route;
            if (isset($paths[$pathName])) {
                $pathItem = new PathItem([
                    ...$paths[$pathName]->getOperations(),
                    ...$pathItem->getOperations(),
                ]);
            }
            $paths[$pathName] = $pathItem;
        }

        foreach ($this->routeHandlers as $routeHandler) {
            foreach ($routeHandler->getRoutes() as $route) {
                $pathName = $route->route;
                $pathItem = $route->pathItem;
                if (isset($paths[$pathName])) {
                    $pathItem = new PathItem([
                        ...$paths[$pathName]->getOperations(),
                        ...$pathItem->getOperations(),
                    ]);
                }
                $paths[$pathName] = $pathItem;
            }
        }

        $tags = [];
        $tags[] = new Tag([
            'name' => 'api',
            'description' => 'TYPO3 command API',
        ]);
        $tags[] = new Tag([
            'name' => 'record',
            'description' => 'Fetch and mutate TYPO3 records (TcaSchema)',
        ]);

        $schemas = [];
        foreach ($this->actionRegistry->listSchemas() as $schema) {
            $schemas[$schema] = Reader::readFromJson(
                json_encode($this->actionRegistry->getSchema($schema, 'components/schemas')),
                Schema::class
            );
        }
        foreach ($this->tcaSchemaFactory->all() as $schema) {
            $name = 'TYPO3.CMS.Core.Domain.RecordInterface_' . $schema->getName() . '_';
            $schemas[$name] = new Schema([
                'type' => 'object',
                'title' => $schema->getTitle(static fn($label) => $translator->label($label, [], $label)),
                'description' => $name,
                'properties' => array_map(
                    static fn($field) => new Schema([
                        'description' => $translator->label($field->getLabel(), [], $field->getLabel()),
                        'default' => $field->hasDefaultValue() ? $field->getDefaultValue() : null,
                        'type' => match ($field->getType()) {
                            'json' => 'object',
                            // @todo check if $field count(config.items) = 1, otherwise it is a bitset (better be expressed as a map in API)
                            'check' => 'boolean',
                            // @todo
                            'file' => 'integer',
                            'number' => 'integer',
                            default => 'string',
                        },
                        // @todo add `additionalProperties: true` for type json
                        // @todo support defining schematas in type=json and reference them here
                    ]),
                    iterator_to_array($schema->getFields()),
                ),
            ]);
        }

        $authorizationUrl = (string)$this->uriBuilder->buildUriFromRoute('oauth_authorize', [], UriBuilder::ABSOLUTE_URL);
        $tokenUrl = (string)$this->uriBuilder->buildUriFromRoute('oauth_token', [], UriBuilder::ABSOLUTE_URL);

        $scopes = [];
        foreach ($this->scopeRegistry as $identifier => $scope) {
            $scopes[$identifier] = $scope->getName();
        }

        $securitySchemes = [
            'oauth2' => new SecurityScheme([
                'type' => 'oauth2',
                'description' => 'Use OAuth to',
                'flows' => new OAuthFlows([
                    'authorizationCode' => new OAuthFlow([
                        'authorizationUrl' => $authorizationUrl,
                        'tokenUrl' => $tokenUrl,
                        // @todo the `refreshUrl` field is optional,
                        // should we omit it (since it equals `tokenUrl` anyway)?
                        'refreshUrl' => $tokenUrl,
                        'scopes' => $scopes,
                    ]),
                ]),
            ]),
            'static' => new SecurityScheme([
                'type' => 'http',
                'scheme' => 'bearer',
                'bearerFormat' => 'JWT',
            ]),
            // Implicit authentication via TYPO3 backend user cookie
            // (for AJAX based requests)
            // @todo should we list this at all?
            // It is probably not relevant for users of this documentation (but maybe still good to know?)
            'beuser' => new SecurityScheme([
                'type' => 'apiKey',
                'in' => 'cookie',
                'name' => 'be_typo_user',
            ]),
        ];

        $openapi = new OpenApi([
            'openapi' => '3.1.2',
            'info' => new Info([
                'title' => 'TYPO3 API',
                'version' => (new Typo3Version())->getVersion(),
            ]),
            'paths' => new Paths($paths),
            'tags' => $tags,
            'components' => new Components([
                'schemas' => $schemas,
                'securitySchemes' => $securitySchemes,
            ]),
            'servers' => [
                new Server([
                    'url' => rtrim($server, '/') . '/api',
                ]),
            ],
        ]);

        if (!$openapi->validate()) {
            throw new \RuntimeException('OpenAPI Schema is invalid: ' . json_encode($openapi->getErrors()), 1768062644);
        }

        return $openapi->getSerializableData();
    }
}
