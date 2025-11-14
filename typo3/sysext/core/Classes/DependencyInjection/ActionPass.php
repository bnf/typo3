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
use cebe\openapi\spec\SecurityRequirement;
use cebe\openapi\Writer;
use PHPStan\PhpDocParser\Ast\Type\IdentifierTypeNode;
use PHPStan\PhpDocParser\Lexer\Lexer;
use PHPStan\PhpDocParser\Parser\ConstExprParser;
use PHPStan\PhpDocParser\Parser\PhpDocParser;
use PHPStan\PhpDocParser\Parser\TokenIterator;
use PHPStan\PhpDocParser\Parser\TypeParser;
use PHPStan\PhpDocParser\ParserConfig;
use Symfony\Component\DependencyInjection\Attribute\AsTaggedItem;
use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\TypeInfo\Type;
use Symfony\Component\TypeInfo\Type\ObjectType;
use Symfony\Component\TypeInfo\TypeContext\TypeContextFactory;
use Symfony\Component\TypeInfo\TypeResolver\TypeResolver;
use TYPO3\CMS\Core\Action\ActionContext;
use TYPO3\CMS\Core\Action\ActionExceptionInterface;
use TYPO3\CMS\Core\Action\ActionRegistry;
use TYPO3\CMS\Core\Action\ActionType;
use TYPO3\CMS\Core\JsonSchema\SchemaBuilder;
use TYPO3\CMS\Core\JsonSchema\SchemaException;

final class ActionPass implements CompilerPassInterface
{
    /**
     * @var array<string, object>
     */
    private array $schemas;

    public function __construct(private string $tagName) {}

    public function process(ContainerBuilder $container)
    {
        $this->schemas = [];
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
                $pathItem = $this->toPathItem($signature, $tag, $container);
                $operations = array_keys($pathItem->getOperations());
                $route = $tag['route'] ?? $tag['name'];
                $id = $route . ':' . implode('_', $operations);
                $items[$id] = [
                    ...$tag,
                    'id' => $id,
                    'method' => ActionType::from($tag['type'] ?? 'fetch')->getHttpVerb(),
                    'service' => $service,
                    'route' => $tag['route'] ?? $tag['name'],
                    'operations' => Writer::writeToJson($pathItem, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                ];
            }
        }

        $schemas = array_map(
            static fn(object $schema): string => json_encode($schema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            /*
            static fn(Schema $schema): string => str_replace(
                '"$ref":"#\\/$defs',
                '"$ref":"#\\/components\\/schemas',
                Writer::writeToJson($schema, JSON_UNESCAPED_UNICODE)
            ),
             */
            $this->schemas,
        );
        $registryDefinition->setArgument('$items', $items);
        $registryDefinition->setArgument('$schemas', $schemas);
        $this->schemas = [];
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
                $implements = class_implements($typeName);
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

    /**
     * @template T
     * @param array<T> $array
     * @return list<T>
     */
    private function filterAndRemove(array &$array, callable $callback): array
    {
        $result = [];
        foreach ($array as $key => $value) {
            if (($callback)($value)) {
                $result[] = $value;
                unset($array[$key]);
            }
        }
        return $result;
    }

    /**
     * @param object{
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
     * } $signature
     */
    private function toPathItem(object $signature, array $tag, ContainerBuilder $container): PathItem
    {
        $name = $tag['name'] ?? '';
        $type = ActionType::from($tag['type'] ?? 'fetch');
        $httpMethod = $type->getHttpVerb();
        $route = $tag['route'] ?? $tag['name'];
        $useBody = !in_array($httpMethod, ['GET', /*'HEAD',*/ 'DELETE'], true);
        $parameters = $signature->parameters;
        $contextParameter = $this->filterAndRemove(
            $parameters,
            static fn(object $parameter): bool => $parameter->type instanceof ObjectType && $parameter->type->getClassName() === ActionContext::class
        );
        $routeParameters = $this->filterAndRemove(
            $parameters,
            static fn(object $parameter): bool => str_contains($route, '{' . $parameter->name . '}'),
        );
        if ($useBody) {
            $requestBodyContent = $parameters;
            $queryParameters = [];
        } else {
            $requestBodyContent = [];
            $queryParameters = $parameters;
        }

        $scopes = [];
        if (($tag['scopes'] ?? []) !== []) {
            foreach ($tag['scopes'] as $scopeId) {
                //$scope = $container->findDefinition($scopeId);
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

        $operation = [
            'summary' => $tag['summary'] ?? '',
            'description' => $tag['description'] ?? '',
            //'description' => 'Handled by `' . $route->getOption('target') . '()`',
            'x-typo3-context' => array_map(static fn(object $parameter) => $parameter->name, $contextParameter),
            'tags' => [
                $tag['tag'] ?? 'api',
            ],
            'security' => [
                new SecurityRequirement([
                    'oauth2' => $scopes,
                ]),
                new SecurityRequirement([
                    'static' => [],
                ]),
                new SecurityRequirement([
                    'beuser' => [],
                ]),
            ],
        ];

        $responseSchema = $this->toJsonSchema($signature->return, 'return value', $name, true);
        // @todo encode both 200 and 204 if response type is not just null,
        // but nullable (e.g. `?ObjectType`), or throw an exception to disallow this case
        $statusCode = $responseSchema === null ? 204 : 200;

        $operation['responses'] = new Responses([
            (string)$statusCode => new Response([
                ...($responseSchema ?? []),
                'description' => 'OK',
            ]),
        ]);

        foreach ($signature->errors as $className => $error) {
            $errorCode = (string)$className::getHttpStatusCode();
            $operation['responses'][$errorCode] = new Response([
                'description' => $error,
            ]);
        }

        if ($routeParameters !== [] || $queryParameters !== []) {
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
                    $queryParameters,
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
                            'required' => array_values(array_map(
                                static fn(object $parameter): string => $parameter->name,
                                array_filter(
                                    $requestBodyContent,
                                    static fn(object $parameter): bool => !$parameter->optional,
                                )
                            )),
                        ]),
                    ]),
                ],
                'required' => count(array_filter($requestBodyContent, static fn(object $parameter): bool => !$parameter->optional)) > 0,
            ]);
        }

        $pathItem = new PathItem([
            strtolower($httpMethod) => new Operation($operation),
        ]);
        if (!$pathItem->validate()) {
            var_dump($pathItem->getErrors());
            exit;
        }

        return $pathItem;
    }

    private function toJsonSchema(Type $type, string $property, string $context, ?bool $forceMediaType = null): ?array
    {
        try {
            $schema = (new SchemaBuilder())->build($type);
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

        if ($schema === null) {
            return null;
        }

        $schema = $schema->toPlainObject();

        if (isset($schema->{'$defs'})) {
            $schemas = (array)$schema->{'$defs'};
            //var_dump($schemas);
            //components->schemas;
            //$schemas = (array)$schema->components->schemas;
            $this->schemas = [
                ...$this->schemas,
                ...$schemas,
            ];
            //unset($schema->components);
            unset($schema->{'$defs'});
            //var_dump(array_keys($schemas));
            $schema->{'x-typo3-schemas'} = array_keys($schemas);
        }

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
