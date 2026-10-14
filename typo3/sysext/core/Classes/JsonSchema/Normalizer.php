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
 * Normalizes plain data (as returned by `json_decode()`) according to a schema.
 *
 * PHP encodes empty arrays as JSON arrays, also when they represent a map
 * and a JSON object is expected. These are converted to objects.
 *
 * @internal
 */
final readonly class Normalizer
{
    public function normalize(mixed $data, Schema|ResolvingSchema $schema): mixed
    {
        if ($schema instanceof Schema) {
            $schema = new ResolvingSchema($schema);
        }
        $objectSchema = $this->findSchemaForType($schema, 'object');
        $arraySchema = $this->findSchemaForType($schema, 'array');

        if ($data === [] && $objectSchema !== null && $arraySchema === null) {
            return new \stdClass();
        }
        if ($data instanceof \stdClass && $objectSchema !== null) {
            foreach (get_object_vars($data) as $key => $value) {
                $propertySchema = $objectSchema->properties[$key] ?? $objectSchema->additionalProperties ?? null;
                if ($propertySchema instanceof ResolvingSchema) {
                    $data->{$key} = $this->normalize($value, $propertySchema);
                }
            }
            return $data;
        }
        if (is_array($data) && $arraySchema?->items instanceof ResolvingSchema) {
            return array_map(fn(mixed $item): mixed => $this->normalize($item, $arraySchema->items), $data);
        }
        return $data;
    }

    private function findSchemaForType(Schema|ResolvingSchema $schema, string $type): ?ResolvingSchema
    {
        if ($schema instanceof Schema) {
            $schema = new ResolvingSchema($schema);
        }
        if ($schema->type === $type || (is_array($schema->type) && in_array($type, $schema->type, true))) {
            return $schema;
        }
        foreach ($schema->anyOf ?? [] as $subschema) {
            $found = $this->findSchemaForType($subschema, $type);
            if ($found !== null) {
                return $found;
            }
        }
        return null;
    }
}
