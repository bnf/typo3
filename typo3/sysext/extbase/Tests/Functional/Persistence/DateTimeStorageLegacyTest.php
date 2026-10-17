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

namespace TYPO3\CMS\Extbase\Tests\Functional\Persistence;

use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\Attributes\Group;
use PHPUnit\Framework\Attributes\Test;
use TYPO3\TestingFramework\Core\Functional\FunctionalTestCase;

/**
 * Native DATE and DATETIME columns holding "0000-00-00": as the empty value of a column declared
 * nullable=false. MySQL and MariaDB hold it only without NO_ZERO_DATE, SQLite holds it as text,
 * PostgreSQL cannot hold it. A nullable column still holding it is migrated by an upgrade wizard.
 */
#[Group('not-postgres')]
final class DateTimeStorageLegacyTest extends FunctionalTestCase
{
    use DateTimeStorageTestTrait {
        setUp as setUpDateTimeStorage;
    }

    protected array $testExtensionsToLoad = [
        'typo3/sysext/extbase/Tests/Functional/Fixtures/Extensions/blog_example',
    ];

    protected function setUp(): void
    {
        // Same sql_mode the testing framework sets up for MySQL/MariaDB, except that `NO_ZERO_DATE`
        // is left out to allow "0000-00-00" values for DATE and DATETIME fields with legacy
        // non-nullable config. SQLite holds them as text anyway.
        if (in_array(getenv('typo3DatabaseDriver') ?: 'mysqli', ['mysqli', 'pdo_mysql'], true)) {
            $this->configurationToUseInTestInstance['DB']['Connections']['Default']['initCommands'] = 'SET SESSION sql_mode = \''
                . 'STRICT_ALL_TABLES'
                . ',ERROR_FOR_DIVISION_BY_ZERO'
                . ',NO_AUTO_VALUE_ON_ZERO'
                . ',NO_ENGINE_SUBSTITUTION'
                . ',NO_ZERO_IN_DATE'
                . ',ONLY_FULL_GROUP_BY'
                . '\';';
        }
        $this->setUpDateTimeStorage();
    }

    /**
     * @return array<string, array{0: string, 1: string, 2: string}>
     */
    public static function storageVariantDataProvider(): array
    {
        return [
            'dbType=date, nullable=false' => ['dateNotNull', 'date_not_null', '0000-00-00'],
            'dbType=datetime, nullable=false' => ['datetimeNotNull', 'datetime_not_null', '0000-00-00 00:00:00'],
            'inconsistent: dbType=date DEFAULT NULL, nullable=false' => ['dateInconsistentSqlNull', 'date_inconsistent_sql_null', '0000-00-00'],
            'inconsistent: dbType=datetime DEFAULT NULL, nullable=false' => ['datetimeInconsistentSqlNull', 'datetime_inconsistent_sql_null', '0000-00-00 00:00:00'],
        ];
    }

    /**
     * @return array<string, array{0: string, 1: string, 2: string, 3: string}>
     */
    public static function sqlNullInAColumnThatIsNotNullableDataProvider(): array
    {
        return [
            'inconsistent: dbType=date DEFAULT NULL, nullable=false' => ['dateInconsistentSqlNull', 'date_inconsistent_sql_null', '0000-00-00', '2025-01-20'],
            'inconsistent: dbType=datetime DEFAULT NULL, nullable=false' => ['datetimeInconsistentSqlNull', 'datetime_inconsistent_sql_null', '0000-00-00 00:00:00', '2025-01-20 14:18:56'],
        ];
    }

    /**
     * A column declared DEFAULT NULL in ext_tables.sql, while the TCA does not make it nullable,
     * holds SQL NULL besides the zero date Extbase and DataHandler write.
     */
    #[DataProvider('sqlNullInAColumnThatIsNotNullableDataProvider')]
    #[Test]
    public function sqlNullInAColumnThatIsNotNullableCountsAsNull(string $property, string $column, string $zeroDate, string $date): void
    {
        $this->insertRows($column, [null, $zeroDate, $date]);
        $this->assertNullMatches($property, [1, 2], [3]);
    }
}
