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

namespace TYPO3\CMS\Core\Domain;

use TYPO3\CMS\Core\Collection\LazyRecordCollection;
use TYPO3\CMS\Core\Country\Country;
use TYPO3\CMS\Core\Domain\Record\LanguageInfo;
use TYPO3\CMS\Core\Domain\Record\VersionInfo;
use TYPO3\CMS\Core\Resource\Collection\LazyFileReferenceCollection;
use TYPO3\CMS\Core\Resource\Collection\LazyFolderCollection;
use TYPO3\CMS\Core\Resource\FileInterface;
use TYPO3\CMS\Core\Resource\FileReference;
use TYPO3\CMS\Core\Resource\FolderInterface;
use TYPO3\CMS\Core\Schema\Exception\UndefinedSchemaException;
use TYPO3\CMS\Core\Schema\Field\CheckboxFieldType;
use TYPO3\CMS\Core\Schema\Field\FieldTypeInterface;
use TYPO3\CMS\Core\Schema\Field\FileFieldType;
use TYPO3\CMS\Core\Schema\Field\FlexFormFieldType;
use TYPO3\CMS\Core\Schema\Field\GroupFieldType;
use TYPO3\CMS\Core\Schema\Field\InlineFieldType;
use TYPO3\CMS\Core\Schema\Field\NumberFieldType;
use TYPO3\CMS\Core\Schema\Field\PasswordFieldType;
use TYPO3\CMS\Core\Schema\Field\RelationalFieldTypeInterface;
use TYPO3\CMS\Core\Schema\Field\SelectRelationFieldType;
use TYPO3\CMS\Core\Schema\FlexFormSchemaFactory;
use TYPO3\CMS\Core\Schema\RelationMap;
use TYPO3\CMS\Core\Schema\TcaSchemaFactory;
use TYPO3\CMS\Core\Utility\GeneralUtility;

/**
 * @internal not part of TYPO3 Core API yet.
 */
final readonly class RecordSerializer
{
    public function __construct(
        private TcaSchemaFactory $tcaSchemaFactory,
        private FlexFormSchemaFactory $flexFormSchemaFactory,
    ) {}

    /**
     * Fields with access control (`exclude`) the backend user is not permitted
     * to read are omitted, as well as inline children of tables the user may not
     * read. Without access restriction, all fields are serialized. Passwords are
     * never serialized.
     */
    public function serialize(
        RecordInterface $record,
        ?RecordAccess $access = null,
    ): ?\stdClass {
        $result = $this->doSerialize($record, $access);
        if (is_object($result) || $result === null) {
            return $result;
        }
        throw new \LogicException('RecordSerializer::doSerialize returned a non object for a Record', 1765453540);
    }

    private function doSerialize(
        RecordInterface|
        LazyFileReferenceCollection|
        LazyFolderCollection|
        LazyRecordCollection|
        FileInterface|
        FolderInterface|
        \JsonSerializable|
        \DateTimeInterface|
        LanguageInfo|
        VersionInfo|
        Country|
        FlexFormFieldValues|
        RecordPropertyClosure|
        array|string|float|int|bool|null $value,
        ?RecordAccess $access,
        int $depth = 10,
    ): \stdClass|array|string|float|int|bool|null {
        if ($depth === 0) {
            return null;
        }
        --$depth;
        return match (true) {
            $value instanceof RecordPropertyClosure => $this->doSerialize($value->instantiate(), $access, $depth + 1),
            $value instanceof RecordInterface => $this->mapRecord($value, $access, $depth),
            $value instanceof LazyRecordCollection => array_map(
                fn(mixed $value): mixed => $this->doSerialize($value, $access, $depth),
                iterator_to_array($value),
            ),
            $value instanceof LazyFileReferenceCollection => array_map(
                fn(mixed $value): mixed => $this->doSerialize($value, $access, $depth),
                iterator_to_array($value),
            ),
            $value instanceof LazyFolderCollection => array_map(
                fn(mixed $value): mixed => $this->doSerialize($value, $access, $depth),
                iterator_to_array($value),
            ),
            $value instanceof FileInterface => (object)[
                '_schema' => 'sys_file',
                'identifier' => sprintf('%d:%s', $value->getStorage()->getUid(), $value->getIdentifier()),
                'url' => ($GLOBALS['TYPO3_REQUEST'] ?? null) !== null
                    ? GeneralUtility::locationHeaderUrl($value->getPublicUrl(), $GLOBALS['TYPO3_REQUEST'])
                    : $value->getPublicUrl(),
            ],
            $value instanceof FolderInterface => $value->getIdentifier(),
            $value instanceof LanguageInfo => [
                'languageId' => $value->getLanguageId(),
                'translationParent' => $value->getTranslationParent(),
                'translationSource' => $value->getTranslationSource(),
            ],
            $value instanceof VersionInfo => (object)[
                'workspaceId' => $value->getWorkspaceId(),
                'liveId' => $value->getLiveId(),
                'state' => $value->getState(),
                'stage' => $value->getStageId(),
            ],
            $value instanceof Country => $value->getAlpha2IsoCode(),
            $value instanceof FlexFormFieldValues => (object)array_map(
                fn(mixed $value): mixed => $this->doSerialize($value, $access, $depth),
                $this->flattenSheets($value->toArray()),//[ ...$value ],
            ),
            $value instanceof \JsonSerializable => $value->jsonSerialize(),
            // @todo use schema for specific formats
            $value instanceof \DateTimeInterface => $value->format(\DateTimeInterface::ATOM),
            is_array($value) => array_map(
                fn(mixed $value): mixed => $this->doSerialize($value, $access, $depth),
                $value,
            ),
            default => $value,
        };
    }

    private function flattenSheets(array $sheets): array
    {
        $flat = [];
        foreach ($sheets as $key => $sheet) {
            foreach ($sheet as $setting => $value) {
                $flat[$key . '/' . $setting] = $value;
            }
        }
        return $flat;
    }

    private function mapRecord(RecordInterface $record, ?RecordAccess $access, int $depth): \stdClass
    {
        try {
            $schema = $this->tcaSchemaFactory->get($record->getFullType());
        } catch (UndefinedSchemaException) {
            $schema = $this->tcaSchemaFactory->get($record->getMainType());
        }
        $data = match (true) {
            // Page::toArray(true) adds raw and special properties for backward compatibility
            $record instanceof Page => [...$record->toArray(), '_system' => $record->getSystemProperties()?->toArray() ?? []],
            $record instanceof Record => $record->toArray(true),
            default => $record->toArray(),
        };

        // @todo maybe avoid `toArray()` and loop over *allowed*
        // schema fields explicitly? (requires manual `_system` generation)
        // e.g. `foreach ($schema->getFields() as $name => $field) { … $value = $record->get($name); }
        foreach ($data as $property => $value) {
            if (!$schema->hasField($property)) {
                $data[$property] = $this->doSerialize($value, $access, $depth);
                continue;
            }
            $field = $schema->getField($property);
            if (!$this->isReadable($record->getMainType(), $field, $access)) {
                unset($data[$property]);
                continue;
            }

            if ($field instanceof GroupFieldType
                || $field instanceof SelectRelationFieldType
            ) {
                if (!$field->getRelationshipType()->hasOne()) {
                    $elements = [];
                    foreach ($value as $element) {
                        $elements[] = $this->getPointer($element);
                    }
                    $data[$property] = $elements;
                } else {
                    $data[$property] = $this->getPointer($value);
                }
                continue;
            }

            if ($field instanceof FlexFormFieldType) {
                $data[$property] = $this->mapFlexForm($record, $field, $value, $access, $depth);
                continue;
            }

            $data[$property] = $this->doSerialize($value, $access, $depth);
        }

        return (object)[
            '_schema' => $record->getMainType(),
            ...$data,
        ];
    }

    /**
     * FlexForm values by sheet and field name ("sDEF/settings.limit"), sections
     * as list of elements with one container each, relations as references
     */
    private function mapFlexForm(RecordInterface $record, FlexFormFieldType $field, mixed $value, ?RecordAccess $access, int $depth): ?\stdClass
    {
        if ($value instanceof RecordPropertyClosure) {
            $value = $value->instantiate();
        }
        $rawRecord = $record->getRawRecord();
        if (!$value instanceof FlexFormFieldValues || $rawRecord === null) {
            return null;
        }
        // TYPO3 v14: the relation map is required, relations of sheet fields are available with 14.3.11 only
        $flexSchema = $this->flexFormSchemaFactory->getSchemaForRecord($rawRecord, $field, new RelationMap());
        if ($flexSchema === null) {
            return new \stdClass();
        }

        $data = [];
        foreach ($flexSchema->getFields() as $identifier => $sheetField) {
            if ($value->has($identifier) && !$sheetField instanceof PasswordFieldType) {
                $data[$identifier] = $this->mapFlexFormValue($sheetField, $value->get($identifier), $access, $depth);
            }
        }
        foreach ($flexSchema->getSheets() as $sheet) {
            foreach ($sheet->getSections() as $sectionIdentifier => $containers) {
                $elements = $value->has($sectionIdentifier) ? $value->get($sectionIdentifier) : null;
                if (!is_array($elements)) {
                    continue;
                }
                $data[$sectionIdentifier] = [];
                foreach ($elements as $element) {
                    foreach (is_array($element) ? $element : [] as $containerName => $containerValues) {
                        $container = $containers[$sectionIdentifier . '/' . $containerName] ?? null;
                        if ($container === null || !is_array($containerValues)) {
                            continue;
                        }
                        $values = [];
                        foreach ($container->getFields() as $fieldName => $containerField) {
                            if (array_key_exists($fieldName, $containerValues) && !$containerField instanceof PasswordFieldType) {
                                $values[$fieldName] = $this->mapFlexFormValue($containerField, $containerValues[$fieldName], $access, $depth);
                            }
                        }
                        $data[$sectionIdentifier][] = (object)[$containerName => (object)$values];
                    }
                }
            }
        }
        return (object)$data;
    }

    /**
     * Values of FlexForms are strings, unless they are transformed by their field type
     */
    private function mapFlexFormValue(FieldTypeInterface $field, mixed $value, ?RecordAccess $access, int $depth): mixed
    {
        if ($value instanceof RecordPropertyClosure) {
            $value = $value->instantiate();
        }
        if ($field instanceof RelationalFieldTypeInterface) {
            $pointers = $this->toRelationList($field, $value);
            return $field->getRelationshipType()->hasOne() ? ($pointers[0] ?? null) : $pointers;
        }
        return match (true) {
            $value === null => null,
            $field instanceof CheckboxFieldType => (int)$value,
            // TYPO3 v14: NumberFieldType::getScale() is not available
            $field instanceof NumberFieldType && is_string($value) => ($field->getConfiguration()['format'] ?? 'integer') === 'decimal' ? (float)$value : (int)$value,
            default => $this->doSerialize($value, $access, $depth),
        };
    }

    /**
     * @return list<\stdClass>
     */
    private function toRelationList(RelationalFieldTypeInterface&FieldTypeInterface $field, mixed $value): array
    {
        if (is_string($value) || is_int($value)) {
            // Raw value of a section field, which is not transformed
            $defaultTable = ($field->getRelations()[0] ?? null)?->toTable() ?? '';
            $pointers = [];
            foreach (GeneralUtility::trimExplode(',', (string)$value, true) as $item) {
                if (preg_match('/^(.+)_(\d+)$/', $item, $matches)) {
                    $pointers[] = (object)['_schema' => $matches[1], 'uid' => (int)$matches[2]];
                } elseif (is_numeric($item) && $defaultTable !== '') {
                    $pointers[] = (object)['_schema' => $defaultTable, 'uid' => (int)$item];
                }
            }
            return $pointers;
        }
        $items = match (true) {
            $value === null => [],
            is_iterable($value) => is_array($value) ? $value : iterator_to_array($value, false),
            default => [$value],
        };
        $pointers = [];
        foreach ($items as $item) {
            if ($item instanceof FileReference) {
                $pointers[] = (object)['_schema' => 'sys_file_reference', 'uid' => $item->getUid()];
            } elseif ($item instanceof RecordInterface) {
                $pointers[] = $this->getPointer($item);
            }
        }
        return $pointers;
    }

    private function isReadable(string $table, FieldTypeInterface $field, ?RecordAccess $access): bool
    {
        if ($field instanceof PasswordFieldType) {
            return false;
        }
        if ($access === null) {
            return true;
        }
        $schema = $this->tcaSchemaFactory->get($table);
        if (!$access->isFieldAccessible($schema, $field->getName())) {
            return false;
        }
        if ($field instanceof InlineFieldType || $field instanceof FileFieldType) {
            $childTable = $field instanceof FileFieldType ? 'sys_file_reference' : (string)($field->getConfiguration()['foreign_table'] ?? '');
            return $this->tcaSchemaFactory->has($childTable) && $access->isTableReadable($this->tcaSchemaFactory->get($childTable));
        }
        return true;
    }

    private function getPointer(?object $object): ?\stdClass
    {
        if ($object === null) {
            return null;
        }
        if ($object instanceof RecordInterface) {
            return (object)['_schema' => $object->getMainType(), 'uid' => $object->getUid()];
        }
        /*
        if ($object instanceof FileInterface) {
            return (object)[
                '_schema' => 'sys_file',
                'identifier' => sprintf('%d:%s', $object->getStorage()->getUid(), $object->getIdentifier())
            ];
        }
        if ($object instanceof FolderInterface) {
            return (object)[
                '_schema' => 'sys_folder',
                'identifier' => sprintf('%d:%s', $object->getStorage()->getUid(), $object->getIdentifier())
            ];
        }
        */
        throw new \Exception('Can not create object pointer for: ' . get_class($object), 1791213810);
    }
}
