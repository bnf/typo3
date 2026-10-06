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

use Symfony\Component\DependencyInjection\Attribute\Autoconfigure;

/**
 * @internal
 */
#[Autoconfigure(autowire: false)]
final readonly class Schema implements \JsonSerializable
{
    /**
     * @param string|list<string>|null $type
     * @param list<mixed>|null $enum
     * @param list<Schema>|null $anyOf
     * @param list<Schema>|null $oneOf
     * @param list<Schema>|null $allOf
     * @param list<Schema>|null $prefixItems
     * @param array<string, Schema|bool>|null $properties
     * @param list<string>|null $required
     */
    public function __construct(
        public string|array|null $type = null,
        public ?array $enum = null,
        public mixed $const = null,
        public ?string $title = null,
        public ?string $description = null,
        public ?string $ref = null,
        public mixed $default = null,
        // algebra
        public ?array $anyOf = null,
        public ?array $oneOf = null,
        public ?array $allOf = null,
        public ?Schema $not = null,
        public ?Schema $if = null,
        public ?Schema $then = null,
        public ?Schema $else = null,
        // type object
        public ?array $properties = null,
        public ?array $required = null,
        public Schema|bool|null $additionalProperties = null,
        public ?bool $unevaluatedProperties = null,
        // type string
        public ?int $minLength = null,
        public ?int $maxLength = null,
        public ?string $format = null,
        public ?string $pattern = null,
        // type number
        public ?float $maximum = null,
        public bool|float|null $exclusiveMaximum = null,
        public ?float $minimum = null,
        public bool|float|null $exclusiveMinimum = null,
        // type array
        public ?Schema $items = null,
        public ?int $maxItems = null,
        public ?int $minItems = null,
        public ?bool $uniqueItems = null,
        public ?array $prefixItems = null,
        // misc
        public SchemaStore $store = new SchemaStore(),
        public ?string $xTypo3Type = null,
    ) {}

    public function jsonSerialize(): object
    {
        return $this->toPlainObject();
    }

    public function toPlainObject($prefix = '$defs', ?\stdClass $usedRefs = null): object
    {
        $toplevel = false;
        if ($usedRefs === null) {
            $toplevel = true;
            $usedRefs = new \stdClass();
        }
        $mapIfSchema = static fn($value) => $value instanceof Schema ? $value->toPlainObject($prefix, $usedRefs) : $value;
        $data = array_map(
            static fn($value) => match (true) {
                $value instanceof Schema => $value->toPlainObject($prefix, $usedRefs),
                $value instanceof \stdClass => (object)array_map($mapIfSchema, (array)$value),
                is_array($value) => array_map($mapIfSchema, $value),
                default => $value,
            },
            $this->jsonData($prefix),
        );

        if ($data['$ref'] ?? null) {
            $ref = substr($data['$ref'], strlen($prefix) + strlen('#//'));
            $usedRefs->{$ref} = true;
        }
        $store = $data['store'] ?? null;
        $definitions = [];
        if ($toplevel && $store !== null) {
            do {
                $countRefs = count(get_object_vars($usedRefs));
                $definitionNames = array_filter(
                    $store->getIdentifiers(),
                    static fn(string $key): bool => $usedRefs->{$key} ?? false,
                );
                foreach ($definitionNames as $name) {
                    if (!isset($definitions[$name])) {
                        $definitions[$name] = $mapIfSchema($store->get($name));
                    }
                }
            } while ($countRefs !== count(get_object_vars($usedRefs)));

            if ($definitions !== []) {
                $data['$defs'] = (object)$definitions;
            }
        }
        unset($data['store']);

        return (object)$data;
    }

    /**
     * Factory to create a `Schema` instance based on
     * output from `json_decode(…, true)` (associative),
     * `json_decode(…, false)` (object representation) and
     * from `Schema->toPlainObject()`.
     */
    public static function fromPlainData(\stdClass|array $data): self
    {
        $processOne = static fn(mixed $schema): mixed
            => is_array($schema) || is_object($schema) ? self::fromPlainData($schema) : $schema;
        $process = fn(\stdClass|array|null $schemas): ?array
            => $schemas === null ? null : array_map($processOne, (array)$schemas);

        $data = (object)$data;
        return new self(
            type: $data->type ?? null,
            enum: $data->enum ?? null,
            const: $data->const ?? null,
            title: $data->title ?? null,
            description: $data->description ?? null,
            ref: $data->{'$ref'} ?? null,
            default: $data->default ?? null,
            // algebra
            anyOf: $process($data->anyOf ?? null),
            oneOf: $process($data->oneOf ?? null),
            allOf: $process($data->allOf ?? null),
            not: $processOne($data->not ?? null),
            if: $processOne($data->if ?? null),
            then: $processOne($data->then ?? null),
            else: $processOne($data->else ?? null),
            // type object
            properties: $process($data->properties ?? null),
            required: $data->required ?? null,
            additionalProperties: $processOne($data->additionalProperties ?? null),
            unevaluatedProperties: $data->unevaluatedProperties ?? null,
            // type string
            minLength: $data->minLength ?? null,
            maxLength: $data->maxLength ?? null,
            format: $data->format ?? null,
            pattern: $data->pattern ?? null,
            // type number
            maximum: $data->maximum ?? null,
            exclusiveMaximum: $data->exclusiveMaximum ?? null,
            minimum: $data->minimum ?? null,
            exclusiveMinimum: $data->exclusiveMinimum ?? null,
            // type array
            items: $processOne($data->items ?? null),
            maxItems: $data->maxItems ?? null,
            minItems: $data->minItems ?? null,
            uniqueItems: $data->uniqueItems ?? null,
            prefixItems: $process($data->prefixItems ?? null),
            // misc
            store: new SchemaStore($process($data->{'$defs'} ?? null) ?? []),
            xTypo3Type: $data->{'x-typo3-type'} ?? null,
        );
    }

    public static function fromJSON(string $json): ?self
    {
        $data = json_decode($json, false, 512, JSON_THROW_ON_ERROR);
        if ($data === null) {
            return null;
        }
        return self::fromPlainData($data);
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

    private function rebase(string $ref, string $prefix): string
    {
        if ($prefix === '$defs') {
            return $ref;
        }
        if (!str_starts_with($ref, '#/$defs/')) {
            throw new \LogicException('Internal schema refs need to be #/$defs/ references', 1775580727);
        }
        $id = substr($ref, 8);

        return '#/' . $prefix . '/' . $id;
    }

    private function jsonData($prefix = '$defs'): array
    {
        return array_filter(
            [
                ...get_object_vars($this),
                'properties' => $this->properties === null ? null : (object)$this->properties,

                // map 'ref' to '$ref'
                'ref' => null,
                '$ref' => $this->ref === null ? null : $this->rebase($this->ref, $prefix),

                'store' => $this->store->isEmpty() ? null : $this->store,

                // map 'xTypo3Type' to 'x-typo3-type'
                'xTypo3Type' => null,
                'x-typo3-type' => $this->xTypo3Type,
            ],
            static fn(mixed $value): bool => $value !== null
        );
    }
}
