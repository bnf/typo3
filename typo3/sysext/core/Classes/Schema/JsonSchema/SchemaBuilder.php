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

use Swaggest\JsonSchema\Schema;
use Symfony\Component\DependencyInjection\Attribute\Autoconfigure;
use TYPO3\CMS\Core\Localization\LanguageService;
use TYPO3\CMS\Core\Localization\LanguageServiceFactory;
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
     * @return \stdClass The generated JSON Schema
     */
    public function buildSchemaForTable(
        TcaSchema $schema,
        bool $nested = false,
        int $maxDepth = 5,
        array $visitedSchemas = []
    ): \stdClass {
        // Create base schema object
        $jsonSchema = Schema::object();
        $jsonSchema->setFromRef('http://json-schema.org/draft-07/schema#');
        $jsonSchema = $this->assignSchemaMetadata($schema, $jsonSchema);

        // Build properties from fields
        $required = [];
        foreach ($schema->getFields() as $field) {
            $fieldName = $field->getName();
            $fieldSchema = $this->fieldMapper->mapFieldToSchema($field);
            if ($fieldSchema === null) {
                continue;
            }

            $jsonSchema->setProperty($field->getName(), $fieldSchema);
            if ($field->isRequired() && !$field->isNullable()) {
                $required[] = $fieldName;
            }
        }

        if ($required !== []) {
            $jsonSchema->setRequired($required);
        }

        // Handle nested relations if requested
        if ($nested && $maxDepth > 0) {
            // @todo this does not work yet
            $definitions = $this->relationResolver->resolveRelations(
                $schema,
                0,
                $maxDepth,
                $visitedSchemas
            );

            if ($definitions !== []) {
                $jsonSchema->setDefinitions($definitions);
            }
        }

        return $this->adjustSchemaId(
            $jsonSchema->jsonSerialize()
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
     * @return \stdClass The generated unified JSON Schema
     */
    public function buildUnifiedSchemaWithTypes(
        TcaSchema $mainSchema,
        bool $nested = false,
        int $maxDepth = 5
    ): \stdClass {
        $subSchemata = $mainSchema->getSubSchemata();

        // If no sub-schemata, just build the main schema
        if (count($subSchemata) === 0) {
            return $this->buildSchemaForTable($mainSchema, $nested, $maxDepth, []);
        }

        // Get type field information
        $typeInfo = $mainSchema->getSubSchemaTypeInformation();
        $typeFieldName = $typeInfo->getFieldName();

        // Create base schema with discriminator
        $jsonSchema = Schema::object();
        $jsonSchema->setSchema('https://json-schema.org/draft-07/schema#');
        $jsonSchema = $this->assignSchemaMetadata($mainSchema, $jsonSchema);

        // Build oneOf array with all type variations
        $oneOfSchemas = [];

        foreach ($subSchemata as $subSchema) {
            $typeValue = $this->extractTypeValue($subSchema->getName());
            $typeSchema = $this->buildTypeVariationSchema(
                $subSchema,
                $typeFieldName,
                $typeValue,
                $nested,
                $maxDepth
            );
            $oneOfSchemas[] = $typeSchema;
        }

        // Set up discriminator structure
        // Note: JSON Schema draft-07 doesn't have built-in discriminator support,
        // but we use oneOf with const constraints which serves the same purpose
        $jsonSchema->oneOf = $oneOfSchemas;

        // Add a note about the discriminator field
        $jsonSchema->description = sprintf(
            'This schema represents all type variations of %s. ' .
            'The "%s" field determines which type variation applies.',
            $mainSchema->getName(),
            $typeFieldName
        );

        return $this->adjustSchemaId(
            $jsonSchema->jsonSerialize()
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
        $typeSchema = Schema::object();
        $typeSchema = $this->assignSubSchemaMetadata($subSchema, $typeValue, $typeSchema);

        $properties = new \stdClass();
        $required = [];

        // Add type field with const constraint
        $typeFieldSchema = Schema::object();
        $typeFieldSchema->const = $this->castTypeValue($typeValue);
        $typeSchema->setProperty($typeFieldName, $typeFieldSchema);
        $required[] = $typeFieldName;

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

            $typeSchema->setProperty($fieldName, $fieldSchema);
            if ($field->isRequired() && !$field->isNullable()) {
                $required[] = $fieldName;
            }
        }
        $typeSchema->setRequired($required);

        // Handle nested relations if requested
        if ($nested && $maxDepth > 0) {
            $definitions = $this->relationResolver->resolveRelations(
                $subSchema,
                0,
                $maxDepth,
                []
            );

            if ($definitions !== []) {
                $typeSchema->setDefinitions($definitions);
            }
        }

        return $typeSchema;
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
    private function adjustSchemaId(\stdClass $schema): \stdClass
    {
        if (!isset($schema->id)) {
            return $schema;
        }
        $target = new \stdClass();
        // @todo PhpStan complaints about not being able to iterate over $schema
        // @phpstan-ignore-next-line
        foreach ($schema as $key => $value) {
            $targetKey = $key === 'id' ? '$id' : $key;
            $target->{$targetKey} = $value;
        }
        return $target;
    }

    private function assignSchemaMetadata(TcaSchema $schema, Schema $jsonSchema): Schema
    {
        // @todo `$id` probably should be "local", since it could contain custom adjustments
        $jsonSchema->setId('http://typo3.org/schemas/' . str_replace('.', '/', $schema->getName()) . '.json');
        if ($schema->getTitle() !== '') {
            $jsonSchema->setTitle($schema->getTitle($this->getLanguageService()->sL(...)));
        } else {
            $jsonSchema->setTitle(sprintf('TYPO3 schema for table `%s`', $schema->getName()));
        }
        return $jsonSchema;
    }

    private function assignSubSchemaMetadata(TcaSchema $subSchema, string $typeValue, Schema $jsonSchema): Schema
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
        $jsonSchema->setTitle(sprintf('%s (type=%s)', $title ?? $subSchema->getName(), $typeValue));
        return $jsonSchema;
    }

    private function getLanguageService(): LanguageService
    {
        return $this->languageServiceFactory->create('default');
    }
}
