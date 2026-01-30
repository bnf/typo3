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
use TYPO3\CMS\Core\Schema\ActiveRelation;
use TYPO3\CMS\Core\Schema\Field\CategoryFieldType;
use TYPO3\CMS\Core\Schema\Field\CheckboxFieldType;
use TYPO3\CMS\Core\Schema\Field\ColorFieldType;
use TYPO3\CMS\Core\Schema\Field\CountryFieldType;
use TYPO3\CMS\Core\Schema\Field\DateTimeFieldType;
use TYPO3\CMS\Core\Schema\Field\EmailFieldType;
use TYPO3\CMS\Core\Schema\Field\FieldTypeInterface;
use TYPO3\CMS\Core\Schema\Field\FileFieldType;
use TYPO3\CMS\Core\Schema\Field\FlexFormFieldType;
use TYPO3\CMS\Core\Schema\Field\FolderFieldType;
use TYPO3\CMS\Core\Schema\Field\GroupFieldType;
use TYPO3\CMS\Core\Schema\Field\ImageManipulationFieldType;
use TYPO3\CMS\Core\Schema\Field\InlineFieldType;
use TYPO3\CMS\Core\Schema\Field\InputFieldType;
use TYPO3\CMS\Core\Schema\Field\JsonFieldType;
use TYPO3\CMS\Core\Schema\Field\LanguageFieldType;
use TYPO3\CMS\Core\Schema\Field\LinkFieldType;
use TYPO3\CMS\Core\Schema\Field\NoneFieldType;
use TYPO3\CMS\Core\Schema\Field\NumberFieldType;
use TYPO3\CMS\Core\Schema\Field\PassthroughFieldType;
use TYPO3\CMS\Core\Schema\Field\PasswordFieldType;
use TYPO3\CMS\Core\Schema\Field\RadioFieldType;
use TYPO3\CMS\Core\Schema\Field\RelationalFieldTypeInterface;
use TYPO3\CMS\Core\Schema\Field\SelectRelationFieldType;
use TYPO3\CMS\Core\Schema\Field\SlugFieldType;
use TYPO3\CMS\Core\Schema\Field\StaticSelectFieldType;
use TYPO3\CMS\Core\Schema\Field\TextFieldType;
use TYPO3\CMS\Core\Schema\Field\UserFieldType;
use TYPO3\CMS\Core\Schema\Field\UuidFieldType;

/**
 * Maps TYPO3 TCA field types to JSON Schema type definitions.
 *
 * This class handles the conversion of all TYPO3 field types to their
 * appropriate JSON Schema representations, including:
 * - Type mapping (string, integer, boolean, etc.)
 * - Format specifications (email, uri, date-time, etc.)
 * - Validation constraints (min, max, pattern, enum, etc.)
 * - Nullability and required status
 * - Default values
 *
 * @internal
 */
#[Autoconfigure(public: true, shared: true)]
final readonly class FieldMapper
{
    public function __construct(private LanguageServiceFactory $languageServiceFactory) {}

    /**
     * Map a TYPO3 field to a JSON Schema property definition.
     *
     * Returns null for fields that should not appear in the schema (e.g., NoneFieldType).
     *
     * @param FieldTypeInterface $field The TYPO3 field to map
     * @return Schema|null The JSON Schema for this field, or null if field should be omitted
     */
    public function mapFieldToSchema(FieldTypeInterface $field): ?Schema
    {
        $schema = match (true) {
            $field instanceof InputFieldType => $this->mapInputField($field),
            $field instanceof TextFieldType => $this->mapTextField($field),
            $field instanceof NumberFieldType => $this->mapNumberField($field),
            $field instanceof EmailFieldType => $this->mapEmailField($field),
            $field instanceof PasswordFieldType => $this->mapPasswordField($field),
            $field instanceof DateTimeFieldType => $this->mapDateTimeField($field),
            $field instanceof ColorFieldType => $this->mapColorField($field),
            $field instanceof LinkFieldType => $this->mapLinkField($field),
            $field instanceof SlugFieldType => $this->mapSlugField($field),
            $field instanceof UuidFieldType => $this->mapUuidField($field),
            $field instanceof JsonFieldType => $this->mapJsonField($field),
            $field instanceof CheckboxFieldType => $this->mapCheckboxField($field),
            $field instanceof RadioFieldType => $this->mapRadioField($field),
            $field instanceof SelectRelationFieldType => $this->mapSelectRelationField($field),
            $field instanceof StaticSelectFieldType => $this->mapStaticSelectField($field),
            $field instanceof GroupFieldType => $this->mapGroupField($field),
            $field instanceof InlineFieldType => $this->mapInlineField($field),
            $field instanceof FileFieldType => $this->mapFileField($field),
            $field instanceof FolderFieldType => $this->mapFolderField($field),
            $field instanceof CategoryFieldType => $this->mapCategoryField($field),
            $field instanceof FlexFormFieldType => $this->mapFlexFormField($field),
            $field instanceof ImageManipulationFieldType => $this->mapImageManipulationField($field),
            $field instanceof LanguageFieldType => $this->mapLanguageField($field),
            $field instanceof NoneFieldType => null, // Display-only, omit from schema
            $field instanceof PassthroughFieldType => $this->mapPassthroughField($field),
            $field instanceof UserFieldType => $this->mapUserField($field),
            $field instanceof CountryFieldType => $this->mapCountryField($field),
            default => $this->mapGenericField($field),
        };

        if ($schema === null) {
            return null;
        }

        // Add common metadata
        $this->applyCommonProperties($schema, $field);

        return $schema;
    }

    /**
     * Apply common properties to all field schemas.
     */
    private function applyCommonProperties(Schema $schema, FieldTypeInterface $field): void
    {
        // Add title from label
        $label = $field->getLabel();
        if ($label !== '') {
            $schema->setTitle($this->getLanguageService()->sL($label));
        }

        // Handle nullability
        if ($field->isNullable()) {
            // Make the type nullable by allowing null
            if (!empty($schema->type)) {
                $currentType = $schema->type;
                $schema->type = is_array($currentType)
                    ? array_merge($currentType, ['null'])
                    : [$currentType, 'null'];
            }
        }

        // Add default value if available
        if ($field->hasDefaultValue()) {
            $schema->default = $field->getDefaultValue();
        }
    }

    private function mapInputField(InputFieldType $field): Schema
    {
        $schema = Schema::string();
        $config = $field->getConfiguration();

        if (isset($config['max']) && is_int($config['max'])) {
            $schema->maxLength = $config['max'];
        }

        if (isset($config['min']) && is_int($config['min'])) {
            $schema->minLength = $config['min'];
        }

        // Add pattern if eval contains specific validation
        if (isset($config['eval'])) {
            $eval = $config['eval'];
            if (str_contains($eval, 'alphanum')) {
                $schema->pattern = '^[a-zA-Z0-9]*$';
            } elseif (str_contains($eval, 'alpha')) {
                $schema->pattern = '^[a-zA-Z]*$';
            } elseif (str_contains($eval, 'num')) {
                $schema->pattern = '^[0-9]*$';
            }
        }

        return $schema;
    }

    private function mapTextField(TextFieldType $field): Schema
    {
        $schema = Schema::string();
        $config = $field->getConfiguration();

        // Check if this is rich text
        if (isset($config['enableRichtext']) && $config['enableRichtext'] === true) {
            $schema->description = 'Rich text content (HTML)';
            $schema->format = 'html';
        }

        if (isset($config['max']) && is_int($config['max'])) {
            $schema->maxLength = $config['max'];
        }

        return $schema;
    }

    private function mapNumberField(NumberFieldType $field): Schema
    {
        $config = $field->getConfiguration();
        $format = $config['format'] ?? 'integer';

        // Determine if integer or decimal
        $schema = ($format === 'decimal') ? Schema::number() : Schema::integer();

        if (isset($config['range']['lower'])) {
            $schema->minimum = is_numeric($config['range']['lower'])
                ? (float)$config['range']['lower']
                : null;
        }

        if (isset($config['range']['upper'])) {
            $schema->maximum = is_numeric($config['range']['upper'])
                ? (float)$config['range']['upper']
                : null;
        }

        return $schema;
    }

    private function mapEmailField(EmailFieldType $field): Schema
    {
        $schema = Schema::string();
        $schema->format = 'email';
        return $schema;
    }

    private function mapPasswordField(PasswordFieldType $field): Schema
    {
        $schema = Schema::string();
        $schema->format = 'password';
        return $schema;
    }

    private function mapDateTimeField(DateTimeFieldType $field): Schema
    {
        $schema = Schema::string();
        $config = $field->getConfiguration();
        $dbType = $config['dbType'] ?? 'datetime';

        // Map database types to JSON Schema formats
        $schema->format = match ($dbType) {
            'date' => 'date',
            'time' => 'time',
            default => 'date-time',
        };

        return $schema;
    }

    private function mapColorField(ColorFieldType $field): Schema
    {
        $schema = Schema::string();
        // Pattern for hex color codes
        $schema->pattern = '^#[0-9A-Fa-f]{6}$';
        $schema->description = 'Hex color code';
        return $schema;
    }

    private function mapLinkField(LinkFieldType $field): Schema
    {
        $schema = Schema::string();
        $schema->format = 'uri';
        return $schema;
    }

    private function mapSlugField(SlugFieldType $field): Schema
    {
        $schema = Schema::string();
        $schema->pattern = '^[a-z0-9]+(?:-[a-z0-9]+)*$';
        $schema->description = 'URL-friendly slug';
        return $schema;
    }

    private function mapUuidField(UuidFieldType $field): Schema
    {
        $schema = Schema::string();
        $schema->format = 'uuid';
        return $schema;
    }

    private function mapJsonField(JsonFieldType $field): Schema
    {
        // JSON fields can contain objects or arrays
        $schema = new Schema();
        $schema->oneOf = [
            Schema::object(),
            Schema::arr(),
        ];
        return $schema;
    }

    private function mapCheckboxField(CheckboxFieldType $field): Schema
    {
        $config = $field->getConfiguration();

        // Check if this is a bitmask (multiple items)
        if (isset($config['items']) && is_array($config['items']) && count($config['items']) > 1) {
            // Bitmask checkbox - represented as integer
            return Schema::integer();
        }

        // Single checkbox - represented as boolean
        return Schema::boolean();
    }

    private function mapRadioField(RadioFieldType $field): Schema
    {
        $config = $field->getConfiguration();
        $schema = new Schema();

        // Extract enum values from items
        if (isset($config['items']) && is_array($config['items'])) {
            $enumValues = [];
            foreach ($config['items'] as $item) {
                if (isset($item['value'])) {
                    $enumValues[] = $item['value'];
                }
            }

            if ($enumValues !== []) {
                $schema->enum = $enumValues;
                // Determine type from first value
                $firstValue = $enumValues[0];
                $schema->type = is_int($firstValue) ? 'integer' : 'string';
            } else {
                $schema = Schema::string();
            }
        } else {
            $schema = Schema::string();
        }

        return $schema;
    }

    private function mapSelectRelationField(SelectRelationFieldType $field): Schema
    {
        $config = $field->getConfiguration();
        $maxItems = $config['maxitems'] ?? 1;

        // Check if single or multiple selection
        if ($maxItems === 1) {
            // Single selection - can be reference or simple value
            $schema = new Schema();
            $schema->oneOf = [
                Schema::integer(), // UID reference
                Schema::string(),  // Sometimes string identifiers
            ];
        } else {
            // Multiple selection - array of references
            $schema = Schema::arr();
            $itemSchema = new Schema();
            $itemSchema->oneOf = [
                Schema::integer(),
                Schema::string(),
            ];
            $schema->items = $itemSchema;

            if ($maxItems > 1) {
                $schema->maxItems = $maxItems;
            }
        }

        // Add note about relations
        $relations = $this->resolveActiveRelations($field);
        if ($relations !== []) {
            $targetTables = array_map(static fn($relation) => $relation->toTable(), $relations);
            $schema->description = 'References to: ' . implode(', ', array_unique($targetTables));
        }

        return $schema;
    }

    private function mapStaticSelectField(StaticSelectFieldType $field): Schema
    {
        $config = $field->getConfiguration();
        $schema = new Schema();

        // Extract enum values from items
        if (isset($config['items']) && is_array($config['items'])) {
            $enumValues = [];
            foreach ($config['items'] as $item) {
                if (is_array($item) && isset($item['value'])) {
                    $enumValues[] = $item['value'];
                } elseif (is_array($item) && isset($item[1])) {
                    $enumValues[] = $item[1];
                }
            }

            if ($enumValues !== []) {
                $maxItems = $config['maxitems'] ?? 1;

                if ($maxItems === 1) {
                    // Single selection
                    $schema->enum = $enumValues;
                    $firstValue = $enumValues[0];
                    $schema->type = is_int($firstValue) ? 'integer' : 'string';
                } else {
                    // Multiple selection
                    $schema = Schema::arr();
                    $itemSchema = new Schema();
                    $itemSchema->enum = $enumValues;
                    $schema->items = $itemSchema;
                }
            } else {
                $schema = Schema::string();
            }
        } else {
            $schema = Schema::string();
        }

        return $schema;
    }

    private function mapGroupField(GroupFieldType $field): Schema
    {
        $config = $field->getConfiguration();
        $maxItems = $config['maxitems'] ?? 1;

        // Group fields are relational, typically multiple items
        if ($maxItems === 1) {
            $schema = Schema::string(); // Single reference, often as "table_uid"
        } else {
            $schema = Schema::arr();
            $schema->items = Schema::string();
            if ($maxItems > 1) {
                $schema->maxItems = $maxItems;
            }
        }

        // Add note about allowed tables
        $relations = $this->resolveActiveRelations($field);
        if ($relations !== []) {
            $targetTables = array_map(static fn(ActiveRelation $relation) => $relation->toTable(), $relations);
            $schema->description = 'References to: ' . implode(', ', array_unique($targetTables));
        }

        return $schema;
    }

    private function mapInlineField(InlineFieldType $field): Schema
    {
        $config = $field->getConfiguration();
        $maxItems = $config['maxitems'] ?? 0;

        // Inline fields represent child records (1:n relationship)
        $schema = Schema::arr();
        $schema->items = Schema::integer(); // UIDs of child records

        if ($maxItems > 0) {
            $schema->maxItems = $maxItems;
        }

        // Add note about foreign table
        $relations = $this->resolveActiveRelations($field);
        if ($relations !== []) {
            $targetTable = $relations[0]->toTable();
            $schema->description = sprintf('Child records from table: %s', $targetTable);
        }

        return $schema;
    }

    private function mapFileField(FileFieldType $field): Schema
    {
        $config = $field->getConfiguration();
        $maxItems = $config['maxitems'] ?? 0;

        // File fields reference sys_file_reference records
        $schema = Schema::arr();
        $schema->items = Schema::integer(); // UIDs of sys_file_reference

        if ($maxItems > 0) {
            $schema->maxItems = $maxItems;
        }

        // Add note about allowed file types
        if (isset($config['allowed']) && $config['allowed'] !== '') {
            $schema->description = sprintf('Allowed file types: %s', $config['allowed']);
        } else {
            $schema->description = 'File references (sys_file_reference)';
        }

        return $schema;
    }

    private function mapFolderField(FolderFieldType $field): Schema
    {
        $schema = Schema::string();
        $schema->description = 'Folder path';
        return $schema;
    }

    private function mapCategoryField(CategoryFieldType $field): Schema
    {
        $config = $field->getConfiguration();
        $maxItems = $config['maxitems'] ?? 0;

        // Category fields reference sys_category
        if ($maxItems === 1) {
            $schema = Schema::integer();
            $schema->description = 'Category reference (sys_category UID)';
        } else {
            $schema = Schema::arr();
            $schema->items = Schema::integer();
            $schema->description = 'Category references (sys_category UIDs)';

            if ($maxItems > 0) {
                $schema->maxItems = $maxItems;
            }
        }

        return $schema;
    }

    private function mapFlexFormField(FlexFormFieldType $field): Schema
    {
        // @todo: FlexForm field type handling not yet implemented
        // FlexForms require recursive schema generation for nested data structures
        // This would need to parse the FlexForm XML structure and generate
        // nested schemas accordingly. For now, we represent it as a generic object.
        $schema = Schema::object();
        $schema->description = 'FlexForm data structure (nested configuration)';
        return $schema;
    }

    private function mapImageManipulationField(ImageManipulationFieldType $field): Schema
    {
        $schema = Schema::object();
        $schema->description = 'Image manipulation/cropping data';
        return $schema;
    }

    private function mapLanguageField(LanguageFieldType $field): Schema
    {
        $schema = Schema::integer();
        $schema->description = 'Language ID (sys_language UID)';
        $schema->minimum = 0;
        return $schema;
    }

    private function mapPassthroughField(PassthroughFieldType $field): Schema
    {
        // Passthrough fields are typically handled by the database
        // Use a generic type based on common usage
        $schema = new Schema();
        $schema->oneOf = [
            Schema::string(),
            Schema::integer(),
        ];
        $schema->description = 'Passthrough field (database-managed)';
        return $schema;
    }

    private function mapUserField(UserFieldType $field): Schema
    {
        // User fields have custom rendering, generic type
        $schema = Schema::string();
        $schema->description = 'Custom user field';
        return $schema;
    }

    private function mapCountryField(CountryFieldType $field): Schema
    {
        $schema = Schema::string();
        $schema->pattern = '^[A-Z]{2}$';
        $schema->description = 'ISO 3166-1 alpha-2 country code';
        return $schema;
    }

    private function mapGenericField(FieldTypeInterface $field): Schema
    {
        // Fallback for any unknown field types
        $schema = Schema::string();
        $schema->description = sprintf('Generic field (type: %s)', $field->getType());
        return $schema;
    }

    /**
     * @return list<ActiveRelation>
     */
    private function resolveActiveRelations(FieldTypeInterface $field): array
    {
        return $field instanceof RelationalFieldTypeInterface ? $field->getRelations() : [];
    }

    private function getLanguageService(): LanguageService
    {
        return $this->languageServiceFactory->create('default');
    }
}
