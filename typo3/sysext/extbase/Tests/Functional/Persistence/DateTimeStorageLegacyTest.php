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
 * nullable=false, or left over in a nullable one. Only MySQL and MariaDB can hold it, and only
 * without NO_ZERO_DATE.
 */
#[Group('not-postgres')]
#[Group('not-sqlite')]
final class DateTimeStorageLegacyTest extends FunctionalTestCase
{
    use DateTimeStorageTestTrait;

    protected array $testExtensionsToLoad = [
        'typo3/sysext/extbase/Tests/Functional/Fixtures/Extensions/blog_example',
    ];

    protected array $configurationToUseInTestInstance = [
        'DB' => [
            'Connections' => [
                'Default' => [
                    // Same sql_mode the testing framework sets up for MySQL/MariaDB, except that
                    // `NO_ZERO_DATE` is left out to allow "0000-00-00" values for DATE and DATETIME
                    // fields with legacy non-nullable config.
                    'initCommands' => 'SET SESSION sql_mode = \''
                        . 'STRICT_ALL_TABLES'
                        . ',ERROR_FOR_DIVISION_BY_ZERO'
                        . ',NO_AUTO_VALUE_ON_ZERO'
                        . ',NO_ENGINE_SUBSTITUTION'
                        . ',NO_ZERO_IN_DATE'
                        . ',ONLY_FULL_GROUP_BY'
                        . '\';',
                ],
            ],
        ],
    ];

    /**
     * @return array<string, array{0: string, 1: string, 2: string}>
     */
    public static function storageVariantDataProvider(): array
    {
        return [
            'dbType=date, nullable=false' => ['dateNotNull', 'date_not_null', '0000-00-00'],
            'dbType=datetime, nullable=false' => ['datetimeNotNull', 'datetime_not_null', '0000-00-00 00:00:00'],
        ];
    }

    /**
     * @return array<string, array{0: string, 1: string, 2: string, 3: string}>
     */
    public static function nullableZeroDateDataProvider(): array
    {
        return [
            'dbType=date, nullable by default' => ['dateNullable', 'date_nullable', '0000-00-00', '2025-01-20'],
            'dbType=datetime, nullable by default' => ['datetimeNullable', 'datetime_nullable', '0000-00-00 00:00:00', '2025-01-20 14:18:56'],
        ];
    }

    /**
     * A native column that is nullable still holds the zero date in rows written before it was.
     */
    #[DataProvider('nullableZeroDateDataProvider')]
    #[Test]
    public function aZeroDateInANullableColumnCountsAsNull(string $property, string $column, string $zeroDate, string $date): void
    {
        $this->insertRows($column, [$zeroDate, null, $date]);
        $this->assertNullMatches($property, [1, 2], [3]);
    }
}
