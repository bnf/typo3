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
use TYPO3\CMS\Core\Schema\TcaSchema;
use TYPO3\CMS\Core\Schema\TcaSchemaFactory;

/**
 * Handles nested relation resolution with circular reference detection.
 *
 * This class is responsible for:
 * - Recursively resolving relations from TCA schemas
 * - Detecting and handling circular references
 * - Managing depth limits to prevent infinite recursion
 * - Building $defs sections with reusable schemas
 *
 * @internal
 */
#[Autoconfigure(public: true, shared: true)]
final readonly class RelationResolver
{
    public function __construct(
        private TcaSchemaFactory $tcaSchemaFactory,
        private FieldMapper $fieldMapper,
    ) {}

    /**
     * Resolve all relations for a schema recursively.
     *
     * Returns an array of schema definitions that can be used in the $defs
     * section of the main schema.
     *
     * @param TcaSchema $schema The schema to resolve relations for
     * @param int $currentDepth Current recursion depth
     * @param int $maxDepth Maximum allowed depth
     * @param array $visitedSchemas Tracking array for circular reference detection (schemaName => depth)
     * @return array<string, Schema> Array of schema definitions keyed by table name
     */
    public function resolveRelations(
        TcaSchema $schema,
        int $currentDepth,
        int $maxDepth,
        array $visitedSchemas = []
    ): array {
        // Check depth limit
        if ($currentDepth >= $maxDepth) {
            return [];
        }

        $definitions = [];

        // Get active relations (outgoing relations from this schema)
        $activeRelations = $schema->getActiveRelations();

        foreach ($activeRelations as $relation) {
            $targetTable = $relation->toTable();

            // Skip if we've already visited this table at this depth or deeper
            // This prevents circular references
            if ($this->detectCircularReference($targetTable, $visitedSchemas, $currentDepth)) {
                // For circular references, we just create a reference placeholder
                // The actual schema is already being built or has been built
                continue;
            }

            // Skip if we've already added this definition
            if (isset($definitions[$targetTable])) {
                continue;
            }

            // Try to get the target schema
            try {
                $targetSchema = $this->tcaSchemaFactory->get($targetTable);
            } catch (\TYPO3\CMS\Core\Schema\Exception\UndefinedSchemaException $e) {
                // Target table doesn't exist or isn't accessible, skip it
                continue;
            }

            // Mark this schema as visited at this depth
            $newVisited = $visitedSchemas;
            $newVisited[$targetTable] = $currentDepth + 1;

            // Build the schema for the target table
            $targetJsonSchema = $this->buildSchemaForRelatedTable(
                $targetSchema,
                $currentDepth + 1,
                $maxDepth,
                $newVisited
            );

            $definitions[$targetTable] = $targetJsonSchema;

            // Recursively resolve relations from the target table
            $nestedDefinitions = $this->resolveRelations(
                $targetSchema,
                $currentDepth + 1,
                $maxDepth,
                $newVisited
            );

            // Merge nested definitions (avoid overwriting)
            foreach ($nestedDefinitions as $nestedTable => $nestedSchema) {
                if (!isset($definitions[$nestedTable])) {
                    $definitions[$nestedTable] = $nestedSchema;
                }
            }
        }

        return $definitions;
    }

    /**
     * Detect if accessing a schema would create a circular reference.
     *
     * @param string $schemaName The schema name to check
     * @param array $visitedSchemas Array of visited schemas with their depths
     * @param int $currentDepth Current recursion depth
     * @return bool True if this would create a circular reference
     */
    private function detectCircularReference(
        string $schemaName,
        array $visitedSchemas,
        int $currentDepth
    ): bool {
        // If we've visited this schema before in the current path
        if (isset($visitedSchemas[$schemaName])) {
            // It's a circular reference
            return true;
        }

        return false;
    }

    /**
     * Build a JSON Schema for a related table.
     *
     * This creates a simplified schema for the related table with all its fields
     * but without deeply nesting further relations (those are handled by the
     * recursive resolveRelations call).
     *
     * @param TcaSchema $schema The related table schema
     * @param int $currentDepth Current recursion depth
     * @param int $maxDepth Maximum allowed depth
     * @param array $visitedSchemas Tracking array for circular references
     * @return Schema The generated JSON Schema
     */
    private function buildSchemaForRelatedTable(
        TcaSchema $schema,
        int $currentDepth,
        int $maxDepth,
        array $visitedSchemas
    ): Schema {
        $schemaName = $schema->getName();

        // Create schema object
        $jsonSchema = Schema::object();
        $jsonSchema->title = sprintf('TYPO3 %s', ucfirst($schemaName));

        // Build properties from fields
        $properties = new \stdClass();
        $required = [];

        foreach ($schema->getFields() as $field) {
            $fieldName = $field->getName();
            $fieldSchema = $this->fieldMapper->mapFieldToSchema($field);

            if ($fieldSchema !== null) {
                $properties->{$fieldName} = $fieldSchema;

                if ($field->isRequired() && !$field->isNullable()) {
                    $required[] = $fieldName;
                }
            }
        }

        $jsonSchema->properties = $properties;

        if ($required !== []) {
            $jsonSchema->required = $required;
        }

        return $jsonSchema;
    }

    /**
     * Create a reference to a schema definition.
     *
     * This creates a $ref pointer to a schema in the $defs section.
     *
     * @param string $tableName The table name to reference
     * @return Schema A schema with a $ref property
     */
    public function createReference(string $tableName): Schema
    {
        $schema = new Schema();
        $schema->setFromRef('#/$defs/' . $tableName);
        return $schema;
    }
}
