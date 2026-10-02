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

use Symfony\Component\DependencyInjection\Attribute\Autoconfigure;
use TYPO3\CMS\Core\JsonSchema\Schema;
use TYPO3\CMS\Core\JsonSchema\SchemaStore;
use TYPO3\CMS\Core\Localization\LanguageService;
use TYPO3\CMS\Core\Localization\LanguageServiceFactory;
use TYPO3\CMS\Core\Schema\Field\StaticSelectFieldType;
use TYPO3\CMS\Core\Schema\TcaSchema;
use TYPO3\CMS\Core\Schema\Exception\InvalidSchemaTypeException;

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
#[Autoconfigure(public: true, shared: true)]
final readonly class SchemaBuilder
{
    public function __construct(
        private FieldMapper $fieldMapper,
        private RelationResolver $relationResolver,
        private LanguageServiceFactory $languageServiceFactory,
    ) {}

    /**
     * Build a JSON Schema for a single TcaSchema (table or sub-schema).
     *
     * @param TcaSchema $schema The TCA schema to convert
     * @param bool $nested Whether to recursively resolve relations
     * @param int $maxDepth Maximum depth for relation resolution
     * @param array $visitedSchemas Tracking array for circular reference detection
     * @return Schema The generated JSON Schema
     */
    public function buildSchemaForTable(
        TcaSchema $schema,
        bool $nested = false,
        int $maxDepth = 5,
        array $visitedSchemas = []
    ): Schema {
        // Create base schema object
        $metadata = $this->getSchemaMetadata($schema);

        // Build properties from fields
        $properties = [];
        $required = [];

        // @todo decide if optional
        $properties['_schema'] = new Schema(const: $schema->getName());
        $required[] = '_schema';
        $properties['uid'] = new Schema(type: 'integer');
        $properties['pid'] = new Schema(type: 'integer');
        $properties['_system'] = new Schema(type: 'object');

        foreach ($schema->getFields() as $field) {
            $fieldName = $field->getName();
            $fieldSchema = $this->fieldMapper->mapFieldToSchema($field);
            if ($fieldSchema === null) {
                continue;
            }

            $properties[$field->getName()] = $fieldSchema;
            if ($field->isRequired() && !$field->isNullable()) {
                $required[] = $fieldName;
            }
        }

        $definitions = [];
        // Handle nested relations if requested
        if ($nested && $maxDepth > 0) {
            // @todo this does not work yet
            $definitions = $this->relationResolver->resolveRelations(
                $schema,
                0,
                $maxDepth,
                $visitedSchemas
            );
        }

        return new Schema(
            // @todo $id
            type: 'object',
            properties: $properties,
            required: $required,
            additionalProperties: false,
            title: $metadata['title'],
            description: 'TYPO3.CMS.Core.Domain.Dto.Record_' . $schema->getName() . '_',
            store: new SchemaStore($definitions),
        );
    }

    /**
     * Build a unified JSON Schema for a table with all type variations.
     *
     * When a table has sub-schemata (based on a type field), this creates
     * a schema using oneOf with a discriminator to represent all possible types.
     *
     * @param TcaSchema $mainSchema The main TCA schema
     * @param bool $nested Whether to recursively resolve relations
     * @param int $maxDepth Maximum depth for relation resolution
     * @return Schema The generated unified JSON Schema
     */
    public function buildUnifiedSchemaWithTypes(
        TcaSchema $mainSchema,
        bool $nested = false,
        int $maxDepth = 5
    ): Schema {
        $subSchemata = $mainSchema->getSubSchemata();

        // If no sub-schemata, just build the main schema
        if (count($subSchemata) === 0) {
            return $this->buildSchemaForTable($mainSchema, $nested, $maxDepth, []);
        }

        // Get type field information
        $typeInfo = $mainSchema->getSubSchemaTypeInformation();
        $typeFieldName = $typeInfo->getFieldName();

        // Build oneOf array with all type variations
        $oneOfSchemas = [];

        foreach ($subSchemata as $subSchema) {
            $typeValue = $this->extractTypeValue($subSchema->getName());
            //if ($typeValue == '1') {
            //    return $this->buildSchemaForTable($subSchema, $nested, $maxDepth, []);
            //}
            try {
                $oneOfSchemas[] = $this->buildTypeVariationSchema2(
                    $subSchema,
                    $typeFieldName,
                    $typeValue,
                    $nested,
                    $maxDepth
                );
            } catch (InvalidSchemaTypeException) {
                continue;
            }
        }

        if (count($oneOfSchemas) < 2) {
            return $this->buildSchemaForTable($mainSchema, $nested, $maxDepth, []);
        }

        $metadata = $this->getSchemaMetadata($mainSchema);
        return new Schema(
            // Set up discriminator structure
            // Note: JSON Schema draft-07 doesn't have built-in discriminator support,
            // but we use oneOf with const constraints which serves the same purpose
            //oneOf: $oneOfSchemas,
            allOf: $oneOfSchemas,
            // Add a note about the discriminator field
            description: sprintf(
                //'TYPO3.CMS.Core.Domain.Dto.Record_' . $mainSchema->getName() . '_ '
                'This schema represents all type variations of %s. '
                . 'The "%s" field determines which type variation applies.',
                $mainSchema->getName(),
                $typeFieldName
            ),
            required: [
                //$typeFieldName,
                '_schema',
            ],
            properties: [
                '_schema' => new Schema(const: $mainSchema->getName()),
            ],
            title: $metadata['title'],
            unevaluatedProperties: false
        );
    }

    /**
     * Build a schema for a specific type variation with the type field constrained.
     *
     * @param TcaSchema $subSchema The sub-schema (type variation)
     * @param string $typeFieldName The name of the type field
     * @param string $typeValue The value of the type field for this variation
     * @param bool $nested Whether to recursively resolve relations
     * @param int $maxDepth Maximum depth for relation resolution
     * @return Schema The generated schema for this type variation
     */
    private function buildTypeVariationSchema(
        TcaSchema $subSchema,
        string $typeFieldName,
        string $typeValue,
        bool $nested,
        int $maxDepth
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
        $properties['uid'] = new Schema(type: 'integer');
        $properties['pid'] = new Schema(type: 'integer');
        $properties['_system'] = new Schema(type: 'object');

        // Add all other fields
        foreach ($subSchema->getFields() as $field) {
            $fieldName = $field->getName();

            // Skip the type field as we already added it with const
            if ($fieldName === $typeFieldName) {
                continue;
            }

            $fieldSchema = $this->fieldMapper->mapFieldToSchema($field);
            if ($fieldSchema === null) {
                continue;
            }

            $properties[$fieldName] = $fieldSchema;
            if ($field->isRequired() && !$field->isNullable()) {
                $required[] = $fieldName;
            }
        }

        // Handle nested relations if requested
        $definitions = [];
        if ($nested && $maxDepth > 0) {
            $definitions = $this->relationResolver->resolveRelations(
                $subSchema,
                0,
                $maxDepth,
                []
            );
        }

        //https://stackoverflow.com/questions/52934045/how-to-emulate-a-switch-statement-switch-case-in-a-json-schema
        return new Schema(
            // @todo $id
            type: 'object',
            properties: $properties,
            required: $required,
            additionalProperties: false,
            title: $title,
            store: new SchemaStore($definitions),
        );
    }

    private function buildTypeVariationSchema2(
        TcaSchema $subSchema,
        string $typeFieldName,
        string $typeValue,
        bool $nested,
        int $maxDepth
    ): Schema {
        $title = $this->getSubSchemaTitle($subSchema, $typeValue);

        $properties = [];
        $required = [];

        // Add type field with const constraint
        /*
        $properties[$typeFieldName] = new Schema(
            const: $this->castTypeValue($typeValue),
        );
         */
        $required[] = $typeFieldName;

        // @todo decide if optional
        $properties['uid'] = new Schema(type: 'integer');
        $properties['pid'] = new Schema(type: 'integer');
        $properties['_system'] = new Schema(type: 'object');

        // Add all other fields
        foreach ($subSchema->getFields() as $field) {
            $fieldName = $field->getName();

            // Skip the type field as we already added it with const
            if ($fieldName === $typeFieldName) {
                continue;
            }

            $fieldSchema = $this->fieldMapper->mapFieldToSchema($field);
            if ($fieldSchema === null) {
                continue;
            }

            $properties[$fieldName] = $fieldSchema;
            if ($field->isRequired() && !$field->isNullable()) {
                $required[] = $fieldName;
            }
        }

        // Handle nested relations if requested
        $definitions = [];
        if ($nested && $maxDepth > 0) {
            $definitions = $this->relationResolver->resolveRelations(
                $subSchema,
                0,
                $maxDepth,
                []
            );
        }

        //https://stackoverflow.com/questions/52934045/how-to-emulate-a-switch-statement-switch-case-in-a-json-schema
        return new Schema(
            // @todo $id
            type: 'object',
            if: new Schema(
                properties: [
                    $typeFieldName => new Schema(
                        const: $this->castTypeValue($typeValue),
                    )
                ]
            ),
            then: new Schema(
                properties: $properties,
                required: $required,
                additionalProperties: false,
            ),
            title: $title,
            store: new SchemaStore($definitions),
        );
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
