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

use TYPO3\CMS\Core\Domain\Dto\RecordInput;
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
     * @param bool $input Whether to build the schema for writing (`RecordInput`) instead of reading records
     * @return Schema The generated JSON Schema
     */
    public function buildSchemaForTable(
        TcaSchema $schema,
        bool $input = false,
    ): Schema {
        // Create base schema object
        $metadata = $this->getSchemaMetadata($schema);

        // Build properties from fields
        $properties = [];
        $required = [];

        // @todo decide if optional
        $properties['_schema'] = new Schema(const: $schema->getName());
        $required[] = '_schema';
        if (!$input) {
            $properties['uid'] = new Schema(type: 'integer');
            $properties['pid'] = new Schema(type: 'integer');
            $properties['_system'] = new Schema(type: 'object');
        }

        foreach ($schema->getFields() as $field) {
            $fieldName = $field->getName();
            $fieldSchema = $this->mapField($field, $input, $schema->getName());
            if ($fieldSchema === null) {
                continue;
            }

            $properties[$field->getName()] = $fieldSchema;
            if ($field->isRequired() && !$field->isNullable()) {
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
            description: $this->getSchemaName($schema->getName(), $input),
            xTypo3Type: $input ? RecordInput::class : null,
        );
    }

    /**
     * Build a unified JSON Schema for a table with all type variations.
     *
     * When a table has sub-schemata (based on a type field), this creates
     * a schema using oneOf with a discriminator to represent all possible types.
     *
     * @param TcaSchema $mainSchema The main TCA schema
     * @param bool $input Whether to build the schema for writing (`RecordInput`) instead of reading records
     * @return Schema The generated unified JSON Schema
     */
    public function buildUnifiedSchemaWithTypes(
        TcaSchema $mainSchema,
        bool $input = false,
    ): Schema {
        $subSchemata = $mainSchema->getSubSchemata();

        // If no sub-schemata, just build the main schema
        if (count($subSchemata) === 0) {
            return $this->buildSchemaForTable($mainSchema, $input);
        }

        // Get type field information
        $typeInfo = $mainSchema->getSubSchemaTypeInformation();
        $typeFieldName = $typeInfo->getFieldName();

        if ($mainSchema->getField($typeFieldName) instanceof RelationalFieldTypeInterface) {
            return $this->buildSchemaForTable($mainSchema, $input);
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
                    $input,
                );
            } catch (InvalidSchemaTypeException) {
                continue;
            }
        }

        if (count($oneOfSchemas) < 2) {
            return $this->buildSchemaForTable($mainSchema, $input);
        }

        $metadata = $this->getSchemaMetadata($mainSchema);
        return new Schema(
            // Set up discriminator structure
            // Note: JSON Schema draft-07 doesn't have built-in discriminator support,
            // but we use oneOf with const constraints which serves the same purpose
            oneOf: $oneOfSchemas,
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
        bool $input,
    ): Schema {
        $title = $this->getSubSchemaTitle($subSchema, $typeValue);

        $properties = [];
        $required = [];

        // Add type field with const constraint
        $properties[$typeFieldName] = new Schema(
            const: $this->castTypeValue($typeValue),
        );
        $required[] = $typeFieldName;

        // @todo decide if optional
        if (!$input) {
            $properties['uid'] = new Schema(type: 'integer');
            $properties['pid'] = new Schema(type: 'integer');
            $properties['_system'] = new Schema(type: 'object');
            $required[] = 'uid';
            $required[] = 'pid';
            $required[] = '_system';
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

            $fieldSchema = $this->mapField($field, $input, $subSchema->getName(), $typeFieldName, $typeValue);
            if ($fieldSchema === null) {
                continue;
            }

            $properties[$fieldName] = $fieldSchema;
            if ($field->isRequired() && !$field->isNullable()) {
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
            xTypo3Type: $input ? RecordInput::class : null,
        );
    }

    public function getSchemaName(string $tableName, bool $input = false): string
    {
        return 'TYPO3.CMS.Core.Domain.Dto.' . ($input ? 'RecordInput' : 'Record') . '_' . $tableName . '_';
    }

    private function mapField(FieldTypeInterface $field, bool $input, string $schemaName, ?string $typeFieldName = null, ?string $typeValue = null): ?Schema
    {
        return $input
            ? $this->fieldMapper->mapFieldToInputSchema($field, $schemaName, $typeFieldName, $typeValue)
            : $this->fieldMapper->mapFieldToSchema($field, $schemaName, $typeFieldName, $typeValue);
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
