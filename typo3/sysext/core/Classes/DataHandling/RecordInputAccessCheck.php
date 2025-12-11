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

use TYPO3\CMS\Core\Authentication\BackendUserAuthentication;
use TYPO3\CMS\Core\Domain\Dto\RecordInput;
use TYPO3\CMS\Core\Domain\Dto\RecordPatch;
use TYPO3\CMS\Core\Schema\Capability\TcaSchemaCapability;
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
 * Page and record level permissions are still evaluated by DataHandler.
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
     */
    public function getDeniedAccess(
        BackendUserAuthentication $backendUser,
        RecordInput|RecordPatch $record,
        array $dataMap,
        array $cmdMap = [],
    ): array {
        $denied = [];
        foreach (array_unique([...array_keys($dataMap), ...array_keys($cmdMap)]) as $table) {
            if (!$this->isTableModifiable($backendUser, (string)$table)) {
                $denied[] = 'table ' . $table;
            }
        }
        $this->collectDeniedFields($backendUser, $record, $denied);
        return array_values(array_unique($denied));
    }

    private function isTableModifiable(BackendUserAuthentication $backendUser, string $table): bool
    {
        $schema = $this->tcaSchemaFactory->get($table);
        if ($schema->hasCapability(TcaSchemaCapability::AccessReadOnly)) {
            return false;
        }
        if ($backendUser->isAdmin()) {
            return true;
        }
        return !$schema->hasCapability(TcaSchemaCapability::AccessAdminOnly)
            && $backendUser->check('tables_modify', $table);
    }

    /**
     * @param list<string> $denied
     */
    private function collectDeniedFields(BackendUserAuthentication $backendUser, RecordInput|RecordPatch $record, array &$denied): void
    {
        $schema = $this->tcaSchemaFactory->get($record->schema);
        foreach ($record->fields as $name => $value) {
            if (!$backendUser->isAdmin()
                && $schema->hasField($name)
                && $schema->getField($name)->supportsAccessControl()
                && !$backendUser->check('non_exclude_fields', $record->schema . ':' . $name)
            ) {
                $denied[] = 'field ' . $record->schema . '.' . $name;
            }
            foreach (is_array($value) ? $value : [$value] as $child) {
                if ($child instanceof RecordInput || $child instanceof RecordPatch) {
                    $this->collectDeniedFields($backendUser, $child, $denied);
                }
            }
        }
    }
}
