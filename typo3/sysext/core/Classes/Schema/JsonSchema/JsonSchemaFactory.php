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
use TYPO3\CMS\Core\Schema\TcaSchemaFactory;

/**
 * Factory for generating JSON Schema representations of TYPO3 TCA table structures.
 *
 * This factory converts TYPO3 Table Configuration Array (TCA) definitions into
 * valid JSON Schema documents using the swaggest/json-schema library.
 *
 * Features:
 * - Supports all TCA field types (except FlexForm - see @todo comments in FieldMapper)
 * - Generates unified schemas with discriminator for type variations
 * - Handles nested relations with circular reference detection
 * - Configurable depth limiting for relation resolution
 *
 * Example usage:
 * ```php
 * $jsonSchemaFactory = GeneralUtility::makeInstance(JsonSchemaFactory::class);
 *
 * // Generate flat schema for pages table (all types unified)
 * $schema = $jsonSchemaFactory->generateSchemaForTable('pages', nested: false);
 *
 * // Generate nested schema with relations (max 3 levels deep)
 * $schemaWithRelations = $jsonSchemaFactory->generateSchemaForTable(
 *     'tt_content',
 *     nested: true,
 *     maxDepth: 3
 * );
 *
 * // Convert to JSON
 * $jsonSchema = json_encode($schema->jsonSerialize(), JSON_PRETTY_PRINT);
 * ```
 *
 * @see https://json-schema.org/
 * @internal
 */
#[Autoconfigure(public: true, shared: true)]
final readonly class JsonSchemaFactory
{
    public function __construct(
        private TcaSchemaFactory $tcaSchemaFactory,
        private SchemaBuilder $schemaBuilder,
    ) {}

    /**
     * Generate a JSON Schema for an entire table including all type variations.
     *
     * When a table has type variations (sub-schemata), this generates a unified schema
     * using a discriminator pattern with oneOf to represent all possible types.
     *
     * @param string $tableName The name of the table (e.g., 'pages', 'tt_content')
     * @param bool $nested Whether to recursively resolve relations (default: false)
     * @param int $maxDepth Maximum depth for relation resolution when nested=true (default: 5)
     * @return \stdClass The generated JSON Schema object
     * @throws \TYPO3\CMS\Core\Schema\Exception\UndefinedSchemaException If table does not exist
     * @throws \InvalidArgumentException If maxDepth is less than 1
     */
    public function generateSchemaForTable(
        string $tableName,
        bool $nested = false,
        int $maxDepth = 5
    ): \stdClass {
        if ($maxDepth < 1) {
            throw new \InvalidArgumentException(
                sprintf('maxDepth must be at least 1, got: %d', $maxDepth),
                1735554000
            );
        }

        $tcaSchema = $this->tcaSchemaFactory->get($tableName);

        return $this->schemaBuilder->buildUnifiedSchemaWithTypes(
            $tcaSchema,
            $nested,
            $maxDepth
        );
    }

    /**
     * Generate a JSON Schema for a specific type variation of a table.
     *
     * This generates a schema for a single sub-schema (type variation) rather than
     * a unified schema with all types.
     *
     * @param string $tableName The name of the table (e.g., 'pages', 'tt_content')
     * @param string $type The type value (e.g., '1', 'text', 'header')
     * @param bool $nested Whether to recursively resolve relations (default: false)
     * @param int $maxDepth Maximum depth for relation resolution when nested=true (default: 5)
     * @return \stdClass The generated JSON Schema object
     * @throws \TYPO3\CMS\Core\Schema\Exception\UndefinedSchemaException If table or type does not exist
     * @throws \InvalidArgumentException If maxDepth is less than 1
     */
    public function generateSchemaForType(
        string $tableName,
        string $type,
        bool $nested = false,
        int $maxDepth = 5
    ): \stdClass {
        if ($maxDepth < 1) {
            throw new \InvalidArgumentException(
                sprintf('maxDepth must be at least 1, got: %d', $maxDepth),
                1735554001
            );
        }

        // Get the sub-schema directly using dot notation
        $schemaName = $tableName . '.' . $type;
        $tcaSchema = $this->tcaSchemaFactory->get($schemaName);

        return $this->schemaBuilder->buildSchemaForTable(
            $tcaSchema,
            $nested,
            $maxDepth,
        );
    }
}
