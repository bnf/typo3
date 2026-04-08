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

use cebe\openapi\spec\MediaType;
use cebe\openapi\spec\OpenApi;
use cebe\openapi\spec\Operation;
use cebe\openapi\spec\Parameter;
use cebe\openapi\spec\PathItem;
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
    public function actionToPathItem(ActionDescriptor $action): PathItem
    {
        $name = $action->name;
        //$type = ActionType::from($tag['type'] ?? 'fetch');
        $httpMethod = $action->method;
        $route = $action->route;
        $useBody = !in_array($httpMethod, ['GET', /*'HEAD',*/ 'DELETE'], true);

        $parameters = $action->parameters;
        $contextParameter = $action->contextParameter;

        $routeParameters = [];
        foreach ($parameters as $name => $parameter) {
            if (str_contains($route, '{' . $name . '}')) {
                $routeParameters[$name] = $parameter;
                unset($parameters[$name]);
            }
        }

        if ($useBody) {
            $requestBodyContent = $parameters;
            $queryParameters = [];
        } else {
            $requestBodyContent = [];
            $queryParameters = $parameters;
        }

        $operation = [
            'summary' => $action->summary ?? '',
            'description' => $action->description ?? '',
            'x-typo3-context' => $contextParameter,
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
        $statusCode = $responseSchema === null ? 204 : 200;

        $operation['responses'] = new Responses([
            (string)$statusCode => new Response([
                ...($responseSchema ?? []),
                'description' => 'OK',
            ]),
        ]);

        foreach ($action->errors as $className => $error) {
            $errorCode = (string)$className::getHttpStatusCode();
            $operation['responses'][$errorCode] = new Response([
                'description' => $error,
            ]);
        }

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

        $pathItem = new PathItem([
            strtolower($httpMethod) => new Operation($operation),
        ]);
        if (!$pathItem->validate()) {
            throw new \RuntimeException('Action "' . $name . '" produced invalid path item: ' . json_encode($pathItem->getErrors()), 1774901537);
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
