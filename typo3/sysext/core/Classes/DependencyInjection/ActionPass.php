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
use cebe\openapi\spec\Response;
use cebe\openapi\spec\Responses;
use cebe\openapi\Writer;
use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\TypeInfo\Type;
use Symfony\Component\TypeInfo\TypeResolver\TypeResolver;
use TYPO3\CMS\Core\Action\ActionRegistry;
use TYPO3\CMS\Core\Action\SchemaMapper;

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
                $method = $tag['method'];
                $methodName = $tag['methodName'];

                $signature = $this->introspect($classReflection, $methodName);
                $items[] = [
                    'id' => $id,
                    'methodName' => $methodName,
                    'method' => $tag['method'],
                    'description' => $tag['description'],
                    'route' => $tag['route'] ?? $tag['name'],
                    'operations' => Writer::writeToJson($this->toPathItem($signature, $tag), JSON_UNESCAPED_UNICODE),
                    /*
                    'params' => array_map(
                        static fn (Type $type): string => (string)$type,
                        $signature['params'],
                    ),
                    'return' => (string)$signature['return'],
                     */
                ];
                //var_dump($this->introspect($classReflection, $method));
                //exit;
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
        $operations['get'] = new Operation([
            'summary' => $tag['name'] ?? null,
            'description' => $tag['description'] ?? null,
            //'description' => 'Handled by `' . $route->getOption('target') . '()`',
            'tags' => [
                'api',
            ],
            'parameters' => array_map(
                fn(object $parameter): Parameter => new Parameter([
                    'name' => $parameter->name,
                    //'in' => 'path',
                    'in' => 'query',
                    // @todo pass default value to schema
                    ...$this->toJsonSchema($parameter->type, 'property:' . $parameter->name, $name),
                    'required' => !$parameter->optional,
                ]),
                $signature['params'],
            ),
            'responses' => new Responses([
                '200' => new Response($this->toJsonSchema($signature['return'], 'return value', $name, true)),
            ]),
        ]);
        return new PathItem([
            //'description' => $routeIdentifier,
            ...$operations,
        ]);
    }

    private function toJsonSchema(Type $type, string $property, string $context, bool $forceMediaType = false): array
    {
        try {
            $schema = (new SchemaMapper())->map($type);
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
        if ($forceMediaType || $schema->type === 'object' || $schema->type === 'array') {
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
}
