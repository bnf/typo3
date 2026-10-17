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

namespace TYPO3\CMS\Core\Tests\Functional\DataHandling\DataHandler;

use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\Attributes\Test;
use TYPO3\CMS\Core\Database\ConnectionPool;
use TYPO3\CMS\Core\DataHandling\DataHandler;
use TYPO3\CMS\Core\Localization\LanguageServiceFactory;
use TYPO3\CMS\Core\Tests\Functional\SiteHandling\SiteBasedTestTrait;
use TYPO3\TestingFramework\Core\Functional\FunctionalTestCase;

/**
 * Tests related to DataHandler type=datetime handling
 */
final class DatetimeTest extends FunctionalTestCase
{
    use SiteBasedTestTrait;

    private const array LANGUAGE_PRESETS = [
        'EN' => ['id' => 0, 'title' => 'English', 'locale' => 'en_US.UTF8'],
    ];

    private const array SQL_NULL_COLUMNS = [
        'datetime' => 'datetime_int_inconsistent_sql_null',
        'date' => 'date_int_inconsistent_sql_null',
        'timesec' => 'timesec_int_inconsistent_sql_null',
        'datetimesec' => 'datetimesec_int_inconsistent_sql_null',
        'time' => 'time_int_inconsistent_sql_null',
        'datetime in int(11)' => 'datetime_int32_inconsistent_sql_null',
    ];

    protected array $testExtensionsToLoad = [
        'typo3/sysext/core/Tests/Functional/Fixtures/Extensions/test_datahandler_datetime',
    ];

    protected function setUp(): void
    {
        parent::setUp();
        $this->importCSVDataSet(__DIR__ . '/../../Fixtures/be_users_admin.csv');
        $this->writeSiteConfiguration(
            'test',
            $this->buildSiteConfiguration(1, 'http://localhost/'),
            [
                $this->buildDefaultLanguageConfiguration('EN', '/en/'),
            ],
            $this->buildErrorHandlingConfiguration('Fluid', [404]),
        );
        $backendUser = $this->setUpBackendUser(1);
        $GLOBALS['LANG'] = $this->get(LanguageServiceFactory::class)->createFromUserPreferences($backendUser);
    }

    public static function getDatetimeSets(): array
    {
        return [
            'UTC0 on UTC Server' => [
                'resultSet' => 'Result',
                'timezone' => 'UTC',
                'datetime' => '2014-10-22T23:58:00Z',
                'date' => '2014-10-22T00:00:00Z',
                'timesec' => '1970-01-01T23:58:20Z',
                'datetimesec' => '2014-10-22T23:58:20Z',
                'time' => '1970-01-01T23:58:00Z',
            ],
            'UTC0 on Europe/Berlin Server' => [
                'resultSet' => 'ResultUTC0Berlin',
                'timezone' => 'Europe/Berlin',
                'datetime' => '2014-10-22T23:58:00Z',
                'date' => '2014-10-22T00:00:00Z',
                'timesec' => '1970-01-01T23:58:20Z',
                'datetimesec' => '2014-10-22T23:58:20Z',
                'time' => '1970-01-01T23:58:00Z',
            ],

            'ISO8601 localtime (Formengine server-client format) on UTC Server' => [
                'resultSet' => 'Result',
                'timezone' => 'UTC',
                'datetime' => '2014-10-22T23:58:00',
                'date' => '2014-10-22T00:00:00',
                'timesec' => '1970-01-01T23:58:20',
                'datetimesec' => '2014-10-22T23:58:20',
                'time' => '1970-01-01T23:58:00',
            ],
            'ISO8601 localtime (Formengine server-client format) on Europe/Berlin Server' => [
                'resultSet' => 'ResultBerlinLocaltime',
                'timezone' => 'Europe/Berlin',
                'datetime' => '2014-10-22T23:58:00',
                'date' => '2014-10-22T00:00:00',
                'timesec' => '1970-01-01T23:58:20',
                'datetimesec' => '2014-10-22T23:58:20',
                'time' => '1970-01-01T23:58:00',
            ],

            'empty string on UTC' => [
                'resultSet' => 'ResultEmpty',
                'timezone' => 'UTC',
                'datetime' => '',
                'date' => '',
                'timesec' => '',
                'datetimesec' => '',
                'time' => '',
            ],
            'empty string to null on Europe/Berlin' => [
                'resultSet' => 'ResultEmpty',
                'timezone' => 'Europe/Berlin',
                'datetime' => '',
                'date' => '',
                'timesec' => '',
                'datetimesec' => '',
                'time' => '',
            ],
            'null to null on UTC' => [
                'resultSet' => 'ResultNull',
                'timezone' => 'UTC',
                'datetime' => null,
                'date' => null,
                'timesec' => null,
                'datetimesec' => null,
                'time' => null,
            ],
            'null to null on Europe/Berlin' => [
                'resultSet' => 'ResultNull',
                'timezone' => 'Europe/Berlin',
                'datetime' => null,
                'date' => null,
                'timesec' => null,
                'datetimesec' => null,
                'time' => null,
            ],
            'timezone offsets on UTC' => [
                'resultSet' => 'ResultOffsetUTC',
                'timezone' => 'UTC',
                'datetime' => '2014-10-22T23:58:00+02:00',
                'date' => '2014-10-22T00:00:00+02:00',
                'timesec' => '1970-01-01T23:58:20+02:00',
                'datetimesec' => '2014-10-22T23:58:20+02:00',
                'time' => '1970-01-01T23:58:00+02:00',
            ],
            'timezone offsets on Europe/Berlin' => [
                'resultSet' => 'ResultOffsetBerlin',
                'timezone' => 'Europe/Berlin',
                'datetime' => '2014-10-22T23:58:00+02:00',
                'date' => '2014-10-22T00:00:00+02:00',
                'timesec' => '1970-01-01T23:58:20+02:00',
                'datetimesec' => '2014-10-22T23:58:20+02:00',
                'time' => '1970-01-01T23:58:00+02:00',
            ],
            '0 on UTC' => [
                'resultSet' => 'ResultZeroUTC',
                'timezone' => 'UTC',
                'datetime' => 0,
                'date' => 0,
                'timesec' => 0,
                'datetimesec' => 0,
                'time' => 0,
            ],
            '0 on Europe/Berlin' => [
                'resultSet' => 'ResultZeroBerlin',
                'timezone' => 'Europe/Berlin',
                'datetime' => 0,
                'date' => 0,
                'timesec' => 0,
                'datetimesec' => 0,
                'time' => 0,
            ],
        ];
    }

    #[DataProvider('getDatetimeSets')]
    #[Test]
    public function createDatetimeRecords(
        string $resultSet,
        string $timezone,
        string|int|null $datetime,
        string|int|null $date,
        string|int|null $timesec,
        string|int|null $datetimesec,
        string|int|null $time,
    ): void {
        $this->importCSVDataSet(__DIR__ . '/DataSet/Datetime/Base.csv');

        $fields = [
            'datetime_int' => $datetime,
            'datetime_int_nullable' => $datetime,
            'datetime_native' => $datetime,
            'datetime_int_inconsistent_sql_null' => $datetime,

            'date_int' => $date,
            'date_int_nullable' => $date,
            'date_native' => $date,
            'date_int_inconsistent_sql_null' => $date,

            'timesec_int' => $timesec,
            'timesec_int_nullable' => $timesec,
            'timesec_native' => $timesec,
            'timesec_int_inconsistent_sql_null' => $timesec,

            'datetimesec_int' => $datetimesec,
            'datetimesec_int_nullable' => $datetimesec,
            'datetimesec_native' => $datetimesec,
            'datetimesec_int_inconsistent_sql_null' => $datetimesec,

            'time_int' => $time,
            'time_int_nullable' => $time,
            'time_native' => $time,
            'time_int_inconsistent_sql_null' => $time,
        ];

        $oldTimezone = date_default_timezone_get();
        date_default_timezone_set($timezone);

        $dataHandler = $this->get(DataHandler::class);
        $dataHandler->enableLogging = false;
        $dataHandler->start(
            [
                'tx_testdatahandler_datetime' => [
                    'NEW-1' => [
                        'pid' => 2,
                        ...$fields,
                    ],
                ],
            ],
            [],
        );
        $dataHandler->process_datamap();
        date_default_timezone_set($oldTimezone);
        $this->assertCSVDataSet(__DIR__ . '/DataSet/Datetime/' . $resultSet . '.csv');
    }

    public static function getDatetimeObjectSets(): array
    {
        return [
            'UTC0 on UTC Server' => [
                'resultSet' => 'Result',
                'timezone' => 'UTC',
                'datetime' => new \DateTimeImmutable('2014-10-22T23:58:00Z'),
                'date' => new \DateTimeImmutable('2014-10-22T00:00:00Z'),
                'timesec' => new \DateTimeImmutable('1970-01-01T23:58:20Z'),
                'datetimesec' => new \DateTimeImmutable('2014-10-22T23:58:20Z'),
                'time' => new \DateTimeImmutable('1970-01-01T23:58:00Z'),
            ],
            'UTC0 on Europe/Berlin Server' => [
                'resultSet' => 'ResultUTC0Berlin',
                'timezone' => 'Europe/Berlin',
                'datetime' => new \DateTimeImmutable('2014-10-22T23:58:00Z'),
                'date' => new \DateTimeImmutable('2014-10-22T00:00:00Z'),
                'timesec' => new \DateTimeImmutable('1970-01-01T23:58:20Z'),
                'datetimesec' => new \DateTimeImmutable('2014-10-22T23:58:20Z'),
                'time' => new \DateTimeImmutable('1970-01-01T23:58:00Z'),
            ],

            'ISO8601 localtime (Formengine server-client format) on UTC Server' => [
                'resultSet' => 'Result',
                'timezone' => 'UTC',
                'datetime' => new \DateTimeImmutable('2014-10-22T23:58:00'),
                'date' => new \DateTimeImmutable('2014-10-22T00:00:00'),
                'timesec' => new \DateTimeImmutable('1970-01-01T23:58:20'),
                'datetimesec' => new \DateTimeImmutable('2014-10-22T23:58:20'),
                'time' => new \DateTimeImmutable('1970-01-01T23:58:00'),
            ],
            'ISO8601 localtime (Formengine server-client format) on Europe/Berlin Server' => [
                'resultSet' => 'ResultBerlinLocaltime',
                'timezone' => 'Europe/Berlin',
                'datetime' => new \DateTimeImmutable('2014-10-22T23:58:00', new \DateTimeZone('Europe/Berlin')),
                'date' => new \DateTimeImmutable('2014-10-22T00:00:00', new \DateTimeZone('Europe/Berlin')),
                'timesec' => new \DateTimeImmutable('1970-01-01T23:58:20', new \DateTimeZone('Europe/Berlin')),
                'datetimesec' => new \DateTimeImmutable('2014-10-22T23:58:20', new \DateTimeZone('Europe/Berlin')),
                'time' => new \DateTimeImmutable('1970-01-01T23:58:00', new \DateTimeZone('Europe/Berlin')),
            ],

            'null to null on UTC' => [
                'resultSet' => 'ResultNull',
                'timezone' => 'UTC',
                'datetime' => null,
                'date' => null,
                'timesec' => null,
                'datetimesec' => null,
                'time' => null,
            ],
            'null to null on Europe/Berlin' => [
                'resultSet' => 'ResultNull',
                'timezone' => 'Europe/Berlin',
                'datetime' => null,
                'date' => null,
                'timesec' => null,
                'datetimesec' => null,
                'time' => null,
            ],
            'timezone offsets on UTC' => [
                'resultSet' => 'ResultOffsetUTC',
                'timezone' => 'UTC',
                'datetime' => new \DateTimeImmutable('2014-10-22T23:58:00+02:00'),
                'date' => new \DateTimeImmutable('2014-10-22T00:00:00+02:00'),
                'timesec' => new \DateTimeImmutable('1970-01-01T23:58:20+02:00'),
                'datetimesec' => new \DateTimeImmutable('2014-10-22T23:58:20+02:00'),
                'time' => new \DateTimeImmutable('1970-01-01T23:58:00+02:00'),
            ],
            'timezone offsets on Europe/Berlin' => [
                'resultSet' => 'ResultOffsetBerlin',
                'timezone' => 'Europe/Berlin',
                'datetime' => new \DateTimeImmutable('2014-10-22T23:58:00+02:00'),
                'date' => new \DateTimeImmutable('2014-10-22T00:00:00+02:00'),
                'timesec' => new \DateTimeImmutable('1970-01-01T23:58:20+02:00'),
                'datetimesec' => new \DateTimeImmutable('2014-10-22T23:58:20+02:00'),
                'time' => new \DateTimeImmutable('1970-01-01T23:58:00+02:00'),
            ],
        ];
    }

    #[DataProvider('getDatetimeObjectSets')]
    #[Test]
    public function createDatetimeObjectRecords(
        string $resultSet,
        string $timezone,
        ?\DateTimeInterface $datetime,
        ?\DateTimeInterface $date,
        ?\DateTimeInterface $timesec,
        ?\DateTimeInterface $datetimesec,
        ?\DateTimeInterface $time,
    ): void {
        $this->importCSVDataSet(__DIR__ . '/DataSet/Datetime/Base.csv');

        $fields = [
            'datetime_int' => $datetime,
            'datetime_int_nullable' => $datetime,
            'datetime_native' => $datetime,
            'datetime_int_inconsistent_sql_null' => $datetime,

            'date_int' => $date,
            'date_int_nullable' => $date,
            'date_native' => $date,
            'date_int_inconsistent_sql_null' => $date,

            'timesec_int' => $timesec,
            'timesec_int_nullable' => $timesec,
            'timesec_native' => $timesec,
            'timesec_int_inconsistent_sql_null' => $timesec,

            'datetimesec_int' => $datetimesec,
            'datetimesec_int_nullable' => $datetimesec,
            'datetimesec_native' => $datetimesec,
            'datetimesec_int_inconsistent_sql_null' => $datetimesec,

            'time_int' => $time,
            'time_int_nullable' => $time,
            'time_native' => $time,
            'time_int_inconsistent_sql_null' => $time,
        ];

        $oldTimezone = date_default_timezone_get();
        date_default_timezone_set($timezone);

        $dataHandler = $this->get(DataHandler::class);
        $dataHandler->enableLogging = false;
        $dataHandler->start(
            [
                'tx_testdatahandler_datetime' => [
                    'NEW-1' => [
                        'pid' => 2,
                        ...$fields,
                    ],
                ],
            ],
            [],
        );
        $dataHandler->process_datamap();
        date_default_timezone_set($oldTimezone);

        $this->assertCSVDataSet(__DIR__ . '/DataSet/Datetime/' . $resultSet . '.csv');
    }

    /**
     * @return array<string, array{fields: array<string, string|null>, expected: array<string, string|null>}>
     */
    public static function updateSqlNullDataProvider(): array
    {
        return [
            'datetime fields not submitted' => [
                'fields' => [],
                'expected' => array_fill_keys(self::SQL_NULL_COLUMNS, null),
            ],
            'empty string' => [
                'fields' => array_fill_keys(self::SQL_NULL_COLUMNS, ''),
                'expected' => array_fill_keys(self::SQL_NULL_COLUMNS, '0'),
            ],
            'null' => [
                'fields' => array_fill_keys(self::SQL_NULL_COLUMNS, null),
                'expected' => array_fill_keys(self::SQL_NULL_COLUMNS, '0'),
            ],
            'date' => [
                'fields' => [
                    'datetime_int_inconsistent_sql_null' => '2014-10-22T23:58:00Z',
                    'date_int_inconsistent_sql_null' => '2014-10-22T00:00:00Z',
                    'timesec_int_inconsistent_sql_null' => '1970-01-01T23:58:20Z',
                    'datetimesec_int_inconsistent_sql_null' => '2014-10-22T23:58:20Z',
                    'time_int_inconsistent_sql_null' => '1970-01-01T23:58:00Z',
                    'datetime_int32_inconsistent_sql_null' => '2014-10-22T23:58:00Z',
                ],
                'expected' => [
                    'datetime_int_inconsistent_sql_null' => '1414022280',
                    'date_int_inconsistent_sql_null' => '1413936000',
                    'timesec_int_inconsistent_sql_null' => '86300',
                    'datetimesec_int_inconsistent_sql_null' => '1414022300',
                    'time_int_inconsistent_sql_null' => '86280',
                    'datetime_int32_inconsistent_sql_null' => '1414022280',
                ],
            ],
        ];
    }

    /**
     * A column declared DEFAULT NULL in ext_tables.sql, while the TCA does not make it nullable,
     * may hold SQL NULL in records DataHandler did not write.
     *
     * @param array<string, string|null> $fields
     * @param array<string, string|null> $expected
     */
    #[DataProvider('updateSqlNullDataProvider')]
    #[Test]
    public function updateRecordHoldingSqlNullInAColumnThatIsNotNullable(array $fields, array $expected): void
    {
        $this->importCSVDataSet(__DIR__ . '/DataSet/Datetime/SqlNull.csv');
        $oldTimezone = date_default_timezone_get();
        date_default_timezone_set('UTC');
        $dataHandler = $this->get(DataHandler::class);
        $dataHandler->enableLogging = false;
        $dataHandler->start(
            [
                'tx_testdatahandler_datetime' => [
                    1 => [
                        'title' => 'Record changed',
                        ...$fields,
                    ],
                ],
            ],
            [],
        );
        $dataHandler->process_datamap();
        date_default_timezone_set($oldTimezone);
        self::assertSame([], $dataHandler->errorLog);
        self::assertSame($expected, $this->sqlNullColumnValues(1));
    }

    #[Test]
    public function copyRecordHoldingSqlNullInAColumnThatIsNotNullableWritesTheEmptyValue(): void
    {
        $this->importCSVDataSet(__DIR__ . '/DataSet/Datetime/SqlNull.csv');
        $dataHandler = $this->get(DataHandler::class);
        $dataHandler->enableLogging = false;
        $dataHandler->start([], ['tx_testdatahandler_datetime' => [1 => ['copy' => 3]]]);
        $dataHandler->process_cmdmap();
        self::assertSame([], $dataHandler->errorLog);
        self::assertSame(array_fill_keys(self::SQL_NULL_COLUMNS, null), $this->sqlNullColumnValues(1));
        self::assertSame(array_fill_keys(self::SQL_NULL_COLUMNS, '0'), $this->sqlNullColumnValues($dataHandler->copyMappingArray_merged['tx_testdatahandler_datetime'][1]));
    }

    /**
     * @return array<string, string|null>
     */
    private function sqlNullColumnValues(int $uid): array
    {
        $row = $this->get(ConnectionPool::class)
            ->getConnectionForTable('tx_testdatahandler_datetime')
            ->select(array_values(self::SQL_NULL_COLUMNS), 'tx_testdatahandler_datetime', ['uid' => $uid])
            ->fetchAssociative();
        // Drivers differ on whether an integer column comes back as int or as string.
        return array_map(static fn(mixed $value): ?string => $value === null ? null : (string)$value, $row);
    }

    /**
     * @return array<string, array{0: string, 1: int|string, 2: string}>
     */
    public static function timeRangeDataProvider(): array
    {
        return [
            'native, database value within range' => ['time_native_range', '10:00:00', '10:00:00'],
            'native, database value above range' => ['time_native_range', '13:00:00', '12:00:00'],
            'native, database value below range' => ['time_native_range', '07:00:00', '08:00:00'],
            'native, form value within range' => ['time_native_range', '1970-01-01T10:00:00', '10:00:00'],
            'native, form value above range' => ['time_native_range', '1970-01-01T13:00:00', '12:00:00'],
            'int, database value within range' => ['timesec_int_range', 36000, '36000'],
            'int, database value above range' => ['timesec_int_range', 46800, '43200'],
            'int, form value within range' => ['timesec_int_range', '1970-01-01T11:30:00', '41400'],
            'int, form value above range' => ['timesec_int_range', '1970-01-01T12:30:00', '43200'],
            'int, form value below range' => ['timesec_int_range', '1970-01-01T07:30:00', '28800'],
        ];
    }

    /**
     * The range of a time field is given in seconds since midnight, like the value it stores, and
     * applies to the time whatever date a value comes with.
     */
    #[DataProvider('timeRangeDataProvider')]
    #[Test]
    public function rangeOfATimeFieldLimitsTheTime(string $field, int|string $value, string $expected): void
    {
        $this->importCSVDataSet(__DIR__ . '/DataSet/Datetime/Base.csv');
        $oldTimezone = date_default_timezone_get();
        date_default_timezone_set('Europe/Berlin');
        $dataHandler = $this->get(DataHandler::class);
        $dataHandler->enableLogging = false;
        $dataHandler->start(['tx_testdatahandler_datetime' => ['NEW-1' => ['pid' => 2, $field => $value]]], []);
        $dataHandler->process_datamap();
        date_default_timezone_set($oldTimezone);
        self::assertSame([], $dataHandler->errorLog);
        $stored = $this->get(ConnectionPool::class)
            ->getConnectionForTable('tx_testdatahandler_datetime')
            ->select([$field], 'tx_testdatahandler_datetime', ['uid' => $dataHandler->substNEWwithIDs['NEW-1']])
            ->fetchOne();
        self::assertSame($expected, (string)$stored);
    }

    /**
     * A native DATE column cannot store a time, whatever format the field configures.
     */
    #[Test]
    public function nativeDateFieldWithTimeFormatStoresTheDate(): void
    {
        $this->importCSVDataSet(__DIR__ . '/DataSet/Datetime/Base.csv');
        $dataHandler = $this->get(DataHandler::class);
        $dataHandler->enableLogging = false;
        $dataHandler->start(['tx_testdatahandler_datetime' => ['NEW-1' => ['pid' => 2, 'date_native_format_time' => '2014-10-22T10:00:00']]], []);
        $dataHandler->process_datamap();
        self::assertSame('2014-10-22', $this->get(ConnectionPool::class)
            ->getConnectionForTable('tx_testdatahandler_datetime')
            ->select(['date_native_format_time'], 'tx_testdatahandler_datetime', ['uid' => $dataHandler->substNEWwithIDs['NEW-1']])
            ->fetchOne());
    }
}
