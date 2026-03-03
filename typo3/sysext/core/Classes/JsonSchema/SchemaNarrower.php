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

namespace TYPO3\CMS\Core\JsonSchema;

/**
 * Replaces `oneOf` schemas that declare a discriminator by the subschema
 * the discriminator value of the given data points to. Validation then
 * only evaluates (and reports errors of) the selected subschema instead
 * of all alternatives. A `oneOf` without discriminator whose alternatives
 * all constrain one property to a constant value is narrowed the same way.
 *
 * Object properties are narrowed recursively, array items are not.
 *
 * @internal
 */
final readonly class SchemaNarrower
{
    public function narrow(mixed $data, Schema $schema): Schema
    {
        return $this->narrowSchema($data, $schema, $schema->store)->with(['store' => $schema->store]);
    }

    private function narrowSchema(mixed $data, Schema $schema, SchemaStore $store): Schema
    {
        if (!$data instanceof \stdClass) {
            return $schema;
        }
        $resolved = $this->resolve($schema, $store);

        if ($resolved->discriminator !== null) {
            $propertyName = $resolved->discriminator['propertyName'];
            $mapping = $resolved->discriminator['mapping'];
            $value = $data->{$propertyName} ?? null;
            $ref = is_string($value) || is_int($value) ? ($mapping[$value] ?? null) : null;
            if ($ref === null) {
                return new Schema(
                    type: 'object',
                    properties: [
                        $propertyName => new Schema(enum: array_map(strval(...), array_keys($mapping))),
                    ],
                    required: [$propertyName],
                );
            }
            return $this->narrowSchema($data, new Schema(ref: $ref), $store);
        }

        $constPropertyName = $resolved->oneOf !== null ? $this->getConstPropertyName($resolved->oneOf, $store) : null;
        if ($constPropertyName !== null) {
            $values = [];
            $value = $data->{$constPropertyName} ?? null;
            foreach ($resolved->oneOf as $variation) {
                $constValue = $this->resolve($variation, $store)->properties[$constPropertyName]->const;
                if ($constValue === $value) {
                    return $resolved->with(['oneOf' => [$this->narrowSchema($data, $variation, $store)]]);
                }
                $values[] = $constValue;
            }
            return new Schema(
                type: 'object',
                properties: [
                    $constPropertyName => new Schema(enum: $values),
                ],
                required: [$constPropertyName],
            );
        }

        if ($resolved->properties === null) {
            return $schema;
        }
        $properties = $resolved->properties;
        foreach ($properties as $name => $propertySchema) {
            if ($propertySchema instanceof Schema && property_exists($data, $name)) {
                $properties[$name] = $this->narrowSchema($data->{$name}, $propertySchema, $store);
            }
        }
        return $resolved->with(['properties' => $properties]);
    }

    /**
     * Name of the property all alternatives constrain to a constant value, like
     * the type field of the type variations of a record
     *
     * @param array<Schema|mixed> $oneOf
     */
    private function getConstPropertyName(array $oneOf, SchemaStore $store): ?string
    {
        $names = null;
        foreach ($oneOf as $alternative) {
            if (!$alternative instanceof Schema) {
                return null;
            }
            $constNames = array_keys(array_filter(
                $this->resolve($alternative, $store)->properties ?? [],
                static fn(mixed $property): bool => $property instanceof Schema && $property->const !== null
            ));
            $names = $names === null ? $constNames : array_values(array_intersect($names, $constNames));
            if ($names === []) {
                return null;
            }
        }
        return $names[0] ?? null;
    }

    private function resolve(Schema $schema, SchemaStore $store): Schema
    {
        while ($schema->ref !== null && str_starts_with($schema->ref, '#/$defs/')) {
            $name = substr($schema->ref, 8);
            if (!$store->has($name)) {
                break;
            }
            $schema = $store->get($name);
        }
        return $schema;
    }
}
