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

use TYPO3\CMS\Core\Action\Error\NotFoundError;
use TYPO3\CMS\Core\Action\Error\PermissionDeniedError;
use TYPO3\CMS\Core\Domain\Dto\RecordInput;
use TYPO3\CMS\Core\Resource\File;
use TYPO3\CMS\Core\Resource\StorageRepository;
use TYPO3\CMS\Core\Schema\Field\FieldTypeInterface;
use TYPO3\CMS\Core\Schema\Field\FileFieldType;
use TYPO3\CMS\Core\Schema\Field\GroupFieldType;
use TYPO3\CMS\Core\Schema\Field\InlineFieldType;
use TYPO3\CMS\Core\Schema\Field\JsonFieldType;
use TYPO3\CMS\Core\Schema\Field\RelationalFieldTypeInterface;
use TYPO3\CMS\Core\Schema\TcaSchemaFactory;
use TYPO3\CMS\Core\Utility\StringUtility;

/**
 * Converts a (schema validated) `RecordInput` tree into a DataHandler data map.
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

    private function addRecord(RecordInput $record, int $pid, array &$dataMap): string
    {
        $schema = $this->tcaSchemaFactory->get($record->schema);
        $id = StringUtility::getUniqueId('NEW');
        $row = ['pid' => $pid];
        foreach ($record->fields as $name => $value) {
            $row[$name] = $this->mapValue($schema->getField($name), $value, $pid, $dataMap);
        }
        $dataMap[$record->schema][$id] = $row;
        return $id;
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
