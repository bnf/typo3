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
use TYPO3\CMS\Core\Attribute\UpgradeWizard;
use TYPO3\CMS\Core\Database\ConnectionPool;
use TYPO3\CMS\Core\Database\Query\QueryHelper;
use TYPO3\CMS\Core\DataHandling\TableColumnType;
use TYPO3\CMS\Core\Schema\Field\DateTimeFieldType;
use TYPO3\CMS\Core\Schema\TcaSchemaFactory;

/**
 * Update the zero date "0000-00-00" a nullable native DATE or DATETIME field still holds from
 * before it was nullable to NULL, which is how such a field stores no date.
 *
 * Not bound to a major version: a field may become nullable with any update of core or an
 * extension, so this wizard is kept.
 *
 * @since 15.0
 * @internal This class is only meant to be used within `EXT:core` and is not part of the TYPO3 Core API.
 */
#[UpgradeWizard('zeroDateToNullUpdateWizard')]
readonly class ZeroDateToNullUpdateWizard implements UpgradeWizardInterface, RepeatableInterface
{
    public function __construct(
        private TcaSchemaFactory $tcaSchemaFactory,
        private ConnectionPool $connectionPool,
    ) {}

    public function getTitle(): string
    {
        return 'Migrate zero dates of nullable date fields to NULL';
    }

    public function getDescription(): string
    {
        $description = 'Nullable date fields holding the zero date "0000-00-00" that need to be updated to NULL:';
        foreach ($this->getZeroDateFieldsThatNeedUpdate() as $info) {
            $description .= LF . sprintf('%s.%s (affects %d rows)', $info['table'], $info['field'], $info['count']);
        }
        return $description;
    }

    public function updateNecessary(): bool
    {
        return $this->getZeroDateFieldsThatNeedUpdate() !== [];
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
        foreach ($this->getZeroDateFieldsThatNeedUpdate() as $info) {
            $this->connectionPool->getConnectionForTable($info['table'])->update(
                $info['table'],
                [$info['field'] => null],
                [$info['field'] => $info['zeroDate']]
            );
        }
        return true;
    }

    /**
     * Only MySQL, MariaDB and SQLite can hold a zero date. A field that is not nullable stores no
     * date as the zero date, which is left as it is.
     *
     * @return list<array{table: string, field: string, zeroDate: string, count: int}>
     */
    private function getZeroDateFieldsThatNeedUpdate(): array
    {
        $updates = [];
        foreach ($this->tcaSchemaFactory->all() as $schema) {
            $tableName = $schema->getName();
            $connection = $this->connectionPool->getConnectionForTable($tableName);
            $platform = $connection->getDatabasePlatform();
            if (!$platform instanceof AbstractMySQLPlatform && !$platform instanceof SQLitePlatform) {
                continue;
            }
            $schemaInformation = $connection->getSchemaInformation();
            if (!in_array($tableName, $schemaInformation->listTableNames(), true)) {
                continue;
            }
            $tableInfo = $schemaInformation->getTableInfo($tableName);
            foreach ($schema->getFieldsOfType(TableColumnType::DATETIME) as $field) {
                if (!$field instanceof DateTimeFieldType || !$field->isNullable()) {
                    continue;
                }
                $storageFormat = $field->getPersistenceType();
                if ($storageFormat !== 'date' && $storageFormat !== 'datetime') {
                    continue;
                }
                $fieldName = $field->getName();
                if ($tableInfo->getColumnInfo($fieldName)?->notNull !== false) {
                    continue;
                }
                $zeroDate = QueryHelper::getDateTimeFormats()[$storageFormat]['empty'];
                $queryBuilder = $this->connectionPool->getQueryBuilderForTable($tableName);
                $queryBuilder->getRestrictions()->removeAll();
                $count = (int)$queryBuilder
                    ->count('*')
                    ->from($tableName)
                    ->where($queryBuilder->expr()->eq($fieldName, $queryBuilder->createNamedParameter($zeroDate)))
                    ->executeQuery()
                    ->fetchOne();
                if ($count > 0) {
                    $updates[] = [
                        'table' => $tableName,
                        'field' => $fieldName,
                        'zeroDate' => $zeroDate,
                        'count' => $count,
                    ];
                }
            }
        }
        return $updates;
    }
}
