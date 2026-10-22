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
 * of all alternatives.
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
