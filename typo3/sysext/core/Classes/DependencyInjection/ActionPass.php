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

use PHPStan\PhpDocParser\Ast\Type\IdentifierTypeNode;
use PHPStan\PhpDocParser\Lexer\Lexer;
use PHPStan\PhpDocParser\Parser\ConstExprParser;
use PHPStan\PhpDocParser\Parser\PhpDocParser;
use PHPStan\PhpDocParser\Parser\TokenIterator;
use PHPStan\PhpDocParser\Parser\TypeParser;
use PHPStan\PhpDocParser\ParserConfig;
use Symfony\Component\DependencyInjection\Argument\ServiceLocatorArgument;
use Symfony\Component\DependencyInjection\Attribute\AsTaggedItem;
use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Definition;
use Symfony\Component\TypeInfo\Type;
use Symfony\Component\TypeInfo\Type\ObjectType;
use Symfony\Component\TypeInfo\TypeContext\TypeContextFactory;
use Symfony\Component\TypeInfo\TypeResolver\TypeResolver;
use TYPO3\CMS\Core\Action\ActionContext;
use TYPO3\CMS\Core\Action\ActionDescriptor;
use TYPO3\CMS\Core\Action\ActionExceptionInterface;
use TYPO3\CMS\Core\Action\ActionRegistry;
use TYPO3\CMS\Core\Action\ActionType;
use TYPO3\CMS\Core\JsonSchema\Schema;
use TYPO3\CMS\Core\JsonSchema\SchemaBuilder;
use TYPO3\CMS\Core\JsonSchema\SchemaException;
use TYPO3\CMS\Core\JsonSchema\SchemaStore;

final class ActionPass implements CompilerPassInterface
{
    public function __construct(private string $tagName) {}

    public function process(ContainerBuilder $container): void
    {
        $store = new SchemaStore();
        if (!$container->hasDefinition(ActionRegistry::class)) {
            return;
        }

        $registryDefinition = $container->findDefinition(ActionRegistry::class);

        $items = [];
        foreach ($container->findTaggedServiceIds($this->tagName) as $service => $tags) {
            $definition = $container->findDefinition($service);

            if (!$definition->isAutowired() || $definition->isAbstract()) {
                continue;
            }

            $class = $definition->getClass() ?: $service;

            $classReflection = $container->getReflectionClass($class, false);
            if (!$classReflection) {
                // @todo throw an error here?
                continue;
            }

            foreach ($tags as $tag) {
                $signature = $this->introspect($classReflection, $tag['methodName']);
                //$pathItem = $this->toPathItem($signature, $tag, $container);
                //$operations = array_keys($pathItem->getOperations());
                $route = $tag['route'] ?? $tag['name'];
                $type = ActionType::from($tag['type'] ?? 'fetch');
                $method = $type->getHttpVerb();
                $useBody = !in_array($method, ['GET', /*'HEAD',*/ 'DELETE'], true);
                $id = $route . ':' . strtolower($method);

                $contextParameter = array_map(
                    static fn($parameter): string => $parameter->name,
                    array_filter(
                        $signature->parameters,
                        static fn(object $parameter): bool => $parameter->type instanceof ObjectType && $parameter->type->getClassName() === ActionContext::class
                    )
                );

                $parameterDescriptors = [];
                foreach ($signature->parameters as $parameter) {
                    if (in_array($parameter->name, $contextParameter, true)) {
                        continue;
                    }
                    $schema = $this->buildJsonSchema($parameter->type, $store, 'property:' . $parameter->name, $tag['name']);

                    $httpSource = str_contains($route, '{' . $parameter->name . '}')
                        ? 'route'
                        : ($useBody ? 'body' : 'query');

                    $jsonEncoded = $httpSource === 'query' && ($this->allowsType($schema, 'object') || $this->allowsType($schema, 'array'));

                    $parameterDescriptors[$parameter->name] = [
                        'optional' => $parameter->optional,
                        'schema' => $this->buildSchemaDefinition($schema),
                        'http' => [
                            'source' => $httpSource,
                            'jsonEncoded' => $jsonEncoded,
                        ],
                    ];
                }

                $resultSchema = $this->buildJsonSchema($signature->return, $store, 'return value', $tag['name']);
                $resultDefinition = $this->buildSchemaDefinition($resultSchema);

                $scopes = [];
                if (($tag['scopes'] ?? []) !== []) {
                    foreach ($tag['scopes'] as $scopeId) {
                        $reflector = $container->getReflectionClass($scopeId);
                        if (!$reflector) {
                            throw new \LogicException('Can not reflect scope: ' . $scopeId, 1772188824);
                        }
                        $attributes = $reflector->getAttributes(AsTaggedItem::class);
                        if (count($attributes) !== 1) {
                            throw new \RuntimeException('Expected exactly one AsTaggedItem attribute on scope class: ' . $scopeId, 1772188823);
                        }

                        $scopes[] = $attributes[0]->newInstance()->index;
                    }
                }

                $items[$id] = [
                    ...$tag,
                    'id' => $id,
                    'scopes' => $scopes,
                    'method' => $method,
                    'service' => $service,
                    'route' => $tag['route'] ?? $tag['name'],

                    'errors' => $signature->errors,
                    'parameters' => $parameterDescriptors,
                    'contextParameter' => $contextParameter,
                    'result' => $resultDefinition,
                ];
            }
        }

        $actions = [];
        foreach ($items as $id => $item) {
            $definition = new Definition(ActionDescriptor::class);
            $definition->setAutowired(false);
            $parameters = [];
            foreach ($item as $index => $value) {
                $parameters['$' . $index] = $value;
            }
            $definition->setArguments($parameters);
            $actions[$id] = $definition;
        }

        $registryDefinition->setArgument(
            '$actions',
            new ServiceLocatorArgument($actions)
        );
        $registryDefinition->setArgument(
            '$schemas',
            $this->buildSchemaStoreDefinition($store),
        );
    }

    private function buildSchemaDefinition(?Schema $schema): Definition
    {
        $definition = new Definition(Schema::class);
        $definition->setFactory([null, 'fromJSON']);
        $definition->setArguments([json_encode($schema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)]);
        $definition->setAutowired(false);
        return $definition;
    }

    private function buildSchemaStoreDefinition(SchemaStore $store): Definition
    {
        $definition = new Definition(SchemaStore::class);
        $definition->setAutowired(false);
        $definition->setArgument('$schemas', array_map($this->buildSchemaDefinition(...), $store->getStatic()));
        $definition->setArgument('$dynamicSchemas', $store->getDynamic());
        return $definition;
    }

    /**
     * @return object{
     *   parameters: list<
     *     object{
     *       name: string,
     *       type: Type,
     *       optional: bool,
     *       default: mixed
     *     }
     *   >,
     *   return: Type,
     *   errors: array<class-string<ActionExceptionInterface>, string>
     * }
     */
    private function introspect(\ReflectionClass $classReflection, string $method): object
    {
        $methodReflection = $classReflection->getMethod($method);

        $typeResolver = TypeResolver::create();
        return (object)[
            'parameters' => array_map(
                static fn(\ReflectionParameter $parameter): object => (object)[
                    'name' => $parameter->name,
                    'type' => $typeResolver->resolve($parameter),
                    'optional' => $parameter->isOptional(),
                    'default' => !$parameter->isOptional() ? null : $parameter->getDefaultValue(),
                ],
                $methodReflection->getParameters(),
            ),
            'return' => $typeResolver->resolve($methodReflection),
            'errors' => $this->getErrors($methodReflection),
        ];
    }

    private function getErrors(\ReflectionMethod $methodReflection): array
    {
        $docComment = $methodReflection->getDocComment();
        if ($docComment === false) {
            return [];
        }

        $errors = [];

        $parserConfig = new ParserConfig([]);
        $lexer = new Lexer($parserConfig);
        $constExprParser = new ConstExprParser($parserConfig);
        $typeParser = new TypeParser($parserConfig, $constExprParser);
        $phpDocParser = new PhpDocParser($parserConfig, $typeParser, $constExprParser);

        $tokens = new TokenIterator($lexer->tokenize($docComment));
        $phpDocNode = $phpDocParser->parse($tokens);
        $throwsTags = $phpDocNode->getThrowsTagValues();

        if ($throwsTags !== []) {
            $typeContextFactory = new TypeContextFactory();
            $typeContext = $typeContextFactory->createFromReflection($methodReflection);

            foreach ($throwsTags as $throws) {
                $type = $throws->type;
                if (!($type instanceof IdentifierTypeNode)) {
                    continue;
                }
                // Resolve use-statements via symfony type context
                // @todo is there an easy way without having to use symfony type context?
                $typeName = $typeContext->uses[$type->name] ?? $type->name;
                $implements = @class_implements($typeName);
                if ($implements === false) {
                    continue;
                }
                if (in_array(ActionExceptionInterface::class, $implements, true)) {
                    $errors[$typeName] = $throws->description ?? '';
                }
            }
        }

        return $errors;
    }

    private function buildJsonSchema(Type $type, SchemaStore $store, string $property, string $context): Schema
    {
        try {
            return new SchemaBuilder()->build($type, $store);
        } catch (SchemaException $e) {
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
    }

    private function allowsType(Schema $schema, string $type)
    {
        return $schema->type === $type || (is_array($schema->type) && in_array($type, $schema->type, true));
    }
}
