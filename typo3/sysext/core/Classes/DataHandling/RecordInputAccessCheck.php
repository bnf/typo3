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

use TYPO3\CMS\Core\Action\Error\InsufficientScopeError;
use TYPO3\CMS\Core\Domain\Dto\RecordInput;
use TYPO3\CMS\Core\Domain\Dto\RecordPatch;
use TYPO3\CMS\Core\Domain\RecordAccess;
use TYPO3\CMS\Core\Schema\TcaSchemaFactory;

/**
 * Checks table and field permissions of the backend user for the records
 * to be written, before they are passed to DataHandler.
 *
 * Record schemas are static and offer all tables and fields. DataHandler
 * silently skips fields the user is not permitted to write, and only logs
 * denied table access. Checking upfront allows to reject the complete
 * request with a meaningful error, instead of writing partially.
 *
 * Tables restricted to administrators require the scope `admin`, see
 * `RecordAccess`. Page and record level permissions are still evaluated by
 * DataHandler.
 *
 * @internal
 */
final readonly class RecordInputAccessCheck
{
    public function __construct(
        private TcaSchemaFactory $tcaSchemaFactory,
    ) {}

    /**
     * @param array<string, array<string, array<string, mixed>>> $dataMap
     * @param array<string, array<int|string, array<string, mixed>>> $cmdMap
     * @return list<string> Denied tables and fields, empty if everything is permitted
     * @throws InsufficientScopeError if a scope required for a table is not granted
     */
    public function getDeniedAccess(
        RecordAccess $access,
        RecordInput|RecordPatch $record,
        array $dataMap,
        array $cmdMap = [],
    ): array {
        $denied = [];
        foreach (array_unique([...array_keys($dataMap), ...array_keys($cmdMap)]) as $table) {
            $schema = $this->tcaSchemaFactory->get((string)$table);
            $access->assertScopes($schema);
            if (!$access->isTableModifiable($schema)) {
                $denied[] = 'table ' . $table;
            }
        }
        $this->collectDeniedFields($access, $record, $denied);
        return array_values(array_unique($denied));
    }

    /**
     * @param list<string> $denied
     */
    private function collectDeniedFields(RecordAccess $access, RecordInput|RecordPatch $record, array &$denied): void
    {
        $schema = $this->tcaSchemaFactory->get($record->schema);
        foreach ($record->fields as $name => $value) {
            if (!$access->isFieldAccessible($schema, (string)$name)) {
                $denied[] = 'field ' . $record->schema . '.' . $name;
            }
            foreach (is_array($value) ? $value : [$value] as $child) {
                if ($child instanceof RecordInput || $child instanceof RecordPatch) {
                    $this->collectDeniedFields($access, $child, $denied);
                }
            }
        }
    }
}
