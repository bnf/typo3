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

use cebe\openapi\spec\Schema;
use Symfony\Component\PropertyInfo\Extractor\PhpDocExtractor;
use Symfony\Component\PropertyInfo\Extractor\ReflectionExtractor;
use Symfony\Component\PropertyInfo\PropertyInfoExtractor;
use Symfony\Component\TypeInfo\Type;
use Symfony\Component\TypeInfo\Type\ArrayShapeType;
use Symfony\Component\TypeInfo\Type\BackedEnumType;
use Symfony\Component\TypeInfo\Type\BuiltinType;
use Symfony\Component\TypeInfo\Type\CollectionType;
use Symfony\Component\TypeInfo\Type\EnumType;
use Symfony\Component\TypeInfo\Type\IntersectionType;
use Symfony\Component\TypeInfo\Type\NullableType;
use Symfony\Component\TypeInfo\Type\ObjectType;
use Symfony\Component\TypeInfo\Type\UnionType;
use Symfony\Component\TypeInfo\TypeIdentifier;

/**
 * @internal
 * @todo tests
 */
final readonly class SchemaMapper
{
    public function map(Type $type): Schema
    {
        try {
            $schema = $this->doMap($type);
        } catch (\RuntimeException $e) {
            throw new \RuntimeException('Failed to map: ' . (string)$type, 1766045968, $e);
        }
        return new Schema($schema);
    }

    private function doMap(Type $type): array
    {
        return match (true) {
            $type instanceof UnionType => $this->mapUnion($type),
            $type instanceof IntersectionType => $this->mapIntersection($type),
            $type instanceof CollectionType => $this->mapCollection($type),
            $type instanceof ObjectType => $this->mapObject($type),
            $type instanceof BuiltinType => $this->mapBuiltin($type),
            default => throw new \RuntimeException('Type to json mapping not implemented: ' . (string)$type, 1766044681),
        };
    }

    private function mapUnion(UnionType $type): array
    {
        if ($type instanceof NullableType) {
            $schema = $this->doMap($type->getWrappedType());
            if (is_string($schema['type'] ?? null)) {
                $schema['type'] = [$schema['type'], 'null'];
                return $schema;
            }
        }
        return [
            'anyOf' => array_map(
                fn(Type $subtype): array => $this->doMap($subtype),
                $type->getTypes(),
            ),
        ];
    }

    private function mapIntersection(IntersectionType $type): array
    {
        return [
            'allOf' => array_map(
                fn(Type $subtype): array => $this->doMap($subtype),
                $type->getTypes(),
            ),
        ];
    }

    private function mapCollection(CollectionType $type): array
    {
        if ($type instanceof ArrayShapeType) {
            if ($type->isList()) {
                throw new \RuntimeException('array shaped lists are now supported', 1766046759);
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
                    fn(string $property): array => $this->doMap($type->getShape()[$property]['type']),
                    $keys,
                )),
                'required' => $required,
            ];
        }
        if ($type->isList()) {
            return [
                'type' => 'array',
                'items' => $this->doMap($type->getCollectionValueType()),
            ];
        }
        $keyType = $type->getCollectionKeyType();
        if (!$keyType->isIdentifiedBy(TypeIdentifier::STRING)) {
            throw new \RuntimeException('Type to json mapping not implemented for non-string indexed generics: ' . (string)$type, 1766044682);
        }
        return [
            'type' => 'object',
            'x-typo3-type' => 'array',
            'additionalProperties' => $this->doMap($type->getCollectionValueType()),
        ];
    }

    private function mapObject(ObjectType $type): array
    {
        if ($type instanceof EnumType) {
            return [
                // @todo: INT enum's will be ugly to use (as only integers will be exposed publicly)
                ...$this->doMap($type instanceof BackedEnumType ? $type->getBackingType() : Type::string()),
                'enum' => array_map(
                    static fn(\UnitEnum $enum): int|string => $enum instanceof \BackedEnum ? $enum->value : $enum->name,
                    ($type->getClassName())::cases()
                ),
                'x-typo3-type' => $type->getClassName(),
            ];
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

        $extractor = $this->getPropertyInfoExtractor();
        $properties = $extractor->getProperties($type->getClassName()) ?? [];
        return [
            'type' => 'object',
            'properties' => array_combine($properties, array_map(
                fn(string $propertyName): array => $this->doMap($extractor->getType($type->getClassName(), $propertyName) ?? Type::null()),
                $properties,
            )),
            'required' => $properties,
        ];
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
            //TypeIdentifier::MIXED =>
            TypeIdentifier::NULL => ['type' => 'null'],
            TypeIdentifier::OBJECT => throw new \RuntimeException('Simple type objects can not be analyzed currently, because symfony/type-info does not expose the phpdoc-defined object shape', 1766044685),
            //TypeIdentifier::RESOURCE =>
            TypeIdentifier::STRING => ['type' => 'string'],
            default => throw new \RuntimeException('Builtin type not implemented: ' . (string)$type, 1766044683),
        };
    }

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
}
