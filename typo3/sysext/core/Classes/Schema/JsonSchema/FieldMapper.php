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
use TYPO3\CMS\Core\Schema\RelationshipType;

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
final readonly class FieldMapper
{
    public function __construct(private LanguageServiceFactory $languageServiceFactory) {}

    /**
     * Map a TYPO3 field to a JSON Schema property definition.
     *
     * Returns null for fields that should not appear in the schema (e.g., NoneFieldType).
     *
     * @param FieldTypeInterface $field The TYPO3 field to map
     * @return Schema The JSON Schema for this field, or null if field should be omitted
     */
    public function mapFieldToSchema(FieldTypeInterface $field): Schema
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
            // @todo: possible test case typo3tests_contentelementb_select_one_to_one
            //$field instanceof SelectRelationFieldType => $this->mapSelectRelationField($field),
            $field instanceof StaticSelectFieldType => $this->mapStaticSelectField($field),
            //$field instanceof GroupFieldType => $this->mapGroupField($field),
            $field instanceof InlineFieldType => $this->mapInlineField($field),
            $field instanceof FileFieldType => $this->mapFileField($field),
            $field instanceof FolderFieldType => $this->mapFolderField($field),
            $field instanceof CategoryFieldType => $this->mapCategoryField($field),
            $field instanceof FlexFormFieldType => $this->mapFlexFormField($field),
            $field instanceof ImageManipulationFieldType => $this->mapImageManipulationField($field),
            $field instanceof LanguageFieldType => $this->mapLanguageField($field),
            $field instanceof NoneFieldType => $this->mapNoneField($field),
            $field instanceof PassthroughFieldType => $this->mapPassthroughField($field),
            $field instanceof UserFieldType => $this->mapUserField($field),
            $field instanceof CountryFieldType => $this->mapCountryField($field),
            $field instanceof RelationalFieldTypeInterface => $this->mapRelationField($field),
            default => $this->mapGenericField($field),
        };

        /*
        if ($schema === null) {
            return null;
        }
        */

        // Add common metadata
        $schema = $this->applyCommonProperties($schema, $field);

        return $schema;
    }

    /**
     * Map a TYPO3 field to a JSON Schema property definition for writing records.
     *
     * Returns null for fields that can not be written (e.g. passthrough fields,
     * which carry the parent pointer of inline children and are maintained by DataHandler).
     */
    public function mapFieldToInputSchema(FieldTypeInterface $field): ?Schema
    {
        if ($field instanceof NoneFieldType
            || $field instanceof PassthroughFieldType
            || ($field->getConfiguration()['readOnly'] ?? false)
        ) {
            return null;
        }

        if ($field instanceof InlineFieldType) {
            $targetTable = ($this->resolveActiveRelations($field)[0] ?? null)?->toTable();
            if ($targetTable === null || $targetTable === '') {
                return null;
            }
            return $this->applyCommonProperties($this->mapInlineInputField($field, $targetTable), $field);
        }

        $schema = match (true) {
            $field instanceof FileFieldType => $this->mapInlineInputField($field, 'sys_file_reference'),
            $field instanceof CategoryFieldType => $this->mapRelationField($field),
            $field instanceof GroupFieldType && $this->referencesFilesOnly($field) => $this->mapFileRelationInputField($field),
            $field instanceof LinkFieldType => new Schema(type: 'string', description: 'TypoLink'),
            default => null,
        };
        return $schema === null
            ? $this->mapFieldToSchema($field)
            : $this->applyCommonProperties($schema, $field);
    }

    /**
     * Map a TYPO3 field to a JSON Schema property definition for changing records.
     *
     * Inline children are given as the complete new list: existing children are
     * identified by their uid and changed, children without uid are created,
     * and existing children not listed are deleted.
     */
    public function mapFieldToPatchSchema(FieldTypeInterface $field): ?Schema
    {
        $schema = $this->mapFieldToInputSchema($field);
        if ($schema === null || !($field instanceof InlineFieldType || $field instanceof FileFieldType)) {
            return $schema;
        }
        $targetTable = $field instanceof FileFieldType
            ? 'sys_file_reference'
            : $this->resolveActiveRelations($field)[0]->toTable();
        return $this->applyCommonProperties($this->mapInlinePatchField($field, $targetTable), $field);
    }

    /**
     * Apply common properties to all field schemas.
     */
    private function applyCommonProperties(Schema $schema, FieldTypeInterface $field): Schema
    {
        $properties = [];
        // Add title from label
        $label = $field->getLabel();
        if ($label !== '') {
            $properties['title'] = $this->getLanguageService()->sL($label);
        }

        $isNullable = $field->isNullable()
            // @todo these field types should report nullability by
            // themselves, since they `DefaultTcaSchema` counterpart generates `notnull' => false` by default
            || $field instanceof FolderFieldType
            || $field instanceof ImageManipulationFieldType
            || $field instanceof FlexFormFieldType
            || $field instanceof TextFieldType
            || $field instanceof GroupFieldType && $field->getRelationshipType() !== RelationshipType::ManyToMany;

        // Handle nullability
        if ($isNullable) {
            // Make the type nullable by allowing null
            // @todo this probably needs to be `anyOf` for MCP schema compat
            // @todo nullable actually needs to be handled by the type (e.g. datetime)
            if (!empty($schema->type)) {
                $currentType = $schema->type;
                $properties['type'] = is_array($currentType)
                    ? array_merge($currentType, ['null'])
                    : [$currentType, 'null'];
            }
        }

        // Add default value if available
        if ($field->hasDefaultValue()) {
            $properties['default'] = $field->getDefaultValue();
        }

        return $schema->with($properties);
    }

    private function mapInputField(InputFieldType $field): Schema
    {
        $config = $field->getConfiguration();
        $eval = $config['eval'] ?? '';
        $maxLength = isset($config['max']) && is_int($config['max']) ? $config['max'] : null;
        $minLength = isset($config['min']) && is_int($config['min']) ? $config['min'] : null;
        $pattern = match (true) {
            str_contains($eval, 'alphanum') => '^[a-zA-Z0-9]*$',
            str_contains($eval, 'alpha') => '^[a-zA-Z]*$',
            str_contains($eval, 'num') => '^[0-9]*$',
            default => null,
        };

        $schema = new Schema(
            type: 'string',
            maxLength: $maxLength,
            minLength: $minLength,
            // Add pattern if eval contains specific validation
            pattern: match (true) {
                str_contains($eval, 'alphanum') => '^[a-zA-Z0-9]*$',
                str_contains($eval, 'alpha') => '^[a-zA-Z]*$',
                str_contains($eval, 'num') => '^[0-9]*$',
                default => null,
            },
        );

        // A min length also "allows" an empty string
        if ($minLength !== null) {
            $schema = new Schema(
                oneOf: [
                    $schema,
                    new Schema(const: ''),
                ],
            );
        }
        return $schema;
    }

    private function mapTextField(TextFieldType $field): Schema
    {
        $config = $field->getConfiguration();
        $isRichtext = isset($config['enableRichtext']) && $config['enableRichtext'] === true;

        return new Schema(
            type: 'string',
            format: $isRichtext ? 'html' : null,
            description: $isRichtext ? 'Rich text content (HTML)' : null,
            maxLength: isset($config['max']) && is_int($config['max']) ? $config['max'] : null,
        );
    }

    private function mapNumberField(NumberFieldType $field): Schema
    {
        $config = $field->getConfiguration();
        $format = $config['format'] ?? 'integer';

        // Determine if integer or decimal
        return new Schema(
            type: $format === 'decimal' ? 'number' : 'integer',
            minimum: is_numeric($config['range']['lower'] ?? null)
                ? (float)$config['range']['lower']
                : null,
            maximum: is_numeric($config['range']['upper'] ?? null)
                ? (float)$config['range']['upper']
                : null,
        );
    }

    private function mapEmailField(EmailFieldType $field): Schema
    {
        return new Schema(
            anyOf: [
                new Schema(
                    type: 'string',
                    format: 'email',
                ),
                // allow empty values
                new Schema(
                    type: 'string',
                    const: '',
                ),
            ],
        );
    }

    private function mapPasswordField(PasswordFieldType $field): Schema
    {
        return new Schema(
            type: 'string',
            format: 'password',
        );
    }

    private function mapDateTimeField(DateTimeFieldType $field): Schema
    {
        $config = $field->getConfiguration();
        $dbType = $config['dbType'] ?? 'datetime';

        return new Schema(
            oneOf: [
                new Schema(
                    type: 'string',
                    format: match ($dbType) {
                        // @todo match schema type in RecordSerializer and enable concrete formats here
                        //'date' => 'date',
                        //'time' => 'time',
                        default => 'date-time',
                    },
                ),
                new Schema(type: 'null'),
            ],
        );
    }

    private function mapColorField(ColorFieldType $field): Schema
    {
        return new Schema(
            oneOf: [
                new Schema(
                    type: 'string',
                    // Pattern for hex color codes
                    pattern: '^#[0-9A-Fa-f]{6}$',
                    description: 'Hex color code',
                ),
                new Schema(
                    const: ''
                ),
            ]
        );
    }

    private function mapLinkField(LinkFieldType $field): Schema
    {
        /*
        return new Schema(
            type: 'string',
            format: 'uri',
        );
         */
        return new Schema(
            type: 'object',
            // @todo describe properties
            //\"url\":\"\",\"target\":\"\",\"class\":\"\",\"title\":\"\",\"additionalParams\":\"\"}
        );
    }

    private function mapSlugField(SlugFieldType $field): Schema
    {
        return new Schema(
            oneOf: [
                new Schema(
                    type: 'string',
                    pattern: '^[/a-z0-9]+(?:-[/a-z0-9]+)*$',
                ),
                new Schema(
                    type: 'null',
                ),
                // @todo: should we serialize an empty slug as `null`?
                new Schema(
                    const: '',
                ),
            ],
            description: 'URL-friendly slug',
        );
    }

    private function mapUuidField(UuidFieldType $field): Schema
    {
        return new Schema(
            type: 'string',
            format: 'uuid',
        );
    }

    private function mapJsonField(JsonFieldType $field): Schema
    {
        // JSON fields can contain any valid json data per design
        return new Schema();
    }

    private function mapCheckboxField(CheckboxFieldType $field): Schema
    {
        $config = $field->getConfiguration();

        // Check if this is a bitmask (multiple items)
        if (isset($config['items']) && is_array($config['items']) && count($config['items']) > 1) {
            // Bitmask checkbox - represented as integer
            return new Schema(type: 'integer');
        }

        // Single checkbox - represented as boolean
        return new Schema(
            // @todo adapt RecordFieldTransformer to create a bool value instead of an integer
            //type: 'boolean',
            type: 'integer',
        );
    }

    private function mapRadioField(RadioFieldType $field): Schema
    {
        $config = $field->getConfiguration();
        $hasItemsProcFunc = ($config['itemsProcFunc'] ?? '') !== ''
            || ($config['itemsProcessors'] ?? []) !== [];

        if ($hasItemsProcFunc) {
            return new Schema(
                anyOf: [
                    new Schema(type: 'string'),
                    new Schema(type: 'integer'),
                ],
            );
        }

        // Extract enum values from items
        if (isset($config['items']) && is_array($config['items'])) {
            $enumValues = [];
            foreach ($config['items'] as $item) {
                if (isset($item['value'])) {
                    $enumValues[] = $item['value'];
                }
            }

            if ($enumValues !== []) {
                $firstValue = $enumValues[0];
                return new Schema(
                    // Determine type from first value
                    type: is_int($firstValue) ? 'integer' : 'string',
                    enum: [...$enumValues, is_int($firstValue) ? 0 : ''],
                );
            }
        }

        return new Schema(
            type: 'string',
        );
    }

    private function mapStaticSelectField(StaticSelectFieldType $field): Schema
    {
        $config = $field->getConfiguration();
        $maxItems = $config['maxitems'] ?? null;
        $selectForcedToSingle = (string)($config['renderType'] ?? '') === 'selectSingle';

        // Extract enum values from items
        // @todo  enums do not really work since TSconfig or `itemsProcFunc` allow dynamic "allowed" values,
        //        and JsonSchema enums restrict the allowed values.
        //        We'd need to combine a allow-all-values schema via `anyOf`, but then the enum is actually meaningless
        /*
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
                $firstValue = $enumValues[0];
                if ($selectForcedToSingle) {
                    return new Schema(
                        type: is_numeric($firstValue) ? 'integer' : 'string',
                        enum: [
                            ...$enumValues,
                            is_numeric($firstValue) ? 0 : ''
                        ],
                    );
                }
                // Multiple selection
                return new Schema(
                    type: 'array',
                    items: new Schema(
                        type: is_numeric($firstValue) ? 'integer' : 'string',
                        enum: $enumValues,
                    ),
                    maxItems: $maxItems,
                );
            }
        }
        */

        // Decimal columns are returned as float by some database drivers (e.g. sqlite)
        $schema = new Schema(
            anyOf: [
                new Schema(type: 'string'),
                new Schema(type: 'integer'),
                new Schema(type: 'number'),
            ],
        );
        if (!$selectForcedToSingle) {
            // Multiple selection
            $schema = new Schema(
                type: 'array',
                items: $schema,
            );
        }

        return $schema;
    }

    private function mapRelationField(RelationalFieldTypeInterface&FieldTypeInterface $field): Schema
    {
        $relations = $this->resolveActiveRelations($field);
        $description = null;
        $targetTables = [];
        if ($relations !== []) {
            $targetTables = array_map(static fn(ActiveRelation $relation) => $relation->toTable(), $relations);
            $description = 'References to: ' . implode(', ', array_unique($targetTables));
        }

        $properties = [
            'uid' => new Schema(type: 'integer'),
            '_schema' => $targetTables !== [] && $targetTables !== ['*'] ? new Schema(enum: $targetTables) : new Schema(type: 'string'),
        ];
        $schema = new Schema(
            type: 'object',
            properties: [
                'uid' => new Schema(type: 'integer'),
                '_schema' => $targetTables !== [] && $targetTables !== ['*'] ? new Schema(enum: $targetTables) : new Schema(type: 'string'),
            ],
            additionalProperties: false,
        );

        if ($field->getRelationshipType()->hasOne()) {
            return new Schema(
                oneOf: [
                    $schema,
                    new Schema(type: 'null'),
                ],
                description: $description,
            );
        }

        $config = $field->getConfiguration();
        $maxItems = (int)($config['maxitems'] ?? 99999);
        return new Schema(
            type: 'array',
            items: $schema,
            maxItems: $maxItems > 0 && $maxItems !== 99999 ? $maxItems : null,
            description: $description,
        );
    }

    private function mapInlineField(InlineFieldType $field): Schema
    {
        //\TYPO3\CMS\Extbase\Utility\DebuggerUtility::var_dump($field);
        $config = $field->getConfiguration();
        $maxItems = $config['maxitems'] ?? 0;

        // Note about foreign table
        $relations = $this->resolveActiveRelations($field);
        $description = null;
        $targetTable = '';
        if ($relations !== []) {
            $targetTable = $relations[0]->toTable();
            $description = sprintf('Child records from table: %s', $targetTable);
        }

        $schema = new Schema(
            ref: '#/$defs/TYPO3.CMS.Core.Domain.Dto.Record_' . $targetTable . '_',
        );

        if ($field->getRelationshipType()->hasOne()) {
            return new Schema(
                oneOf: [
                    $schema,
                    new Schema(type: 'null'),
                ],
                description: $description,
            );
        }

        // Inline fields represent child records (1:n relationship)
        return new Schema(
            type: 'array',
            items: $schema,
            //// UIDs of child records
            //items: new Schema(type: 'integer'),
            maxItems: $maxItems > 0 ? $maxItems : null,
            description: $description,
        );
    }

    /**
     * Files can be referenced by uid or by their combined FAL identifier
     */
    private function mapFileRelationInputField(GroupFieldType $field): Schema
    {
        $schema = new Schema(
            oneOf: [
                new Schema(
                    type: 'object',
                    properties: [
                        '_schema' => new Schema(const: 'sys_file'),
                        'uid' => new Schema(type: 'integer'),
                    ],
                    required: ['_schema', 'uid'],
                    additionalProperties: false,
                ),
                new Schema(
                    type: 'object',
                    properties: [
                        '_schema' => new Schema(const: 'sys_file'),
                        'identifier' => new Schema(
                            type: 'string',
                            description: 'Combined FAL identifier, e.g. `1:/images/photo.jpg`',
                            pattern: '^[0-9]+:/',
                        ),
                    ],
                    required: ['_schema', 'identifier'],
                    additionalProperties: false,
                ),
            ],
        );

        if ($field->getRelationshipType()->hasOne()) {
            return new Schema(
                oneOf: [
                    $schema,
                    new Schema(type: 'null'),
                ],
                description: 'File reference',
            );
        }

        $maxItems = (int)($field->getConfiguration()['maxitems'] ?? 0);
        return new Schema(
            type: 'array',
            items: $schema,
            maxItems: $maxItems > 0 ? $maxItems : null,
            description: 'File references',
        );
    }

    private function referencesFilesOnly(GroupFieldType $field): bool
    {
        $tables = array_values(array_unique(array_map(
            static fn(ActiveRelation $relation): string => $relation->toTable(),
            $this->resolveActiveRelations($field),
        )));
        return $tables === ['sys_file'];
    }

    private function mapInlineInputField(InlineFieldType|FileFieldType $field, string $targetTable): Schema
    {
        return $this->mapInlineItems(
            $field,
            new Schema(ref: '#/$defs/' . RecordSchemaType::RecordInput->getSchemaName($targetTable)),
            sprintf('New child records of table: %s', $targetTable),
        );
    }

    private function mapInlinePatchField(InlineFieldType|FileFieldType $field, string $targetTable): Schema
    {
        return $this->mapInlineItems(
            $field,
            new Schema(
                oneOf: [
                    new Schema(ref: '#/$defs/' . RecordSchemaType::RecordInput->getSchemaName($targetTable)),
                    new Schema(
                        allOf: [
                            new Schema(ref: '#/$defs/' . RecordSchemaType::RecordPatch->getSchemaName($targetTable)),
                            new Schema(required: ['uid']),
                        ],
                    ),
                ],
            ),
            sprintf(
                'All child records of table %s: existing ones with uid are changed, ones without uid are created, existing ones not listed are deleted',
                $targetTable
            ),
        );
    }

    private function mapInlineItems(InlineFieldType|FileFieldType $field, Schema $schema, string $description): Schema
    {
        if ($field->getRelationshipType()->hasOne()) {
            return new Schema(
                oneOf: [
                    $schema,
                    new Schema(type: 'null'),
                ],
                description: $description,
            );
        }

        $maxItems = (int)($field->getConfiguration()['maxitems'] ?? 0);
        return new Schema(
            type: 'array',
            items: $schema,
            maxItems: $maxItems > 0 ? $maxItems : null,
            description: $description,
        );
    }

    private function mapFileField(FileFieldType $field): Schema
    {
        $config = $field->getConfiguration();

        $schema = new Schema(
            type: 'object',
            properties: [
                '_schema' => new Schema(const: 'sys_file'),
                'uid' => new Schema(type: 'integer'),
                'identifier' => new Schema(type: 'string'),
                'url' => new Schema(
                    oneOf: [
                        new Schema(type: 'string', format: 'uri-reference'),
                        new Schema(type: 'null'),
                    ]
                ),
            ],
            additionalProperties: false,
        );

        if ($field->getRelationshipType()->hasOne()) {
            return new Schema(
                oneOf: [
                    $schema,
                    new Schema(type: 'null'),
                ],
                // Note about allowed file types
                description: isset($config['allowed']) && $config['allowed'] !== ''
                    ? sprintf('Allowed file types: %s', $config['allowed'])
                    : 'File reference',
            );
        }

        $maxItems = $config['maxitems'] ?? 0;

        return new Schema(
            type: 'array',
            items: $schema,
            maxItems: $maxItems > 0 ? $maxItems : null,
            description: isset($config['allowed']) && $config['allowed'] !== ''
                ? sprintf('Allowed file types: %s', $config['allowed'])
                : 'File reference',
        );
    }

    private function mapFolderField(FolderFieldType $field): Schema
    {
        $config = $field->getConfiguration();
        $relationship = (string)($config['relationship'] ?? '');
        $isToOneRelationship = in_array($relationship, ['oneToOne', 'manyToOne'], true);

        $schema = new Schema(
            type: 'string',
            description: 'Folder path',
        );

        if (!$isToOneRelationship) {
            $schema = new Schema(
                type: 'array',
                items: $schema,
            );
        }

        return $schema;
    }

    private function mapCategoryField(CategoryFieldType $field): Schema
    {
        // @todo maybe we should use a sys category subset, since we do not
        // really want to relate all items when listing related categories
        $schema = new Schema(
            ref: '#/$defs/TYPO3.CMS.Core.Domain.Dto.Record_sys_category_',
        );

        if ($field->getRelationshipType()->hasOne()) {
            return new Schema(
                oneOf: [
                    $schema,
                    new Schema(type: 'null'),
                ],
                description: 'Related category',
            );
        }

        $config = $field->getConfiguration();
        $maxItems = (int)($config['maxitems'] ?? 99999);
        return new Schema(
            type: 'array',
            items: $schema,
            maxItems: $maxItems > 0 && $maxItems !== 99999 ? $maxItems : null,
            description: 'Related categories',
        );
    }

    private function mapFlexFormField(FlexFormFieldType $field): Schema
    {
        // @todo: FlexForm field type handling not yet implemented
        // FlexForms require recursive schema generation for nested data structures
        // This would need to parse the FlexForm XML structure and generate
        // nested schemas accordingly. For now, we represent it as a generic object.
        return new Schema(
            type: 'object',
            description: 'FlexForm data structure (nested configuration)',
        );
    }

    private function mapImageManipulationField(ImageManipulationFieldType $field): Schema
    {
        return new Schema(
            type: 'string',
            description: 'Image manipulation/cropping data',
        );
    }

    private function mapLanguageField(LanguageFieldType $field): Schema
    {
        return new Schema(
            type: 'integer',
            description: 'Language ID (sys_language UID)',
            minimum: 0,
        );
    }

    private function mapNoneField(NoneFieldType $field): Schema
    {
        // Passthrough fields are typically handled by the database
        // Use a generic type based on common usage
        return new Schema(
            oneOf: [
                new Schema(type: 'string'),
                new Schema(type: 'integer'),
                new Schema(type: 'null'),
            ],
            description: 'None field (computed value)',
        );
    }

    private function mapPassthroughField(PassthroughFieldType $field): Schema
    {
        // Passthrough fields are typically handled by the database
        // Use a generic type based on common usage
        return new Schema(
            oneOf: [
                new Schema(type: 'string'),
                new Schema(type: 'integer'),
                new Schema(type: 'null'),
            ],
            description: 'Passthrough field (database-managed)',
        );
    }

    private function mapUserField(UserFieldType $field): Schema
    {
        // User fields have custom rendering, generic type
        return new Schema(
            oneOf: [
                new Schema(type: 'string'),
                new Schema(type: 'integer'),
                new Schema(type: 'null'),
            ],
            description: 'Custom user field',
        );
    }

    private function mapCountryField(CountryFieldType $field): Schema
    {
        return new Schema(
            type: 'string',
            pattern: '^[A-Z]{2}$',
            description: 'ISO 3166-1 alpha-2 country code',
        );
    }

    private function mapGenericField(FieldTypeInterface $field): Schema
    {
        // Fallback for any unknown field types
        return new Schema(
            anyOf: [
                new Schema(type: 'string'),
                new Schema(type: 'number'),
                new Schema(type: 'null'),
            ],
            description: sprintf('Generic field (type: %s)', $field->getType()),
        );
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
