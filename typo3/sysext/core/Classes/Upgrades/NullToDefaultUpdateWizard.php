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

namespace TYPO3\CMS\Core\Upgrades;

use Doctrine\DBAL\Platforms\AbstractMySQLPlatform;
use Doctrine\DBAL\Platforms\SQLitePlatform;
use Doctrine\DBAL\Schema\Column;
use Doctrine\DBAL\Schema\ColumnDiff;
use Doctrine\DBAL\Schema\TableDiff;
use Doctrine\DBAL\Types\PhpDateMappingType;
use Doctrine\DBAL\Types\PhpDateTimeMappingType;
use Doctrine\DBAL\Types\PhpTimeMappingType;
use TYPO3\CMS\Core\Attribute\UpgradeWizard;
use TYPO3\CMS\Core\Database\ConnectionPool;
use TYPO3\CMS\Core\Database\Query\QueryHelper;
use TYPO3\CMS\Core\Database\Schema\SchemaMigrator;
use TYPO3\CMS\Core\Database\Schema\SqlReader;
use TYPO3\CMS\Core\Utility\GeneralUtility;

/**
 * Update current "NULL" fields to their desired DEFAULT value
 * if new database schema (TCA) defines a "NOT NULL" assertion (nullable=false).
 *
 * Not bound to a major version: a field may become NOT NULL with any update of core or an
 * extension, so this wizard is kept.
 *
 * @since 13.4
 * @internal This class is only meant to be used within `EXT:core` and is not part of the TYPO3 Core API.
 */
#[UpgradeWizard('nullToDefaultUpdateWizard')]
readonly class NullToDefaultUpdateWizard implements UpgradeWizardInterface, RepeatableInterface
{
    public function __construct(
        private SchemaMigrator $schemaMigrator,
        private ConnectionPool $connectionPool
    ) {}

    /**
     * @return string Title of this updater
     */
    public function getTitle(): string
    {
        return 'Migrate NULL field values to DEFAULT values';
    }

    /**
     * @return string Longer description of this updater
     * @throws \RuntimeException
     */
    public function getDescription(): string
    {
        $nullFields = $this->getNullFieldsThatNeedUpdate();
        $description = 'Fields containing NULL values that need to be updated to DEFAULT values:';
        foreach ($nullFields as $info) {
            $description .= LF . sprintf(
                '%s.%s (affects %d rows)',
                $info['tableDiff']->getOldTable()->getName(),
                $info['columnDiff']->getOldColumn()->getName(),
                $info['count'],
            );
        }
        return $description;
    }

    /**
     * @return list<array{columnDiff: ColumnDiff, tableDiff: TableDiff, count: int, default: int|string}>
     */
    protected function getNullFieldsThatNeedUpdate(): array
    {
        $sqlReader = GeneralUtility::makeInstance(SqlReader::class);
        $databaseDefinitions = $sqlReader->getCreateTableStatementArray($sqlReader->getTablesDefinitionString());
        $databaseDifferences = $this->schemaMigrator->getSchemaDiffs($databaseDefinitions);
        $updates = [];
        foreach ($databaseDifferences as $schemaDiff) {
            foreach ($schemaDiff->getAlteredTables() as $changedTable) {
                foreach ($changedTable->getChangedColumns() as $changedColumn) {
                    if (!$changedColumn->hasNotNullChanged()) {
                        continue;
                    }

                    $newColumn = $changedColumn->getNewColumn();
                    $tableName = $changedTable->getOldTable()->getName();
                    $defaultValue = $newColumn->getDefault() ?? $this->getEmptyDateValue($newColumn, $tableName);
                    if (!$newColumn->getNotNull() || $defaultValue === null) {
                        continue;
                    }

                    $fieldName = $changedColumn->getOldColumn()->getName();

                    $qb = $this->connectionPool->getQueryBuilderForTable($tableName);
                    $qb->getRestrictions()->removeAll();
                    $numberOfNullRows = (int)$qb
                        ->count('*')
                        ->from($tableName)
                        ->where($qb->expr()->isNull($fieldName))
                        ->executeQuery()
                        ->fetchOne();

                    if ($numberOfNullRows > 0) {
                        $updates[] = [
                            'columnDiff' => $changedColumn,
                            'tableDiff' => $changedTable,
                            'count' => $numberOfNullRows,
                            'default' => $defaultValue,
                        ];
                    }
                }
            }
        }

        return $updates;
    }

    public function updateNecessary(): bool
    {
        return $this->getNullFieldsThatNeedUpdate() !== [];
    }

    /**
     * @return string[] All new fields and tables must exist
     */
    public function getPrerequisites(): array
    {
        return [
            DatabaseUpdatedPrerequisite::class,
        ];
    }

    public function executeUpdate(): bool
    {
        foreach ($this->getNullFieldsThatNeedUpdate() as $info) {
            $columnDiff = $info['columnDiff'];
            $tableDiff = $info['tableDiff'];

            $tableName = $tableDiff->getOldTable()->getName();
            $fieldName = $columnDiff->getOldColumn()->getName();
            $defaultValue = $info['default'];
            $connection = $this->connectionPool->getConnectionForTable($tableName);

            $connection->update(
                $tableName,
                [$fieldName => $defaultValue],
                [$fieldName => null]
            );
        }
        return true;
    }

    /**
     * A native date column of a TCA field that is not nullable has no column default, as the zero
     * date is not a valid default everywhere. Such a field stores no date as its empty value, which
     * only MySQL, MariaDB and SQLite can hold for a DATE or DATETIME column.
     */
    private function getEmptyDateValue(Column $column, string $tableName): ?string
    {
        $columnType = $column->getType();
        $type = match (true) {
            $columnType instanceof PhpDateMappingType => 'date',
            $columnType instanceof PhpDateTimeMappingType => 'datetime',
            $columnType instanceof PhpTimeMappingType => 'time',
            default => null,
        };
        if ($type === null) {
            return null;
        }
        $platform = $this->connectionPool->getConnectionForTable($tableName)->getDatabasePlatform();
        if ($type !== 'time' && !$platform instanceof AbstractMySQLPlatform && !$platform instanceof SQLitePlatform) {
            return null;
        }
        return QueryHelper::getDateTimeFormats()[$type]['empty'];
    }
}
