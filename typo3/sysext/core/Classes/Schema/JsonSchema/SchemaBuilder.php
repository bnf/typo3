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

namespace TYPO3\CMS\Core\Schema\JsonSchema;

use TYPO3\CMS\Core\JsonSchema\Schema;
use TYPO3\CMS\Core\Localization\LanguageService;
use TYPO3\CMS\Core\Localization\LanguageServiceFactory;
use TYPO3\CMS\Core\Schema\Exception\InvalidSchemaTypeException;
use TYPO3\CMS\Core\Schema\Field\FieldTypeInterface;
use TYPO3\CMS\Core\Schema\Field\RelationalFieldTypeInterface;
use TYPO3\CMS\Core\Schema\Field\StaticSelectFieldType;
use TYPO3\CMS\Core\Schema\TcaSchema;

/**
 * Orchestrates the construction of JSON Schema objects from TcaSchema.
 *
 * This class is responsible for:
 * - Building complete schemas for tables with all fields
 * - Creating unified schemas with discriminators for type variations
 * - Coordinating field mapping and relation resolution
 * - Managing schema metadata ($schema, $id, title, etc.)
 *
 * @internal
 */
final readonly class SchemaBuilder
{
    public function __construct(
        private FieldMapper $fieldMapper,
        private LanguageServiceFactory $languageServiceFactory,
    ) {}

    /**
     * Build a JSON Schema for a single TcaSchema (table or sub-schema).
     *
     * @param TcaSchema $schema The TCA schema to convert
     * @param RecordSchemaType $type The purpose the schema is built for
     * @return Schema The generated JSON Schema
     */
    public function buildSchemaForTable(
        TcaSchema $schema,
        RecordSchemaType $type = RecordSchemaType::Record,
    ): Schema {
        // Create base schema object
        $metadata = $this->getSchemaMetadata($schema);

        // Build properties from fields
        $properties = [];
        $required = [];

        // @todo decide if optional
        $properties['_schema'] = new Schema(const: $schema->getName());
        $required[] = '_schema';
        if (!$type->isWritable()) {
            $properties['uid'] = new Schema(type: 'integer');
            $properties['pid'] = new Schema(type: 'integer');
            $properties['_system'] = new Schema(type: 'object');
        }
        if ($type === RecordSchemaType::RecordPatch) {
            $properties['uid'] = $this->getPatchUidSchema();
        }

        foreach ($schema->getFields() as $field) {
            $fieldName = $field->getName();
            $fieldSchema = $this->mapField($field, $type, $schema->getName());
            if ($fieldSchema === null) {
                continue;
            }

            $properties[$field->getName()] = $fieldSchema;
            if ($this->isRequired($field, $type)) {
                $required[] = $fieldName;
            }
        }

        return new Schema(
            // @todo $id
            type: 'object',
            properties: $properties,
            required: $required,
            additionalProperties: false,
            title: $metadata['title'],
            description: $type->getSchemaName($schema->getName()),
            xTypo3Type: $type->getDtoClass(),
        );
    }

    /**
     * Build a unified JSON Schema for a table with all type variations.
     *
     * When a table has sub-schemata (based on a type field), this creates
     * a schema using oneOf with a discriminator to represent all possible types.
     * Patches use anyOf with an optional type field instead, as the type of
     * the stored record applies when it is not changed.
     *
     * @param TcaSchema $mainSchema The main TCA schema
     * @param RecordSchemaType $type The purpose the schema is built for
     * @return Schema The generated unified JSON Schema
     */
    public function buildUnifiedSchemaWithTypes(
        TcaSchema $mainSchema,
        RecordSchemaType $type = RecordSchemaType::Record,
    ): Schema {
        $subSchemata = $mainSchema->getSubSchemata();

        // If no sub-schemata, just build the main schema
        if (count($subSchemata) === 0) {
            return $this->buildSchemaForTable($mainSchema, $type);
        }

        // Get type field information
        $typeInfo = $mainSchema->getSubSchemaTypeInformation();
        $typeFieldName = $typeInfo->getFieldName();

        if ($mainSchema->getField($typeFieldName) instanceof RelationalFieldTypeInterface) {
            return $this->buildSchemaForTable($mainSchema, $type);
        }

        // Build oneOf array with all type variations
        $oneOfSchemas = [];

        foreach ($subSchemata as $subSchema) {
            $typeValue = $this->extractTypeValue($subSchema->getName());
            try {
                $oneOfSchemas[] = $this->buildTypeVariationSchema(
                    $subSchema,
                    $mainSchema->getName(),
                    $typeFieldName,
                    $typeValue,
                    $type,
                );
            } catch (InvalidSchemaTypeException) {
                continue;
            }
        }

        if (count($oneOfSchemas) < 2) {
            return $this->buildSchemaForTable($mainSchema, $type);
        }

        $metadata = $this->getSchemaMetadata($mainSchema);
        return new Schema(
            // Set up discriminator structure
            // Note: JSON Schema draft-07 doesn't have built-in discriminator support,
            // but we use oneOf with const constraints which serves the same purpose
            oneOf: $type === RecordSchemaType::RecordPatch ? null : $oneOfSchemas,
            anyOf: $type === RecordSchemaType::RecordPatch ? $oneOfSchemas : null,
            // Add a note about the discriminator field
            description: sprintf(
                //'TYPO3.CMS.Core.Domain.Dto.Record_' . $mainSchema->getName() . '_ '
                'This schema represents all type variations of %s. '
                . 'The "%s" field determines which type variation applies.',
                $mainSchema->getName(),
                $typeFieldName
            ),
            title: $metadata['title'],
            unevaluatedProperties: false
        );
    }

    /**
     * Build a schema for a specific type variation with the type field constrained.
     */
    private function buildTypeVariationSchema(
        TcaSchema $subSchema,
        string $mainSchemaName,
        string $typeFieldName,
        string $typeValue,
        RecordSchemaType $type,
    ): Schema {
        $title = $this->getSubSchemaTitle($subSchema, $typeValue);

        $properties = [];
        $required = [];

        // Add type field with const constraint
        $properties[$typeFieldName] = new Schema(
            const: $this->castTypeValue($typeValue),
        );
        if ($type !== RecordSchemaType::RecordPatch) {
            $required[] = $typeFieldName;
        }

        // @todo decide if optional
        if (!$type->isWritable()) {
            $properties['uid'] = new Schema(type: 'integer');
            $properties['pid'] = new Schema(type: 'integer');
            $properties['_system'] = new Schema(type: 'object');
            $required[] = 'uid';
            $required[] = 'pid';
            $required[] = '_system';
        }
        if ($type === RecordSchemaType::RecordPatch) {
            $properties['uid'] = $this->getPatchUidSchema();
        }
        $properties['_schema'] = new Schema(const: $mainSchemaName);
        $required[] = '_schema';

        // Add all other fields
        foreach ($subSchema->getFields() as $field) {
            $fieldName = $field->getName();

            // Skip the type field as we already added it with const
            if ($fieldName === $typeFieldName) {
                continue;
            }

            $fieldSchema = $this->mapField($field, $type, $subSchema->getName(), $typeFieldName, $typeValue);
            if ($fieldSchema === null) {
                continue;
            }

            $properties[$fieldName] = $fieldSchema;
            if ($this->isRequired($field, $type)) {
                $required[] = $fieldName;
            }
        }

        //https://stackoverflow.com/questions/52934045/how-to-emulate-a-switch-statement-switch-case-in-a-json-schema
        return new Schema(
            // @todo $id
            type: 'object',
            properties: $properties,
            required: $required,
            additionalProperties: false,
            title: $title,
            xTypo3Type: $type->getDtoClass(),
        );
    }

    /**
     * Fields with access control (`exclude`) are omitted from records read by
     * users without permission for them, they are thus not required in records.
     * Patches require no field at all.
     */
    private function isRequired(FieldTypeInterface $field, RecordSchemaType $type): bool
    {
        return match ($type) {
            RecordSchemaType::Record => $field->isRequired() && !$field->isNullable() && !$field->supportsAccessControl(),
            RecordSchemaType::RecordInput => $field->isRequired() && !$field->isNullable(),
            RecordSchemaType::RecordPatch => false,
        };
    }

    private function getPatchUidSchema(): Schema
    {
        return new Schema(
            type: 'integer',
            description: 'Identifies the changed record, required for existing inline children',
        );
    }

    private function mapField(FieldTypeInterface $field, RecordSchemaType $type, string $schemaName, ?string $typeFieldName = null, ?string $typeValue = null): ?Schema
    {
        return match ($type) {
            RecordSchemaType::Record => $this->fieldMapper->mapFieldToSchema($field, $schemaName, $typeFieldName, $typeValue),
            RecordSchemaType::RecordInput => $this->fieldMapper->mapFieldToInputSchema($field, $schemaName, $typeFieldName, $typeValue),
            RecordSchemaType::RecordPatch => $this->fieldMapper->mapFieldToPatchSchema($field, $schemaName, $typeFieldName, $typeValue),
        };
    }

    /**
     * Extract the type value from a sub-schema name (e.g., "pages.1" -> "1").
     *
     * @param string $subSchemaName The full sub-schema name
     * @return string The type value
     */
    private function extractTypeValue(string $subSchemaName): string
    {
        $parts = explode('.', $subSchemaName);
        return end($parts);
    }

    /**
     * Cast type value to appropriate type (integer or string).
     *
     * @param string $typeValue The type value as string
     * @return int|string The cast type value
     */
    private function castTypeValue(string $typeValue): int|string
    {
        // If the value is numeric, cast to integer
        if (is_numeric($typeValue) && (string)(int)$typeValue === $typeValue) {
            return (int)$typeValue;
        }
        return $typeValue;
    }

    /**
     * Ensures the identifier is output as `$id` instead of `id`.
     * @todo this should be declarable in the schema object
     */
    /*
    private function adjustSchemaId(\stdClass $schema): \stdClass
    {
        if (!isset($schema->id)) {
            return $schema;
        }
        $target = new \stdClass();
        // @todo PhpStan complaints about not being able to iterate over $schema
        // @ phpstan-ignore-next-line
        foreach ($schema as $key => $value) {
            $targetKey = $key === 'id' ? '$id' : $key;
            $target->{$targetKey} = $value;
        }
        return $target;
    }
    */

    private function getSchemaMetadata(TcaSchema $schema): array
    {
        return [
            // @todo `$id` probably should be "local", since it could contain custom adjustments
            //'id' => 'http://typo3.org/schemas/' . str_replace('.', '/', $schema->getName()) . '.json'),
            'title' => $schema->getTitle() !== ''
                ? $schema->getTitle($this->getLanguageService()->sL(...))
                : sprintf('TYPO3 schema for table `%s`', $schema->getName()),
        ];
    }

    private function getSubSchemaTitle(TcaSchema $subSchema, string $typeValue): string
    {

        $typeFieldName = $subSchema->getSubSchemaTypeInformation()->getFieldName();
        $field = $subSchema->getField($typeFieldName);
        $title = null;
        if ($field instanceof StaticSelectFieldType) {
            foreach ($field->getItems() as $item) {
                if ($item->getValue() !== $typeValue || $item->getLabel() === '') {
                    continue;
                }
                $title = $this->getLanguageService()->sL($item->getLabel());
                break;
            }
        }
        return sprintf('%s (type=%s)', $title ?? $subSchema->getName(), $typeValue);
    }

    private function getLanguageService(): LanguageService
    {
        return $this->languageServiceFactory->create('default');
    }
}
