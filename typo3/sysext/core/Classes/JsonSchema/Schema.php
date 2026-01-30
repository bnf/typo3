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
     * @param list<mixed>|null $enum
     * @param list<Schema>|null $anyOf
     * @param list<Schema>|null $oneOf
     * @param list<Schema>|null $allOf
     * @param array<string, Schema>|null $defs
     * @param array<string, string>|null $xDynamicDefs
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
        public ?array $xDynamicDefs = null,
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

                'xDynamicDefs' => null,
                'x-dynamic-defs' => $this->xDynamicDefs === null ? null : (object)$this->xDynamicDefs
            ],
            static fn(mixed $value): bool => $value !== null
        );
    }

    public function toPlainObject(): object
    {
        $mapIfSchema = static fn($value) => $value instanceof Schema ? $value->toPlainObject() : $value;
        return (object)array_map(
            static fn($value) => match (true) {
                $value instanceof Schema => $value->toPlainObject(),
                $value instanceof \stdClass => (object)array_map($mapIfSchema, (array)$value),
                is_array($value) => array_map($mapIfSchema, $value),
                default => $value,
            },
            get_object_vars($this->jsonSerialize())
        );
    }

    /**
     * Factory to create a `Schema` instance based on
     * output from `json_decode(…, true)` (associative),
     * `json_decode(…, false)` (object representation) and
     * from `Schema->toPlainObject()`.
     */
    public static function fromPlainData(\stdClass|array $data): self
    {
        $processOne = static fn(mixed $schema): mixed =>
            is_array($schema) || is_object($schema) ? self::fromPlainData($schema) : $schema;
        $process = fn(\stdClass|array|null $schemas): ?array =>
            $schemas === null ? null : array_map($processOne, (array)$schemas);

        $data = (object)$data;
        return new self(
            type: $data->type ?? null,
            properties: $process($data->properties ?? null),
            required: $data->required ?? null,
            enum: $data->enum ?? null,
            const: $data->const ?? null,
            additionalProperties: $processOne($data->additionalProperties ?? null),
            items: $processOne($data->items ?? null),
            format: $data->format ?? null,
            anyOf: $process($data->anyOf ?? null),
            oneOf: $process($data->oneOf ?? null),
            allOf: $process($data->allOf ?? null),
            title: $data->title ?? null,
            description: $data->description ?? null,
            ref: $data->{'$ref'} ?? null,
            defs: $process($data->{'$defs'} ?? null),
            xTypo3Type: $data->{'x-typo3-type'} ?? null,
        );
    }

    /**
     * @param array<string, mixed> $properties
     */
    public function with(array $properties): self
    {
        return new self(...[
            ...get_object_vars($this),
            ...$properties,
        ]);
    }
}
