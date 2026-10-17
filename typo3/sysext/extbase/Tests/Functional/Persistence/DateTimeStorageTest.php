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

use Doctrine\DBAL\Platforms\PostgreSQLPlatform;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\Attributes\Test;
use TYPO3\CMS\Core\Database\ConnectionPool;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Extbase\Persistence\Generic\Storage\Typo3DbBackend;
use TYPO3\CMS\Extbase\Persistence\Generic\Storage\Typo3DbQueryParser;
use TYPO3\TestingFramework\Core\Functional\FunctionalTestCase;
use TYPO3Tests\BlogExample\Domain\Model\DateTimeValue;
use TYPO3Tests\BlogExample\Domain\Repository\DateTimeStorageRepository;

final class DateTimeStorageTest extends FunctionalTestCase
{
    use DateTimeStorageTestTrait;

    protected array $testExtensionsToLoad = [
        'typo3/sysext/extbase/Tests/Functional/Fixtures/Extensions/blog_example',
    ];

    /**
     * @return array<string, array{0: string, 1: string, 2: string|null}>
     */
    public static function storageVariantDataProvider(): array
    {
        return [
            'db=int, not nullable' => ['intNotNull', 'int_not_null', '0'],
            'db=int, nullable=true' => ['intNullable', 'int_nullable', null],
            'db=int, format=datetimesec' => ['intDatetimesec', 'int_datetimesec', '0'],
            'dbType=datetime, nullable by default' => ['datetimeNullable', 'datetime_nullable', null],
            'dbType=date, nullable by default' => ['dateNullable', 'date_nullable', null],
            'dbType=time, nullable by default' => ['timeNullable', 'time_nullable', null],
            'dbType=time, nullable=false' => ['timeNotNull', 'time_not_null', '00:00:00'],
            'db=varchar, not nullable' => ['textNotNull', 'text_not_null', '0'],
            'inconsistent: db=int DEFAULT NULL, nullable=false' => ['intInconsistentSqlNull', 'int_inconsistent_sql_null', '0'],
            'inconsistent: db=varchar DEFAULT NULL, nullable=false' => ['textInconsistentSqlNull', 'text_inconsistent_sql_null', '0'],
            'inconsistent: dbType=time DEFAULT NULL, nullable=false' => ['timeInconsistentSqlNull', 'time_inconsistent_sql_null', '00:00:00'],
        ];
    }

    /**
     * @return array<string, array{0: string}>
     */
    public static function zeroDateColumnDataProvider(): array
    {
        return [
            'dbType=date, nullable=false' => ['dateNotNull'],
            'dbType=datetime, nullable=false' => ['datetimeNotNull'],
        ];
    }

    /**
     * @return array<string, array{0: string, 1: string, 2: string, 3: string}>
     */
    public static function sqlNullInAColumnThatIsNotNullableDataProvider(): array
    {
        return [
            'db=int DEFAULT NULL' => ['intLegacyNull', 'int_legacy_null', '0', '1737382736'],
            'inconsistent: db=int DEFAULT NULL, nullable=false' => ['intInconsistentSqlNull', 'int_inconsistent_sql_null', '0', '1737382736'],
            'inconsistent: db=varchar DEFAULT NULL, nullable=false' => ['textInconsistentSqlNull', 'text_inconsistent_sql_null', '0', '1737382736'],
            'inconsistent: dbType=time DEFAULT NULL, nullable=false' => ['timeInconsistentSqlNull', 'time_inconsistent_sql_null', '00:00:00', '14:18:56'],
        ];
    }

    /**
     * A column declared DEFAULT NULL in ext_tables.sql, while the TCA does not make it nullable,
     * holds SQL NULL where it was written before Extbase wrote the empty value.
     */
    #[DataProvider('sqlNullInAColumnThatIsNotNullableDataProvider')]
    #[Test]
    public function sqlNullInAColumnThatIsNotNullableCountsAsNull(string $property, string $column, string $emptyValue, string $date): void
    {
        $this->insertRows($column, [null, $emptyValue, $date]);
        $this->assertNullMatches($property, [1, 2], [3]);
    }

    /**
     * PostgreSQL rejects "0000-00-00" as out of range, in a comparison as much as in a write.
     * DateTimeStorageLegacyTest covers the databases that can hold it.
     */
    #[DataProvider('zeroDateColumnDataProvider')]
    #[Test]
    public function aZeroDateColumnCanBeQueriedForNullOnEveryDatabase(string $property): void
    {
        $this->persistViaExtbase();
        $query = $this->get(DateTimeStorageRepository::class)->createQuery();
        self::assertSame([], $this->matchedUids($query->equals($property, null)));
        self::assertSame([1, 2], $this->matchedUids($query->logicalNot($query->equals($property, null))));
    }

    /**
     * Extbase looks up an equal value object before it inserts one, and has to find the empty
     * value in a column that is not nullable as well.
     */
    #[Test]
    public function aValueObjectWithEmptyDatesFindsTheRowHoldingThem(): void
    {
        $this->persistViaDataHandler();
        self::assertSame(1, $this->get(Typo3DbBackend::class)->getUidOfAlreadyPersistedValueObject(new DateTimeValue()));
    }

    /**
     * @return array<string, array{0: string, 1: string, 2: bool, 3: bool}>
     */
    public static function noDateConstraintDataProvider(): array
    {
        return [
            'db=int, not nullable' => ['intNotNull', 'int_not_null', false, true],
            'db=int, nullable=true' => ['intNullable', 'int_nullable', true, false],
            'db=int, format=datetimesec' => ['intDatetimesec', 'int_datetimesec', false, true],
            'dbType=datetime, nullable by default' => ['datetimeNullable', 'datetime_nullable', true, false],
            'dbType=date, nullable by default' => ['dateNullable', 'date_nullable', true, false],
            'dbType=time, nullable by default' => ['timeNullable', 'time_nullable', true, false],
            'dbType=date, nullable=false' => ['dateNotNull', 'date_not_null', false, true],
            'dbType=datetime, nullable=false' => ['datetimeNotNull', 'datetime_not_null', false, true],
            'dbType=time, nullable=false' => ['timeNotNull', 'time_not_null', false, true],
            'db=varchar, not nullable' => ['textNotNull', 'text_not_null', false, true],
            'inconsistent: db=int DEFAULT NULL, nullable=false' => ['intInconsistentSqlNull', 'int_inconsistent_sql_null', true, true],
            'inconsistent: db=varchar DEFAULT NULL, nullable=false' => ['textInconsistentSqlNull', 'text_inconsistent_sql_null', true, true],
            'inconsistent: dbType=time DEFAULT NULL, nullable=false' => ['timeInconsistentSqlNull', 'time_inconsistent_sql_null', true, true],
            'inconsistent: dbType=date DEFAULT NULL, nullable=false' => ['dateInconsistentSqlNull', 'date_inconsistent_sql_null', true, true],
        ];
    }

    /**
     * A query for null looks for SQL NULL only where the column allows it, and for the empty value
     * only where the field stores no date as it.
     */
    #[DataProvider('noDateConstraintDataProvider')]
    #[Test]
    public function equalsNullLooksForTheWaysTheColumnCanStoreNoDate(string $property, string $column, bool $allowsNull, bool $storesEmptyValue): void
    {
        $platform = $this->get(ConnectionPool::class)->getConnectionForTable(self::TABLE)->getDatabasePlatform();
        if ($platform instanceof PostgreSQLPlatform && str_starts_with($column, 'date')) {
            // PostgreSQL cannot hold the zero date of a native DATE or DATETIME column
            $storesEmptyValue = false;
        }
        $query = $this->get(DateTimeStorageRepository::class)->createQuery();
        $query->matching($query->equals($property, null));
        $sql = str_replace(['`', '"'], '', GeneralUtility::makeInstance(Typo3DbQueryParser::class)->convertQueryToDoctrineQueryBuilder($query)->getSQL());
        self::assertSame($allowsNull, str_contains($sql, self::TABLE . '.' . $column . ' IS NULL'), 'IS NULL');
        self::assertSame($storesEmptyValue, str_contains($sql, self::TABLE . '.' . $column . ' = :'), 'compared with the empty value');
    }
}
