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
use cebe\openapi\spec\Info;
use cebe\openapi\spec\MediaType;
use cebe\openapi\spec\OpenApi;
use cebe\openapi\spec\Operation;
use cebe\openapi\spec\PathItem;
use cebe\openapi\spec\Response;
use cebe\openapi\spec\Responses;
use cebe\openapi\spec\Schema;
use cebe\openapi\spec\Server;
use cebe\openapi\spec\Tag;
use cebe\openapi\Writer;
use Psr\Http\Message\ResponseFactoryInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\StreamFactoryInterface;
use TYPO3\CMS\Backend\Attribute\AsController;
use TYPO3\CMS\Backend\Routing\Router;
use TYPO3\CMS\Backend\Routing\UriBuilder;
use TYPO3\CMS\Core\Action\ActionRegistry;
use TYPO3\CMS\Core\Information\Typo3Version;
use TYPO3\CMS\Core\Localization\LanguageServiceFactory;
use TYPO3\CMS\Core\Package\PackageManager;
use TYPO3\CMS\Core\Routing\BackendEntryPointResolver;
use TYPO3\CMS\Core\Schema\TcaSchemaFactory;

#[AsController]
class OpenApiController
{
    public function __construct(
        private readonly ResponseFactoryInterface $responseFactory,
        private readonly StreamFactoryInterface $streamFactory,
        private readonly UriBuilder $uriBuilder,
        private readonly Router $router,
        private readonly PackageManager $packageManager,
        private readonly BackendEntryPointResolver $backendEntryPointResolver,
        private readonly LanguageServiceFactory $languageServiceFactory,
        private readonly TcaSchemaFactory $tcaSchemaFactory,
        private readonly ActionRegistry $actionRegistry,
    ) {}

    public function getSchema(ServerRequestInterface $request): ResponseInterface
    {
        $lang = $this->languageServiceFactory->create('default');
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

        $server = (string)$this->backendEntryPointResolver->getUriFromRequest($request);

        $usedPackages = [];
        foreach ($this->router->getRoutes() as $routeIdentifier => $route) {
            $methods = $route->getMethods() ?: ['GET'];
            $packageName = $route->getOption('packageName');
            if (!$packageName) {
                continue;
            }
            $packageKey = $this->packageManager->getPackage($route->getOption('packageName'))->getPackageKey();
            if ($route->getOption('ajax')) {
                $usedPackages[$packageKey] = true;
                $uri = str_replace(
                    $server,
                    '/',
                    (string)$this->uriBuilder->buildUriFromRoute($routeIdentifier, [], UriBuilder::ABSOLUTE_URL),
                );
                //$suffix = '';
                //if (!$route->hasOption('access') || $route->getOption('access') !== 'public') {
                //    $suffix = '?token={token}';
                //}
                //$uri = $route->getPath() . $suffix;
                $operations = [];
                foreach ($methods as $method) {
                    $operations[strtolower($method)] = new Operation([
                        'summary' => $routeIdentifier,
                        'description' => 'Handled by `' . $route->getOption('target') . '()`',
                        'tags' => [
                            $packageKey,
                        ],
                        'responses' => new Responses([
                            '200' => new Response([
                                'description' => 'baz',
                                'content' => [
                                    'application/json' => new MediaType([
                                        'schema' => new Schema([
                                            'type' => 'string',
                                        ]),
                                    ]),
                                ],
                            ]),
                        ]),
                    ]);
                }
                $paths[$uri] = new PathItem([
                    //'description' => $routeIdentifier,
                    ...$operations,
                ]);
            }
        }

        foreach ($this->actionRegistry->getItems() as $action) {
            $paths['/api/' . $action['route']] = Reader::readFromJson($action['operations'], PathItem::class);
        }

        $tags = [];
        $tags[] = new Tag([
            'name' => 'api',
            'description' => 'TYPO3 command API',
        ]);
        foreach ($usedPackages as $packageKey => $_) {
            $tags[] = new Tag([
                'name' => $packageKey,
                'description' => $this->packageManager->getPackage($packageKey)->getPackageMetaData()->getDescription(),
            ]);
        }

        $schemas = [];
        foreach ($this->tcaSchemaFactory->all() as $schema) {
            $schemas[$schema->getName()] = new Schema([
                'type' => 'object',
                'title' => $schema->getTitle($lang->sL(...)),
                'properties' => array_map(
                    static fn($field) => new Schema([
                        'description' => $lang->sL($field->getLabel()) ?: $field->getLabel(),
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

        $openapi = new OpenApi([
            'openapi' => '3.1.2',
            'info' => new Info([
                'title' => 'TYPO3 API',
                'version' => (new Typo3Version())->getVersion(),
            ]),
            'paths' => $paths,
            'tags' => $tags,
            'components' => [
                'schemas' => $schemas,
            ],
            'servers' => [
                new Server([
                    'url' => rtrim($server, '/'),
                ]),
            ],
        ]);

        $json = Writer::writeToJson($openapi);

        return $this->responseFactory
            ->createResponse(200)
            ->withHeader('Content-Type', 'application/json')
            ->withBody(
                $this->streamFactory->createStream($json)
            );
    }
}
