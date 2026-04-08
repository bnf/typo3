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

namespace TYPO3\CMS\Backend\Action;

use cebe\openapi\Reader;
use cebe\openapi\spec\Components;
use cebe\openapi\spec\Info;
use cebe\openapi\spec\OpenApi;
use cebe\openapi\spec\PathItem;
use cebe\openapi\spec\Paths;
use cebe\openapi\spec\Schema;
use cebe\openapi\spec\SecurityScheme;
use cebe\openapi\spec\Server;
use cebe\openapi\spec\Tag;
use Symfony\Component\DependencyInjection\Attribute\AutowireLocator;
use Symfony\Component\DependencyInjection\ServiceLocator;
use TYPO3\CMS\Core\Action\ActionContext;
use TYPO3\CMS\Core\Action\ActionRegistry;
use TYPO3\CMS\Core\Attribute\AsAction;
use TYPO3\CMS\Core\Information\Typo3Version;
use TYPO3\CMS\Core\Routing\BackendEntryPointResolver;

final readonly class OpenApiSchema
{
    public function __construct(
        private BackendEntryPointResolver $backendEntryPointResolver,
        private ActionRegistry $actionRegistry,
        #[AutowireLocator(
            services: 'typo3.api_route_handler',
        )]
        private ServiceLocator $routeHandlers,
    ) {}

    /**
     * @return object{
     *  components: object{
     *    schemas: object,
     *    securitySchemes: object
     *  },
     *  info: object{
     *    title: string,
     *    version: string
     *  },
     *  openapi: string,
     *  paths: object,
     *  servers: list<object{url: string}>,
     *  tags: list<object{name: string, description: string}>
     * }
     */
    #[AsAction(
        name: 'schema',
    )]
    public function getSchema(
        ActionContext $context
    ): object {
        $translator = $context->translator;
        $request = $context->request;
        $paths = [];

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
                json_encode($this->actionRegistry->getSchema($schema)->toPlainObject('components/schemas')),
                Schema::class
            );
        }

        $securitySchemes = [
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

        $server = $context->request === null ? null : (string)$this->backendEntryPointResolver->getUriFromRequest($context->request);
        $openapi = new OpenApi([
            'openapi' => '3.1.2',
            'info' => new Info([
                'title' => 'TYPO3 API',
                'version' => new Typo3Version()->getVersion(),
            ]),
            'paths' => new Paths($paths),
            'tags' => $tags,
            'components' => new Components([
                'schemas' => $schemas,
                'securitySchemes' => $securitySchemes,
            ]),
            'servers' => $server === null ? [] : [
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
