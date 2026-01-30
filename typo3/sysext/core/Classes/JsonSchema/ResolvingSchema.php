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
 * Transparently resolve schema refs (`$ref`) in a `Schema` object.
 *
 * @property string|list<string>|null $type
 * @property array<string, Schema>|null $properties
 * @property list<string>|null $required
 * @property list<mixed>|null $enum
 * @property ?bool $const
 * @property Schema|bool|null $additionalProperties
 * @property ?Schema $items
 * @property ?string $format
 * @property list<Schema>|null $anyOf
 * @property list<Schema>|null $oneOf
 * @property list<Schema>|null $allOf
 * @property ?string $title
 * @property ?string $description
 * @property ?string $ref
 * @property SchemaStore $store
 * @property ?string $xTypo3Type
 * @internal
 * property array<string, Schema>|null $defs
 */
final readonly class ResolvingSchema
{
    private SchemaStore $store;

    public function __construct(
        private Schema $schema,
        ?SchemaStore $store = null,
    ) {
        $this->store = $store ?? $schema->store;
    }

    public function __get(string $name)
    {
        $source = $this->schema;
        if ($name === 'defs') {
        }
        if ($source->ref !== null) {
            $ref = $source->ref;
            if (!str_starts_with($ref, '#/$defs/')) {
                throw new \InvalidArgumentException('Only local schema refs to #/$defs/ are supported', 1773328626);
            }
            $entry = substr($ref, 8);
            if (!$this->store->has($entry)) {
                throw new \InvalidArgumentException('Schema ref not found: ' . $ref, 1773328627);
            }
            $source = $this->store->get($entry);
        }

        if (!property_exists($source, $name)) {
            throw new \InvalidArgumentException('Invalid property: ' . $name, 1773328628);
        }

        return $this->wrap($source->{$name});
    }

    private function wrap(mixed $value): mixed
    {
        if ($value instanceof Schema) {
            return new self($value, $this->store);
        }

        if (is_array($value)) {
            return array_map($this->wrap(...), $value);
        }

        return $value;
    }
}
