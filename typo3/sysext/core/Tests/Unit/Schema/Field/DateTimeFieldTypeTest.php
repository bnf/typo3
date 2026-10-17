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

namespace TYPO3\CMS\Core\Tests\Unit\Schema\Field;

use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\Attributes\Test;
use TYPO3\CMS\Core\Schema\Field\DateTimeFieldType;
use TYPO3\TestingFramework\Core\Unit\UnitTestCase;

final class DateTimeFieldTypeTest extends UnitTestCase
{
    public static function isNullableDataProvider(): \Generator
    {
        yield 'integer, not configured' => [['type' => 'datetime'], false];
        yield 'integer, true' => [['type' => 'datetime', 'nullable' => true], true];
        yield 'integer, 1' => [['type' => 'datetime', 'nullable' => 1], true];
        yield 'integer, 0' => [['type' => 'datetime', 'nullable' => 0], false];
        yield 'native, not configured' => [['type' => 'datetime', 'dbType' => 'date'], true];
        yield 'native, false' => [['type' => 'datetime', 'dbType' => 'date', 'nullable' => false], false];
        yield 'native, 0' => [['type' => 'datetime', 'dbType' => 'datetime', 'nullable' => 0], false];
        yield 'native, 1' => [['type' => 'datetime', 'dbType' => 'time', 'nullable' => 1], true];
    }

    #[DataProvider('isNullableDataProvider')]
    #[Test]
    public function isNullable(array $configuration, bool $expected): void
    {
        self::assertSame($expected, new DateTimeFieldType('field', $configuration)->isNullable());
    }

    public static function getFormatDataProvider(): \Generator
    {
        yield 'integer, not configured' => [['type' => 'datetime'], 'datetime'];
        yield 'integer, datetimesec' => [['type' => 'datetime', 'format' => 'datetimesec'], 'datetimesec'];
        yield 'native date, not configured' => [['type' => 'datetime', 'dbType' => 'date'], 'date'];
        yield 'native date, time' => [['type' => 'datetime', 'dbType' => 'date', 'format' => 'time'], 'date'];
        yield 'native date, datetime' => [['type' => 'datetime', 'dbType' => 'date', 'format' => 'datetime'], 'date'];
        yield 'native date, datetimesec' => [['type' => 'datetime', 'dbType' => 'date', 'format' => 'datetimesec'], 'date'];
        yield 'native time, not configured' => [['type' => 'datetime', 'dbType' => 'time'], 'timesec'];
        yield 'native time, time' => [['type' => 'datetime', 'dbType' => 'time', 'format' => 'time'], 'time'];
        yield 'native time, datetime' => [['type' => 'datetime', 'dbType' => 'time', 'format' => 'datetime'], 'timesec'];
        yield 'native time, datetimesec' => [['type' => 'datetime', 'dbType' => 'time', 'format' => 'datetimesec'], 'timesec'];
        yield 'native datetime, date' => [['type' => 'datetime', 'dbType' => 'datetime', 'format' => 'date'], 'date'];
    }

    #[DataProvider('getFormatDataProvider')]
    #[Test]
    public function getFormat(array $configuration, string $expected): void
    {
        self::assertSame($expected, new DateTimeFieldType('field', $configuration)->getFormat());
    }
}
