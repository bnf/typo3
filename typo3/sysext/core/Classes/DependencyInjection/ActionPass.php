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

namespace TYPO3\CMS\Core\DependencyInjection;

use cebe\openapi\spec\MediaType;
use cebe\openapi\spec\Operation;
use cebe\openapi\spec\Parameter;
use cebe\openapi\spec\PathItem;
use cebe\openapi\spec\RequestBody;
use cebe\openapi\spec\Response;
use cebe\openapi\spec\Responses;
use cebe\openapi\spec\Schema;
use cebe\openapi\Writer;
use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\TypeInfo\Type;
use Symfony\Component\TypeInfo\TypeResolver\TypeResolver;
use TYPO3\CMS\Core\Action\ActionRegistry;
use TYPO3\CMS\Core\Action\SchemaBuilder;

final readonly class ActionPass implements CompilerPassInterface
{
    public function __construct(private string $tagName) {}

    public function process(ContainerBuilder $container)
    {
        if (!$container->hasDefinition(ActionRegistry::class)) {
            return;
        }

        $registryDefinition = $container->findDefinition(ActionRegistry::class);

        $items = [];
        foreach ($container->findTaggedServiceIds($this->tagName) as $id => $tags) {
            $definition = $container->findDefinition($id);
            if (!$definition->isAutowired() || $definition->isAbstract()) {
                continue;
            }

            $class = $definition->getClass() ?: $id;

            $classReflection = $container->getReflectionClass($class, false);
            if (!$classReflection) {
                // @todo throw an error here?
                continue;
            }

            foreach ($tags as $tag) {
                $signature = $this->introspect($classReflection, $tag['methodName']);
                $items[] = [
                    ...$tag,
                    'id' => $id,
                    'route' => $tag['route'] ?? $tag['name'],
                    'operations' => Writer::writeToJson($this->toPathItem($signature, $tag), JSON_UNESCAPED_UNICODE),
                ];
            }
        }

        $registryDefinition->setArgument('$items', $items);
    }

    private function introspect(\ReflectionClass $classReflection, string $method): array
    {
        $methodReflection = $classReflection->getMethod($method);

        $typeResolver = TypeResolver::create();
        return [
            'params' => array_map(
                static fn(\ReflectionParameter $parameter): object => (object)[
                    'name' => $parameter->name,
                    'type' => $typeResolver->resolve($parameter),
                    'optional' => $parameter->isOptional(),
                    'default' => !$parameter->isOptional() ? null : $parameter->getDefaultValue(),
                ],
                $methodReflection->getParameters(),
            ),
            'return' => $typeResolver->resolve($methodReflection),
        ];
    }

    private function toPathItem(array $signature, array $tag): PathItem
    {
        $operations = [];
        $name = $tag['name'] ?? '';
        $httpMethods = $tag['method'] ?? 'GET';
        $route = $tag['route'] ?? $tag['name'];
        if (is_string($httpMethods)) {
            $httpMethods = [$httpMethods];
        }
        foreach ($httpMethods as $httpMethod) {
            $isParameter = false;
            if (in_array($httpMethod, ['GET', 'HEAD', 'DELETE'], true)) {
                $isParameter = true;
            }
            $requestBodyContent = array_filter(
                $signature['params'],
                static fn(object $parameter): bool => !$isParameter && !str_contains($route, '{' . $parameter->name . '}'),
            );
            $parameters = array_filter(
                $signature['params'],
                static fn(object $parameter): bool => $isParameter && !str_contains($route, '{' . $parameter->name . '}'),
            );
            $routeParameters = array_filter(
                $signature['params'],
                static fn(object $parameter): bool => str_contains($route, '{' . $parameter->name . '}'),
            );

            $operation = [
                'summary' => $tag['summary'] ?? null,
                'description' => $tag['description'] ?? null,
                //'description' => 'Handled by `' . $route->getOption('target') . '()`',
                'tags' => [
                    'api',
                ],
                'responses' => new Responses([
                    '200' => new Response($this->toJsonSchema($signature['return'], 'return value', $name, true)),
                ]),
            ];

            if ($routeParameters !== [] || $parameters !== []) {
                $operation['parameters'] = [
                    ...array_map(
                        fn(object $parameter): Parameter => new Parameter([
                            'name' => $parameter->name,
                            'in' => 'path',
                            // @todo pass default value to schema
                            ...$this->toJsonSchema($parameter->type, 'property:' . $parameter->name, $name),
                            // openapi requires all path parameters to be always be required
                            'required' => true /* @todo exception if $parameter->optional is true */,
                        ]),
                        $routeParameters,
                    ),
                    ...array_map(
                        fn(object $parameter): Parameter => new Parameter([
                            'name' => $parameter->name,
                            'in' => 'query',
                            // @todo pass default value to schema
                            ...$this->toJsonSchema($parameter->type, 'property:' . $parameter->name, $name),
                            'required' => !$parameter->optional,
                        ]),
                        $parameters,
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
                                    array_map(
                                        static fn(object $parameter): string => $parameter->name,
                                        $requestBodyContent,
                                    ),
                                    array_map(
                                        fn(object $parameter): Schema => $this->toJsonSchema($parameter->type, 'property:' . $parameter->name, $name, false)['schema'],
                                        $requestBodyContent,
                                    ),
                                ),
                                'required' => array_map(
                                    static fn(object $parameter): string => $parameter->name,
                                    array_filter(
                                        $requestBodyContent,
                                        static fn(object $parameter): bool => !$parameter->optional,
                                    )
                                ),
                            ]),
                        ]),
                    ],
                    'required' => count(array_filter($requestBodyContent, static fn(object $parameter): bool => !$parameter->optional)) > 0,
                ]);
            }

            $operations[strtolower($httpMethod)] = new Operation($operation);
        }
        return new PathItem([
            ...$operations,
        ]);
    }

    private function toJsonSchema(Type $type, string $property, string $context, ?bool $forceMediaType = null): array
    {
        try {
            $schema = (new SchemaBuilder())->build($type);
        } catch (\RuntimeException $e) {
            throw new \RuntimeException(
                sprintf(
                    'Failed to map type "%s" of %s in "%s"',
                    (string)$type,
                    $property,
                    $context,
                ),
                1766049926,
                $e,
            );
        }
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
