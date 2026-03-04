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
 * @internal
 */
final readonly class Schema implements \JsonSerializable
{
    /**
     * @param string|list<string>|null $type
     * @param array<string, Schema>|null $properties
     * @param list<string>|null $required
     * @param list<string>|null $enum
     * @param list<Schema> $anyOf
     * @param list<Schema> $oneOf
     * @param list<Schema> $allOf
     * @param array<string, Schema>|null $defs
     */
    public function __construct(
        public string|array|null $type = null,
        public ?array $properties = null,
        public ?array $required = null,
        public ?array $enum = null,
        public ?bool $const = null,
        public Schema|bool|null $additionalProperties = null,
        public ?Schema $items = null,
        public ?string $format = null,
        public ?array $anyOf = null,
        public ?array $oneOf = null,
        public ?array $allOf = null,
        public ?string $title = null,
        public ?string $description = null,
        public ?string $ref = null,
        public ?array $defs = null,
        public ?string $xTypo3Type = null,
    ) {}

    public function jsonSerialize(): object
    {
        return (object)array_filter(
            [
                ...get_object_vars($this),
                'properties' => $this->properties === null ? null : (object)$this->properties,

                // map 'ref' to '$ref'
                'ref' => null,
                '$ref' => $this->ref,

                // map 'defs' to '$defs'
                'defs' => null,
                '$defs' => $this->defs === null ? null : (object)$this->defs,

                // map 'xTypo3Type' to 'x-typo3-type'
                'xTypo3Type' => null,
                'x-typo3-type' => $this->xTypo3Type,
            ],
            static fn(mixed $value): bool => $value !== null
        );
    }

    public function toPlainObject(): object
    {
        return (object)array_map(
            static fn($value) => match (true) {
                $value instanceof Schema => $value->toPlainObject(),
                $value instanceof \stdClass => (object)array_map(
                    static fn($value) => $value instanceof Schema ? $value->toPlainObject() : $value,
                    (array)$value,
                ),
                is_array($value) => array_map(
                    static fn($value) => $value instanceof Schema ? $value->toPlainObject() : $value,
                    $value,
                ),
                default => $value
            },
            get_object_vars($this->jsonSerialize())
        );
    }
}
