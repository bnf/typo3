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

namespace TYPO3\CMS\Core\Action;

use cebe\openapi\spec\Header;
use cebe\openapi\spec\Link;
use cebe\openapi\spec\MediaType;
use cebe\openapi\spec\OpenApi;
use cebe\openapi\spec\Operation;
use cebe\openapi\spec\Parameter;
use cebe\openapi\spec\PathItem;
use cebe\openapi\spec\Reference;
use cebe\openapi\spec\RequestBody;
use cebe\openapi\spec\Response;
use cebe\openapi\spec\Responses;
use cebe\openapi\spec\Schema;
use cebe\openapi\spec\SecurityRequirement;

/**
 * @internal
 */
final readonly class OpenApiBuilder
{
    public const PROBLEM_SCHEMA = 'ProblemDetails';

    /**
     * Schema of error responses, see RFC 9457
     */
    public function getProblemSchema(): Schema
    {
        return new Schema([
            'type' => 'object',
            'description' => 'Problem details of an error (RFC 9457)',
            'properties' => [
                'type' => [
                    'type' => 'string',
                    'format' => 'uri-reference',
                    'description' => 'Identifies the type of the problem: the URL of the exception code in the TYPO3 exception reference for errors of actions, `about:blank` for problems without semantics beyond the status code',
                ],
                'title' => ['type' => 'string', 'description' => 'Summary of the type of the problem'],
                'status' => ['type' => 'integer', 'description' => 'HTTP status code'],
                'detail' => ['type' => 'string', 'description' => 'Explanation of this occurrence of the problem'],
                'requestId' => ['type' => 'string', 'description' => 'ID of the request the error is logged with, for errors of the server'],
                'errors' => [
                    'type' => 'array',
                    'description' => 'Invalid parameters of the request',
                    'items' => [
                        'type' => 'object',
                        'properties' => [
                            'detail' => ['type' => 'string', 'description' => 'Why the value is invalid'],
                            'pointer' => ['type' => 'string', 'description' => 'JSON pointer to the value in the request body, or in the value of the parameter, as URI fragment'],
                            'parameter' => ['type' => 'string', 'description' => 'Name of the query or path parameter'],
                        ],
                        'required' => ['detail'],
                    ],
                ],
            ],
            'required' => ['type', 'title', 'status'],
        ]);
    }

    public function actionToPathItem(ActionDescriptor $action): PathItem
    {
        //$type = ActionType::from($tag['type'] ?? 'fetch');
        $httpMethod = $action->method;
        $contextParameter = $action->contextParameter;

        $parametersBySource = ['route' => [], 'query' => [], 'body' => []];
        foreach ($action->parameters as $parameterName => $parameter) {
            $parametersBySource[$parameter['http']['source']][$parameterName] = $parameter;
        }
        $routeParameters = $parametersBySource['route'];
        $queryParameters = $parametersBySource['query'];
        $requestBodyContent = $parametersBySource['body'];

        $operation = [
            'operationId' => $action->id,
            'summary' => $action->summary ?? '',
            'description' => $action->description ?? '',
            'x-typo3-context' => $contextParameter,
            'deprecated' => $action->deprecated !== null,
            'tags' => [
                $action->tag ?? 'api',
            ],
            'security' => [
                new SecurityRequirement([
                    'oauth2' => $action->scopes,
                ]),
                new SecurityRequirement([
                    'static' => [],
                ]),
                new SecurityRequirement([
                    'beuser' => [],
                ]),
            ],
        ];

        $responseSchema = $this->toJsonSchema($action, null, true);
        // @todo encode both 200 and 204 if response type is not just null,
        // but nullable (e.g. `?ObjectType`), or throw an exception to disallow this case
        $isCreated = $action->type === ActionType::create->value && $action->location !== null;
        $statusCode = $isCreated ? 201 : ($responseSchema === null ? 204 : 200);

        $headers = [];
        $links = [];
        if ($action->deprecated !== null) {
            $headers['Deprecation'] = new Header([
                'description' => 'Date of the deprecation of this action as structured field date (RFC 9745)',
                'schema' => new Schema(['type' => 'string']),
            ]);
        }
        if ($action->location !== null) {
            $headers['Location'] = new Header([
                'description' => 'URL of the created resource',
                'schema' => new Schema(['type' => 'string', 'format' => 'uri']),
            ]);
            $links['location'] = new Link([
                'operationId' => $action->location['action'],
                'parameters' => $action->location['parameters'],
                'description' => 'The created resource, as announced in the `Location` header',
            ]);
        }

        $operation['responses'] = new Responses([
            (string)$statusCode => new Response([
                ...($responseSchema ?? []),
                'description' => $isCreated ? 'Created' : 'OK',
                ...($headers === [] ? [] : ['headers' => $headers]),
                ...($links === [] ? [] : ['links' => $links]),
            ]),
        ]);

        $problemContent = [
            'application/problem+json' => new MediaType([
                'schema' => new Reference(['$ref' => '#/components/schemas/' . self::PROBLEM_SCHEMA]),
            ]),
        ];
        foreach ($action->errors as $className => $error) {
            $errorCode = (string)$className::getHttpStatusCode();
            $operation['responses'][$errorCode] = new Response([
                'description' => $error,
                'content' => $problemContent,
            ]);
        }
        $operation['responses']['default'] = new Response([
            'description' => 'Error',
            'content' => $problemContent,
        ]);

        if ($routeParameters !== [] || $queryParameters !== []) {
            $operation['parameters'] = [
                ...array_map(
                    fn(string $name): Parameter => new Parameter([
                        'name' => $name,
                        'in' => 'path',
                        // @todo pass default value to schema
                        ...$this->toJsonSchema($action, $name),
                        // openapi requires all path parameters to be always be required
                        'required' => true /* @todo exception if $parameter->optional is true */,
                    ]),
                    array_keys($routeParameters),
                ),
                ...array_map(
                    fn(string $name): Parameter => new Parameter([
                        'name' => $name,
                        'in' => 'query',
                        // @todo pass default value to schema
                        ...$this->toJsonSchema($action, $name),
                        'required' => !$queryParameters[$name]['optional'],
                    ]),
                    array_keys($queryParameters),
                ),
            ];
        }

        if ($requestBodyContent !== []) {
            $operation['requestBody'] = new RequestBody([
                'content' => [
                    'application/json' => new MediaType([
                        'schema' => new Schema([
                            'type' => 'object',
                            'properties' => array_combine(
                                array_keys($requestBodyContent),
                                array_map(
                                    fn(string $name): Schema => $this->toJsonSchema($action, $name, false)['schema'],
                                    array_keys($requestBodyContent),
                                ),
                            ),
                            'required' => array_filter(
                                array_keys($requestBodyContent),
                                static fn(string $name): bool => !$requestBodyContent[$name]['optional'],
                            ),
                        ]),
                    ]),
                ],
                'required' => count(array_filter(array_keys($requestBodyContent), static fn(string $name): bool => !$requestBodyContent[$name]['optional'])) > 0,
            ]);
        }

        if ($action->contentParameter !== null) {
            $operation['requestBody'] = new RequestBody([
                'content' => [
                    'application/octet-stream' => new MediaType([
                        'schema' => new Schema([
                            'type' => 'string',
                            'format' => 'binary',
                        ]),
                    ]),
                ],
                'required' => true,
            ]);
        }

        $pathItem = new PathItem([
            strtolower($httpMethod) => new Operation($operation),
        ]);
        if (!$pathItem->validate()) {
            throw new \RuntimeException('Action "' . $action->id . '" produced invalid path item: ' . json_encode($pathItem->getErrors()), 1774901537);
        }

        return $pathItem;
    }

    private function toJsonSchema(ActionDescriptor $action, ?string $property, ?bool $forceMediaType = null): ?array
    {
        $schema = $property === null ? $action->result : ($action->parameters[$property]['schema'] ?? null);

        if ($schema === null) {
            return null;
        }

        $schema = $schema->toPlainObject('components/schemas');

        // cebe/openapi required associative instead of objects
        $schema = json_decode(json_encode($schema), true);
        $schema = new Schema($schema);

        if ($forceMediaType || ($forceMediaType === null && ($this->allowsType($schema, 'object') || $this->allowsType($schema, 'array')))) {
            return [
                'content' => [
                    'application/json' => new MediaType([
                        'schema' => $schema,
                    ]),
                ],
            ];
        }
        return ['schema' => $schema];
    }

    private function allowsType(Schema $schema, string $type)
    {
        return $schema->type === $type || (is_array($schema->type) && in_array($type, $schema->type, true));
    }
}
