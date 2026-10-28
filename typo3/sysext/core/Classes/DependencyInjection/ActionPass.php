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
use Symfony\Component\DependencyInjection\Reference;
use Symfony\Component\TypeInfo\Type;
use Symfony\Component\TypeInfo\Type\ObjectType;
use Symfony\Component\TypeInfo\TypeContext\TypeContextFactory;
use Symfony\Component\TypeInfo\TypeResolver\TypeResolver;
use TYPO3\CMS\Core\Action\ActionContext;
use TYPO3\CMS\Core\Action\ActionDescriptor;
use TYPO3\CMS\Core\Action\ActionExceptionInterface;
use TYPO3\CMS\Core\Action\ActionRegistry;
use TYPO3\CMS\Core\Action\ActionType;
use TYPO3\CMS\Core\Action\LinkResolver;
use TYPO3\CMS\Core\Action\ParameterSource;
use TYPO3\CMS\Core\Action\Target;
use TYPO3\CMS\Core\Action\UploadedContent;
use TYPO3\CMS\Core\Attribute\ActionParameter;
use TYPO3\CMS\Core\JsonSchema\DynamicSchemaProviderRegistry;
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
        $actionIdsByMethod = [];
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
                $route = $tag['route'];
                $type = ActionType::from($tag['type'] ?? 'fetch');
                $method = $type->getHttpVerb();
                $version = array_key_exists('version', $tag) ? $tag['version'] : 1;
                if ($version !== null && $version < 1) {
                    throw new \LogicException(sprintf('Action "%s" has invalid version %d', $route, $version), 1793608038);
                }
                $id = $tag['id'] ?? $type->value . '_' . preg_replace(
                    '/[^a-zA-Z0-9_]/',
                    '_',
                    preg_replace('#/{([^}]+)}#', '_by_\1', $route)
                ) . ($version > 1 ? '_v' . $version : '');
                // Common restriction of tool names by AI providers
                if (!preg_match('/^[a-zA-Z][a-zA-Z0-9_-]{0,63}$/', $id)) {
                    throw new \LogicException(sprintf('Action "%s" of %s::%s is not a valid identifier (letters, digits, "_" and "-", up to 64 characters)%s', $id, $class, $tag['methodName'], isset($tag['id']) ? '' : ', set one explicitly'), 1793785202);
                }
                if (isset($items[$id])) {
                    throw new \LogicException(sprintf('Action "%s" is defined twice', $id), 1793608039);
                }
                $targets = array_map(
                    static fn(string $target): string => Target::from($target)->value,
                    $tag['targets'] ?? array_map(static fn(Target $target): string => $target->value, Target::cases()),
                );
                if ($targets === []) {
                    throw new \LogicException(sprintf('Action "%s" has no targets', $id), 1793627863);
                }

                $contextParameter = array_map(
                    static fn($parameter): string => $parameter->name,
                    array_filter(
                        $signature->parameters,
                        static fn(object $parameter): bool => $parameter->type instanceof ObjectType && $parameter->type->getClassName() === ActionContext::class
                    )
                );

                $contentParameters = array_values(array_map(
                    static fn($parameter): string => $parameter->name,
                    array_filter(
                        $signature->parameters,
                        static fn(object $parameter): bool => $parameter->type instanceof ObjectType && $parameter->type->getClassName() === UploadedContent::class
                    )
                ));
                if (count($contentParameters) > 1 || ($contentParameters !== [] && !in_array($method, ['POST', 'PUT'], true))) {
                    throw new \LogicException(sprintf('Action "%s" may receive the request body in one parameter of a POST or PUT request only', $id), 1793350053);
                }
                $contentParameter = $contentParameters[0] ?? null;
                if ($contentParameter !== null && in_array(Target::ai->value, $targets, true)) {
                    throw new \LogicException(sprintf('Action "%s" receives uploaded content, which can not be passed by AI tools yet', $id), 1793627864);
                }
                // The request body is either passed as content parameter or contains JSON encoded parameters
                $useBody = !in_array($method, ['GET', /*'HEAD',*/ 'DELETE'], true) && $contentParameter === null;

                $parameterDescriptors = [];
                foreach ($signature->parameters as $parameter) {
                    if (in_array($parameter->name, $contextParameter, true) || $parameter->name === $contentParameter) {
                        continue;
                    }
                    $schema = $this->buildJsonSchema($parameter->type, $store, 'property:' . $parameter->name, $id);

                    $isRouteParameter = str_contains($route, '{' . $parameter->name . '}');
                    $defaultSource = $isRouteParameter ? ParameterSource::route : ($useBody ? ParameterSource::body : ParameterSource::query);
                    $source = $parameter->source ?? $defaultSource;
                    if ($source !== $defaultSource
                        && ($isRouteParameter || $source === ParameterSource::route || ($source === ParameterSource::body && !$useBody))
                    ) {
                        throw new \LogicException(sprintf('Parameter "%s" of action "%s" cannot be passed in %s', $parameter->name, $id, $source->value), 1793115276);
                    }
                    $httpSource = $source->value;

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

                $resultSchema = $this->buildJsonSchema($signature->return, $store, 'return value', $id);
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

                $actionIdsByMethod[$class . '::' . $tag['methodName']] = $id;
                $items[$id] = [
                    ...$tag,
                    'id' => $id,
                    'version' => $version,
                    'deprecated' => $tag['deprecated'] ?? null,
                    'targets' => array_values(array_unique($targets)),
                    'scopes' => $scopes,
                    'method' => $method,
                    'service' => $service,
                    'route' => $route,

                    'errors' => $signature->errors,
                    'parameters' => $parameterDescriptors,
                    'contextParameter' => $contextParameter,
                    'contentParameter' => $contentParameter,
                    'result' => $resultDefinition,
                ];
            }
        }

        foreach ($items as $id => $item) {
            if (($item['location'] ?? null) !== null) {
                [$linkedClass, $linkedMethod] = $item['location']['action'];
                $linkedId = $actionIdsByMethod[ltrim($linkedClass, '\\') . '::' . $linkedMethod] ?? null;
                if ($linkedId === null) {
                    throw new \LogicException(sprintf('Location of action "%s" refers to %s::%s, which is no action', $id, $linkedClass, $linkedMethod), 1793709237);
                }
                $items[$id]['location']['action'] = $linkedId;
                $this->validateLocation($items[$id], $items);
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
        $registryDefinition->setArgument('$actionIdsByMethod', $actionIdsByMethod);
        $registryDefinition->setArgument(
            '$schemas',
            $this->buildSchemaStoreDefinition($store, $container),
        );
    }

    /**
     * @param array<string, mixed> $item
     * @param array<string, array<string, mixed>> $items
     */
    private function validateLocation(array $item, array $items): void
    {
        $location = $item['location'];
        if (($item['type'] ?? ActionType::fetch->value) !== ActionType::create->value) {
            throw new \LogicException(sprintf('Action "%s" announces a location, which is supported for actions of type create only', $item['id']), 1793709236);
        }
        $linkedAction = $items[$location['action']];
        if (array_diff($item['targets'], $linkedAction['targets']) !== []) {
            throw new \LogicException(sprintf('Location of action "%s" refers to action "%s", which is not offered through all of its targets', $item['id'], $location['action']), 1793709238);
        }
        foreach ($location['parameters'] as $name => $expression) {
            if (!isset($linkedAction['parameters'][$name])) {
                throw new \LogicException(sprintf('Location of action "%s" passes unknown parameter "%s"', $item['id'], $name), 1793709239);
            }
            $expression = LinkResolver::parseExpression($expression);
            if ($expression['source'] !== 'result' && ($item['parameters'][$expression['name']]['http']['source'] ?? null) !== $expression['source']) {
                throw new \LogicException(sprintf('Location of action "%s" refers to unknown %s parameter "%s"', $item['id'], $expression['source'], $expression['name']), 1793709240);
            }
        }
        foreach ($linkedAction['parameters'] as $name => $parameter) {
            if (!$parameter['optional'] && !isset($location['parameters'][$name])) {
                throw new \LogicException(sprintf('Location of action "%s" lacks parameter "%s"', $item['id'], $name), 1793709241);
            }
        }
    }

    private function buildSchemaDefinition(?Schema $schema): Definition
    {
        $definition = new Definition(Schema::class);
        $definition->setFactory([null, 'fromJSON']);
        $definition->setArguments([json_encode($schema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)]);
        $definition->setAutowired(false);
        return $definition;
    }

    private function buildSchemaStoreDefinition(SchemaStore $store, ContainerBuilder $container): Definition
    {
        $definition = new Definition(SchemaStore::class);
        $definition->setAutowired(false);
        $definition->setArgument('$schemas', array_map($this->buildSchemaDefinition(...), $store->getStatic()));
        $definition->setArgument('$dynamicSchemas', $store->getDynamic());
        $definition->setArgument('$dynamicSchemaProviderRegistry', new Reference(DynamicSchemaProviderRegistry::class));
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
                    'source' => ($parameter->getAttributes(ActionParameter::class)[0] ?? null)?->newInstance()->source,
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
            return (new SchemaBuilder())->build($type, $store);
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
