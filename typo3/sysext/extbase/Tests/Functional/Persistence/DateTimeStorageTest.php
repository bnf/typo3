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
use PHPUnit\Framework\Attributes\Test;
use TYPO3\TestingFramework\Core\Functional\FunctionalTestCase;
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
     * A column declared DEFAULT NULL in ext_tables.sql, while the TCA does not make it nullable,
     * holds SQL NULL where it was written before Extbase wrote the empty value.
     */
    #[Test]
    public function sqlNullInAColumnThatIsNotNullableCountsAsNull(): void
    {
        $this->insertRows('int_legacy_null', [null, 0, 1737382736]);
        $this->assertNullMatches('intLegacyNull', [1, 2], [3]);
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
}
