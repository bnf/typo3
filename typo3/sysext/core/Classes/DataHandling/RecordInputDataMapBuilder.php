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

namespace TYPO3\CMS\Core\DataHandling;

use TYPO3\CMS\Core\Action\ActionException;
use TYPO3\CMS\Core\Action\Error\NotFoundError;
use TYPO3\CMS\Core\Action\Error\PermissionDeniedError;
use TYPO3\CMS\Core\Database\RelationHandler;
use TYPO3\CMS\Core\Domain\Dto\RecordInput;
use TYPO3\CMS\Core\Domain\Dto\RecordPatch;
use TYPO3\CMS\Core\Resource\File;
use TYPO3\CMS\Core\Resource\StorageRepository;
use TYPO3\CMS\Core\Schema\Capability\TcaSchemaCapability;
use TYPO3\CMS\Core\Schema\Field\FieldTypeInterface;
use TYPO3\CMS\Core\Schema\Field\FileFieldType;
use TYPO3\CMS\Core\Schema\Field\GroupFieldType;
use TYPO3\CMS\Core\Schema\Field\InlineFieldType;
use TYPO3\CMS\Core\Schema\Field\JsonFieldType;
use TYPO3\CMS\Core\Schema\Field\RelationalFieldTypeInterface;
use TYPO3\CMS\Core\Schema\TcaSchema;
use TYPO3\CMS\Core\Schema\TcaSchemaFactory;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Core\Utility\StringUtility;

/**
 * Converts a (schema validated) `RecordInput` tree or `RecordPatch` into a
 * DataHandler data map.
 *
 * Inline children are added as separate NEW records and referenced by their
 * NEW identifiers in the parent field, the same way FormEngine submits them.
 * DataHandler then sets the parent pointer and sorting of the children.
 *
 * @internal
 */
final readonly class RecordInputDataMapBuilder
{
    public function __construct(
        private TcaSchemaFactory $tcaSchemaFactory,
        private StorageRepository $storageRepository,
    ) {}

    /**
     * @return array{id: string, dataMap: array<string, array<string, array<string, mixed>>>}
     * @throws NotFoundError if a referenced file does not exist
     * @throws PermissionDeniedError if a referenced file is not readable
     */
    public function build(RecordInput $record, int $pid): array
    {
        $dataMap = [];
        $id = $this->addRecord($record, $pid, $dataMap);
        return ['id' => $id, 'dataMap' => $dataMap];
    }

    /**
     * Inline children are replaced by the given list: listed existing children
     * (identified by uid) are changed, children without uid are created, and
     * existing children not listed are deleted by the command map.
     *
     * @param array<string, mixed> $row The stored record
     * @return array{dataMap: array<string, array<string, array<string, mixed>>>, cmdMap: array<string, array<int, array<string, int>>>}
     * @throws ActionException if fields are not available for the record type or a child does not belong to the record
     * @throws NotFoundError if a referenced file does not exist
     * @throws PermissionDeniedError if a referenced file is not readable
     */
    public function buildPatch(RecordPatch $record, array $row): array
    {
        $dataMap = [];
        $cmdMap = [];
        $this->addPatch($record, $row, $dataMap, $cmdMap);
        return ['dataMap' => $dataMap, 'cmdMap' => $cmdMap];
    }

    private function addRecord(RecordInput $record, int $pid, array &$dataMap): string
    {
        $schema = $this->tcaSchemaFactory->get($record->schema);
        $id = StringUtility::getUniqueId('NEW');
        $row = ['pid' => $pid];
        // DataHandler requires the language of new records for access checks of non-admin users
        if ($schema->hasCapability(TcaSchemaCapability::Language)) {
            $row[$schema->getCapability(TcaSchemaCapability::Language)->getLanguageField()->getName()] = 0;
        }
        foreach ($record->fields as $name => $value) {
            $row[$name] = $this->mapValue($schema->getField($name), $value, $pid, $dataMap);
        }
        $dataMap[$record->schema][$id] = $row;
        return $id;
    }

    private function addPatch(RecordPatch $record, array $row, array &$dataMap, array &$cmdMap): string
    {
        $schema = $this->tcaSchemaFactory->get($record->schema);
        $this->assertFieldsAvailableForType($schema, $record, $row);
        $id = (string)$row['uid'];
        $pid = (int)$row['pid'];
        $patch = [];
        foreach ($record->fields as $name => $value) {
            if ($name === 'uid') {
                continue;
            }
            $field = $schema->getField($name);
            $patch[$name] = $field instanceof InlineFieldType || $field instanceof FileFieldType
                ? $this->mapChildren($schema, $field, $value, $row, $dataMap, $cmdMap)
                : $this->mapValue($field, $value, $pid, $dataMap);
        }
        $dataMap[$record->schema][$id] = $patch;
        return $id;
    }

    private function mapChildren(
        TcaSchema $schema,
        InlineFieldType|FileFieldType $field,
        mixed $value,
        array $row,
        array &$dataMap,
        array &$cmdMap,
    ): string {
        $childTable = $field instanceof FileFieldType ? 'sys_file_reference' : (string)$field->getConfiguration()['foreign_table'];
        $relationHandler = GeneralUtility::makeInstance(RelationHandler::class);
        $relationHandler->initializeForField($schema->getName(), $field, $row, $row[$field->getName()] ?? null);
        $existingUids = array_map(intval(...), $relationHandler->tableArray[$childTable] ?? []);
        $existingRows = $existingUids === [] ? [] : $relationHandler->getFromDB()[$childTable] ?? [];

        $childIds = [];
        $keptUids = [];
        foreach ($this->toList($value) as $child) {
            if ($child instanceof RecordInput) {
                $childIds[] = $this->addRecord($child, (int)$row['pid'], $dataMap);
                continue;
            }
            $childUid = (int)$child->fields['uid'];
            $childRow = in_array($childUid, $existingUids, true) ? $existingRows[$childUid] ?? null : null;
            if ($childRow === null) {
                throw new ActionException(
                    sprintf('Record %s:%d is not a child of field "%s"', $childTable, $childUid, $field->getName()),
                    1793019563
                );
            }
            $childIds[] = $this->addPatch($child, $childRow, $dataMap, $cmdMap);
            $keptUids[] = $childUid;
        }
        foreach (array_diff($existingUids, $keptUids) as $removedUid) {
            $cmdMap[$childTable][$removedUid]['delete'] = 1;
        }
        return implode(',', $childIds);
    }

    /**
     * The patch schema accepts the fields of all types, as the type of the
     * stored record applies when the patch does not change it.
     */
    private function assertFieldsAvailableForType(TcaSchema $schema, RecordPatch $record, array $row): void
    {
        if (!$schema->supportsSubSchema()) {
            return;
        }
        $typeFieldName = $schema->getSubSchemaTypeInformation()->getFieldName();
        if (!$schema->hasField($typeFieldName) || $schema->getField($typeFieldName) instanceof RelationalFieldTypeInterface) {
            return;
        }
        $type = (string)($record->fields[$typeFieldName] ?? $row[$typeFieldName] ?? '');
        if (!$schema->hasSubSchema($type)) {
            return;
        }
        $subSchema = $schema->getSubSchema($type);
        $unavailableFields = array_values(array_filter(
            array_keys($record->fields),
            static fn(string $fieldName): bool => $fieldName !== 'uid' && !$subSchema->hasField($fieldName),
        ));
        if ($unavailableFields !== []) {
            throw new ActionException(
                sprintf('Fields not available for the record type: %s', implode(', ', $unavailableFields)),
                1792748107
            );
        }
    }

    private function mapValue(FieldTypeInterface $field, mixed $value, int $pid, array &$dataMap): mixed
    {
        if ($field instanceof InlineFieldType || $field instanceof FileFieldType) {
            $childIds = [];
            foreach ($this->toList($value) as $child) {
                $childIds[] = $this->addRecord($child, $pid, $dataMap);
            }
            return implode(',', $childIds);
        }
        return match (true) {
            $field instanceof GroupFieldType => implode(',', array_map(
                fn(\stdClass $pointer): string => $pointer->_schema . '_' . $this->resolvePointerUid($pointer),
                $this->toList($value),
            )),
            $field instanceof RelationalFieldTypeInterface => implode(',', array_map(
                static fn(\stdClass $pointer): int => $pointer->uid,
                $this->toList($value),
            )),
            $field instanceof JsonFieldType, $value instanceof \stdClass => json_decode(json_encode($value), true),
            is_array($value) => implode(',', $value),
            is_bool($value) => (int)$value,
            default => $value,
        };
    }

    private function resolvePointerUid(\stdClass $pointer): int
    {
        if (!isset($pointer->identifier)) {
            return $pointer->uid;
        }
        [$storageUid, $fileIdentifier] = explode(':', $pointer->identifier, 2);
        $storage = $this->storageRepository->findByUid((int)$storageUid);
        $file = $storage?->hasFile($fileIdentifier) ? $storage->getFileByIdentifier($fileIdentifier) : null;
        if (!$file instanceof File) {
            throw new NotFoundError(sprintf('File "%s" not found', $pointer->identifier), 1792678096);
        }
        if (!$file->checkActionPermission('read')) {
            throw new PermissionDeniedError(sprintf('No read permission for file "%s"', $pointer->identifier), 1792678097);
        }
        return $file->getUid();
    }

    private function toList(mixed $value): array
    {
        return match (true) {
            $value === null => [],
            is_array($value) => $value,
            default => [$value],
        };
    }
}
