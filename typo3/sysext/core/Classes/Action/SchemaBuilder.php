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

//use cebe\openapi\spec\Schema;
//use Symfony\Component\PropertyInfo\Extractor\PhpDocExtractor;
//use Symfony\Component\PropertyInfo\Extractor\ReflectionExtractor;
//use Symfony\Component\PropertyInfo\PropertyInfoExtractor;
use Symfony\Component\TypeInfo\Type;
use Symfony\Component\TypeInfo\Type\ArrayShapeType;
use Symfony\Component\TypeInfo\Type\BackedEnumType;
use Symfony\Component\TypeInfo\Type\BuiltinType;
use Symfony\Component\TypeInfo\Type\CollectionType;
use Symfony\Component\TypeInfo\Type\EnumType;
use Symfony\Component\TypeInfo\Type\GenericType;
use Symfony\Component\TypeInfo\Type\IntersectionType;
use Symfony\Component\TypeInfo\Type\NullableType;
use Symfony\Component\TypeInfo\Type\ObjectType;
use Symfony\Component\TypeInfo\Type\TemplateType;
use Symfony\Component\TypeInfo\Type\UnionType;
use Symfony\Component\TypeInfo\TypeContext\TypeContext;
use Symfony\Component\TypeInfo\TypeContext\TypeContextFactory;
use Symfony\Component\TypeInfo\TypeIdentifier;
use Symfony\Component\TypeInfo\TypeResolver\StringTypeResolver;
use Symfony\Component\TypeInfo\TypeResolver\TypeResolver;
use TYPO3\CMS\Core\Attribute\Serialization\IntersectWithParent;

/**
 * @internal
 */
final class SchemaBuilder
{
    /**
     * @var array<string, Schema>
     * @todo use a locally scoped context object and make this class read-only again
     */
    private array $defs = [];

    public function build(Type $type): ?Schema
    {
        try {
            if ($type instanceof BuiltinType && $type->getTypeIdentifier() === TypeIdentifier::VOID) {
                return null;
            }
            $schema = $this->map($type, true);
        } catch (\RuntimeException $e) {
            throw new \RuntimeException('Failed to map: ' . (string)$type, 1766045968, $e);
        }
        if ($this->defs !== []) {
            $schema['$defs'] = $this->defs;
            $this->defs = [];
        }
        return new Schema($schema);
    }

    private function map(Type $type, bool $toplevel = false): array
    {
        return match (true) {
            $type instanceof UnionType => $this->mapUnion($type),
            $type instanceof IntersectionType => $this->mapIntersection($type),
            $type instanceof CollectionType => $this->mapCollection($type),
            $type instanceof ObjectType => $this->mapObject($type, null, null, null, $toplevel),
            $type instanceof BuiltinType => $this->mapBuiltin($type),
            $type instanceof GenericType => $this->mapGeneric($type, $toplevel),
            $type instanceof TemplateType => $this->mapTemplate($type),
            default => throw new \RuntimeException('Type to json mapping not implemented: ' . (string)$type, 1766044681),
        };
    }

    private function mapUnion(UnionType $type): array
    {
        if ($type instanceof NullableType) {
            $schema = $this->map($type->getWrappedType());
            if (is_string($schema['type'] ?? null)) {
                $schema['type'] = [$schema['type'], 'null'];
                return $schema;
            }
        }
        return [
            'anyOf' => array_map(
                fn(Type $subtype): array => $this->map($subtype),
                $type->getTypes(),
            ),
        ];
    }

    private function mapIntersection(IntersectionType $type): array
    {
        return [
            'allOf' => array_map(
                fn(Type $subtype): array => $this->map($subtype),
                $type->getTypes(),
            ),
        ];
    }

    private function mapCollection(CollectionType $type): array
    {
        if ($type instanceof ArrayShapeType) {
            if ($type->isList()) {
                throw new \RuntimeException('array shaped lists are not supported', 1766046759);
            }
            $keys = array_keys($type->getShape());
            $required = array_values(array_filter($keys, static fn(string $property): bool => !$type->getShape()[$property]['optional']));
            if ($required === []) {
                throw new \RuntimeException('array shaped values must have at least one non-optional key to be unambiguously mappable to/from PHP array to JSON object', 1766047831);
            }
            return [
                'type' => 'object',
                'x-typo3-type' => 'array',
                'properties' => array_combine($keys, array_map(
                    fn(string $property): array => $this->map($type->getShape()[$property]['type']),
                    $keys,
                )),
                'required' => $required,
                'additionalProperties' => $type->isSealed() ? false : $this->map($type->getExtraValueType()),
            ];
        }
        if ($type->isList()) {
            return [
                'type' => 'array',
                'items' => $this->map($type->getCollectionValueType()),
            ];
        }
        $keyType = $type->getCollectionKeyType();
        if (!$keyType->isIdentifiedBy(TypeIdentifier::STRING)) {
            throw new \RuntimeException('Type to json mapping not implemented for non-string indexed generics: ' . (string)$type, 1766044682);
        }
        return [
            'type' => 'object',
            // @todo ObjectStorage
            'x-typo3-type' => 'array',
            'additionalProperties' => $this->map($type->getCollectionValueType()),
        ];
    }

    private function mapObject(
        ObjectType $type,
        ?TypeContext $context = null,
        ?string $schemaName = null,
        ?string $title = null,
        bool $toplevel = false
    ): array {
        if ($type instanceof EnumType) {
            return [
                // @todo: INT enum's will be ugly to use (as only integers will be exposed publicly)
                ...$this->map($type instanceof BackedEnumType ? $type->getBackingType() : Type::string()),
                'enum' => array_map(
                    static fn(\UnitEnum $enum): int|string => $enum instanceof \BackedEnum ? $enum->value : $enum->name,
                    ($type->getClassName())::cases()
                ),
                'x-typo3-type' => $type->getClassName(),
            ];
        }

        if (!class_exists($type->getClassName()) && !interface_exists($type->getClassName())) {
            throw new \RuntimeException('Class not found: ' . $type->getClassName(), 1767777073);
        }

        $interfaces = class_implements($type->getClassName());
        if ($type->getClassName() === \DateTimeInterface::class || (
            is_array($interfaces) && in_array(\DateTimeInterface::class, $interfaces, true)
        )) {
            return [
                'type' => 'string',
                'format' => 'date-time',
                'x-typo3-type' => $type->getClassName() === \DateTimeInterface::class ? \DateTimeImmutable::class : $type->getClassName(),
            ];
        }

        $name = $type->getClassName();
        $schemaName ??= str_replace('\\', '.', $name);
        $title ??= $name;
        $ref = [
            //'$ref' => '#/components/schemas/' . $schemaName,
            '$ref' => '#/$defs/' . $schemaName,
            // swagger does not render reference titles, therefore we add descriptions inline
            'description' => '`' . $title . '`',
        ];
        if (isset($this->defs[$schemaName])) {
            return $ref;
        }

        // placeholder
        $this->defs[$schemaName] = [];

        $properties = $this->getProperties($name);
        $typeResolver = TypeResolver::create();
        $propertiesSchema = [];
        $required = [];
        foreach ($properties as $property => $def) {
            if (!$def->optional) {
                $required[] = $property;
            }
            $value = $this->map($typeResolver->resolve($def->reflection, $context));
            if ($value === []) {
                $value = true;
            }
            $propertiesSchema[$property] = $value;
        }

        /*
        $extractor = $this->getPropertyInfoExtractor();
        $properties = $extractor->getProperties($type->getClassName()) ?? [];
        $props = [];
        foreach ($properties as $property) {
            $reflection = new \ReflectionProperty($type->getClassName(), $property);
            if ($reflection->getAttributes(IntersectWithParent::class) !== []) {
                $className = $reflection->getType()->getName();
                foreach ($extractor->getProperties($className) ?? [] as $subprop) {
                    $props[$subprop] = $className;
                }
                continue;
            }

            $props[$property] = $type->getClassName();
        }
        $typeResolver = TypeResolver::create();
        $fprops = [];
        foreach ($props as $property => $className) {
            $fprops[$property] = $this->map($extractor->getType($className, $property) ?? Type::null());
        }
        */

        $schema = [
            'type' => 'object',
            'title' => $title,
            // schema overviews shows title and description, therefore rendering description
            // is avoided, to avoid redundant labels
            //'description' => str_replace('.', '\\', $schemaName),
            'properties' => $propertiesSchema,
            'required' => $required,
            'additionalProperties' => false,
            'x-typo3-type' => $type->getClassName(),
        ];
        $this->defs[$schemaName] = new Schema($schema);
        if ($toplevel) {
            return $schema;
        }
        return $ref;
    }

    private function getParameter(?\ReflectionMethod $reflection, string $name): ?\ReflectionParameter
    {
        if ($reflection === null) {
            return null;
        }
        foreach ($reflection->getParameters() as $parameter) {
            if ($parameter->name === $name) {
                return $parameter;
            }
        }
        return null;
    }

    /**
     * @return array<string, object{reflection: \ReflectionProperty, optional: bool}>
     */
    private function getProperties(string $className): array
    {
        $classReflection = new \ReflectionClass($className);
        $properties = $classReflection->getProperties(/*ReflectionProperty::IS_PUBLIC | ReflectionProperty::IS_PROTECTED*/);
        $props = [];
        foreach ($properties as $reflection) {
            $property = $reflection->getName();
            $parameter = $reflection->isPromoted() ? $this->getParameter($classReflection->getConstructor(), $property) : null;
            $optional = $parameter?->isOptional() ?? false;
            if ($reflection->getAttributes(IntersectWithParent::class) !== []) {
                $type = $reflection->getType();
                if (!$type instanceof \ReflectionNamedType) {
                    throw new \RuntimeException('Can not analyze untyped objects', 1766230580);
                }
                $props = [
                    ...$props,
                    ...$this->getProperties($type->getName()),
                ];
                continue;
            }

            $props[$property] = (object)[
                'reflection' => $reflection,
                'optional' => $optional,
            ];
        }
        return $props;
    }

    private function mapGeneric(GenericType $type, bool $toplevel = false): array
    {
        $wrappedType = $type->getWrappedType();
        if ($wrappedType instanceof ObjectType) {
            $className = $wrappedType->getClassName();
            $stringTypeResolver = new StringTypeResolver();
            $factory = new TypeContextFactory($stringTypeResolver);
            $context = $factory->createFromClassName($className);

            // Modify templates to contain the concrete ones as defined by the generic usage declaration
            $templates = $context->templates;
            reset($templates);
            foreach ($type->getVariableTypes() as $variableType) {
                $template = key($templates);
                $templates[$template] = $variableType;
            }
            reset($templates);
            $context = new TypeContext(
                $context->calledClassName,
                $context->declaringClassName,
                $context->namespace,
                $context->uses,
                $templates,
                $context->typeAliases,
            );

            return $this->mapObject(
                $wrappedType,
                $context,
                str_replace(['\\', '<', '>'], ['.', '_', '_'], (string)$type),
                (string)$type,
                $toplevel
            );
        }
        return $this->map($wrappedType);
    }

    private function mapTemplate(TemplateType $type): array
    {
        return $this->map($type->getBound());
    }

    private function mapBuiltin(BuiltinType $type): array
    {
        return match ($type->getTypeIdentifier()) {
            TypeIdentifier::BOOL => ['type' => 'boolean'],
            TypeIdentifier::FALSE => ['type' => 'boolean', 'const' => false ],
            TypeIdentifier::TRUE => ['type' => 'boolean', 'const' => true ],
            //TypeIdentifier::ARRAY =>
            //TypeIdentifier::CALLABLE =>
            TypeIdentifier::FLOAT => ['type' => 'number'],
            TypeIdentifier::INT => ['type' => 'integer'],
            //TypeIdentifier::ITERABLE =>
            TypeIdentifier::MIXED => [],
            TypeIdentifier::NULL => ['type' => 'null'],
            TypeIdentifier::OBJECT => throw new \RuntimeException('Simple type objects can not be analyzed currently, because symfony/type-info does not expose the phpdoc-defined object shape', 1766044685),
            //TypeIdentifier::RESOURCE =>
            TypeIdentifier::STRING => ['type' => 'string'],
            //TypeIdentifier::NEVER =>
            //TypeIdentifier::VOID =>
            default => throw new \RuntimeException('Builtin type not implemented: ' . (string)$type, 1766044683),
        };
    }

    /*
    private function getPropertyInfoExtractor(): PropertyInfoExtractor
    {
        // a full list of extractors is shown further below
        $phpDocExtractor = new PhpDocExtractor();
        $reflectionExtractor = new ReflectionExtractor();

        // list of PropertyListExtractorInterface (any iterable)
        $listExtractors = [$reflectionExtractor];

        // list of PropertyTypeExtractorInterface (any iterable)
        $typeExtractors = [$phpDocExtractor, $reflectionExtractor];

        // list of PropertyDescriptionExtractorInterface (any iterable)
        $descriptionExtractors = [$phpDocExtractor];

        // list of PropertyAccessExtractorInterface (any iterable)
        $accessExtractors = [$reflectionExtractor];

        // list of PropertyInitializableExtractorInterface (any iterable)
        $propertyInitializableExtractors = [$reflectionExtractor];

        return new PropertyInfoExtractor(
            $listExtractors,
            $typeExtractors,
            $descriptionExtractors,
            $accessExtractors,
            $propertyInitializableExtractors
        );
    }
    */
}
