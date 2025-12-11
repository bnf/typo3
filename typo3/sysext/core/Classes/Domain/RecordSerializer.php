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

use TYPO3\CMS\Core\Authentication\BackendUserAuthentication;
use TYPO3\CMS\Core\Collection\LazyRecordCollection;
use TYPO3\CMS\Core\Country\Country;
use TYPO3\CMS\Core\Domain\Record\LanguageInfo;
use TYPO3\CMS\Core\Domain\Record\VersionInfo;
use TYPO3\CMS\Core\Resource\Collection\LazyFileReferenceCollection;
use TYPO3\CMS\Core\Resource\Collection\LazyFolderCollection;
use TYPO3\CMS\Core\Resource\FileInterface;
use TYPO3\CMS\Core\Resource\FolderInterface;
use TYPO3\CMS\Core\Schema\Exception\UndefinedSchemaException;
use TYPO3\CMS\Core\Schema\Field\FieldTypeInterface;
use TYPO3\CMS\Core\Schema\Field\FileFieldType;
use TYPO3\CMS\Core\Schema\Field\GroupFieldType;
use TYPO3\CMS\Core\Schema\Field\InlineFieldType;
use TYPO3\CMS\Core\Schema\Field\SelectRelationFieldType;
use TYPO3\CMS\Core\Schema\TcaSchemaFactory;
use TYPO3\CMS\Core\Utility\GeneralUtility;

/**
 * @internal not part of TYPO3 Core API yet.
 */
final readonly class RecordSerializer
{
    public function __construct(
        private TcaSchemaFactory $tcaSchemaFactory,
    ) {}

    /**
     * Fields with access control (`exclude`) the backend user is not permitted
     * to read are omitted, as well as inline children of tables the user may not
     * select. Without backend user, all fields are serialized.
     */
    public function serialize(
        RecordInterface $record,
        ?BackendUserAuthentication $backendUser = null,
    ): ?\stdClass {
        $result = $this->doSerialize($record, $backendUser);
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
        ?BackendUserAuthentication $backendUser,
        int $depth = 10,
    ): \stdClass|array|string|float|int|bool|null {
        if ($depth === 0) {
            return null;
        }
        --$depth;
        return match (true) {
            $value instanceof RecordPropertyClosure => $this->doSerialize($value->instantiate(), $backendUser, $depth + 1),
            $value instanceof RecordInterface => $this->mapRecord($value, $backendUser, $depth),
            $value instanceof LazyRecordCollection => array_map(
                fn(mixed $value): mixed => $this->doSerialize($value, $backendUser, $depth),
                iterator_to_array($value),
            ),
            $value instanceof LazyFileReferenceCollection => array_map(
                fn(mixed $value): mixed => $this->doSerialize($value, $backendUser, $depth),
                iterator_to_array($value),
            ),
            $value instanceof LazyFolderCollection => array_map(
                fn(mixed $value): mixed => $this->doSerialize($value, $backendUser, $depth),
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
                fn(mixed $value): mixed => $this->doSerialize($value, $backendUser, $depth),
                $this->flattenSheets($value->toArray()),//[ ...$value ],
            ),
            $value instanceof \JsonSerializable => $value->jsonSerialize(),
            // @todo use schema for specific formats
            $value instanceof \DateTimeInterface => $value->format(\DateTimeInterface::ATOM),
            is_array($value) => array_map(
                fn(mixed $value): mixed => $this->doSerialize($value, $backendUser, $depth),
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

    private function mapRecord(RecordInterface $record, ?BackendUserAuthentication $backendUser, int $depth): \stdClass
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
                $data[$property] = $this->doSerialize($value, $backendUser, $depth);
                continue;
            }
            $field = $schema->getField($property);
            if (!$this->isReadable($record->getMainType(), $field, $backendUser)) {
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

            $data[$property] = $this->doSerialize($value, $backendUser, $depth);
        }

        return (object)[
            '_schema' => $record->getMainType(),
            ...$data,
        ];
    }

    private function isReadable(string $table, FieldTypeInterface $field, ?BackendUserAuthentication $backendUser): bool
    {
        if ($backendUser === null || $backendUser->isAdmin()) {
            return true;
        }
        if ($field->supportsAccessControl() && !$backendUser->check('non_exclude_fields', $table . ':' . $field->getName())) {
            return false;
        }
        if ($field instanceof InlineFieldType || $field instanceof FileFieldType) {
            $childTable = $field instanceof FileFieldType ? 'sys_file_reference' : (string)($field->getConfiguration()['foreign_table'] ?? '');
            return $backendUser->check('tables_select', $childTable);
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
