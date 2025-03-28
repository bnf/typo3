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

namespace TYPO3\CMS\Core\Domain;

use TYPO3\CMS\Core\Database\Query\QueryHelper;
use TYPO3\CMS\Core\Schema\Field\DateTimeFieldType;
use TYPO3\CMS\Core\Utility\MathUtility;

/**
 * @internal
 */
final readonly class DateTimeFactory
{
    public static function createFromDatabaseValue(int|string|null $value, DateTimeFieldType $fieldInformation): ?\DateTimeImmutable
    {
        return self::fromDatabase(
            $value,
            $fieldInformation->isNullable(),
            $fieldInformation->getFormat(),
            $fieldInformation->getPersistenceType(),
        );
    }

    public static function createFomDatabaseValueAndTCAConfig(int|string|null $value, array $fieldConfig): ?\DateTimeImmutable
    {
        $persistenceType = in_array($fieldConfig['dbType'] ?? null, QueryHelper::getDateTimeTypes(), true) ? $fieldConfig['dbType'] : null;
        $isNative = $persistenceType !== null;
        $isNullable = $fieldConfig['nullable'] ?? $isNative;
        $format = self::getFormatFromTCAConfig($fieldConfig);
        return self::fromDatabase(
            $value,
            $isNullable,
            $format,
            $persistenceType
        );
    }

    public static function getFormatFromTCAConfig(array $fieldConfig): string
    {
        $format = $fieldConfig['format'] ?? null;
        $persistenceType = $fieldConfig['dbType'] ?? null;
        if ($format === null && in_array($persistenceType, QueryHelper::getDateTimeTypes(), true)) {
            $format = $persistenceType === 'time' ? 'timesec' : $persistenceType;
        }
        return $format ?? 'datetime';
    }

    /**
     * Create a DateTimeImmutable object from a unix timestamp in server localtime
     *
     * Alternative to \DateTimeImmutable('@…') which forces UTC timezone
     */
    public static function createFromTimestamp(int $timestamp): \DateTimeImmutable
    {
        // Create a new DateTime object in current timezone
        //
        // Note: As documented by PHP, `\DateTime` or `\DateTimeImmutable`
        // objects created from timestamps (e.g., '@12345678') as the
        // first constructor argument will use UTC as timezone instead of localtime,
        // therefore we must not initialize with a timestamp directly.
        $datetime = new \DateTimeImmutable();

        // Apply timestamp (which will not change the objects timezone)
        return $datetime->setTimestamp($timestamp);
    }

    private static function fromDatabase(
        int|string|null $value,
        bool $isNullable,
        string $format,
        ?string $persistenceType
    ): ?\DateTimeImmutable {
        // @todo move into fromDatabaseValueWithTCA? (and check this in schema api on build)
        if (!in_array($format, ['datetime', 'date', 'time', 'timesec'], true)) {
            throw new \InvalidArgumentException('Invalid format "' . $format . '" in datetime field', 1743158410);
        }

        if ($value === null || $value === '') {
            return null;
        }

        if (!$isNullable && ($value === '0' || $value === 0)) {
            // Interpret 0 as an empty value if the field is not nullable
            return null;
        }

        // Handle native date/time fields
        if (in_array($persistenceType, QueryHelper::getDateTimeTypes(), true)) {
            $dateTimeFormats = QueryHelper::getDateTimeFormats();
            $legacyEmptyValue = $dateTimeFormats[$persistenceType]['empty'] ?? null;

            // Only the empty value (00:00:00) of dbType=time is a value that is also a valid value,
            // DATE and DATETIME empty-values like 0000-00-00 are *not* valid dates and therefore should
            // be represented as `null`.
            $emptyValueIsInvalidDateString = $persistenceType === 'date' || $persistenceType === 'datetime';
            $emptyValueIsValidDateString = $persistenceType === 'time';
            if ($value === $legacyEmptyValue && (
                // treat 0000-00-00 for DATE/DATETIME fields as NULL,
                // even for NULLable fields which should not have this value
                // in theory, but may have not been migrated to NULL yet.
                $emptyValueIsInvalidDateString ||
                // Treat 00:00:00 for TIME fields as NULL if field is *not* nullable, skip
                // for nullable fields as 00:00:00 is to be considered a valid midnight time.
                ($emptyValueIsValidDateString && !$isNullable)
            )) {
                return null;
            }
        }

        try {
            $datetime = match (true) {
                // Unix timestamp
                is_int($value) || MathUtility::canBeInterpretedAsInteger($value) => self::createFromTimestamp((int)$value),
                // The database always contains server localtime in native fields.
                // The field value is something like "2016-01-01" or "2016-01-01 10:11:12.
                default => new \DateTimeImmutable($value),
            };
            // @todo switch to catch(\DateMalformedStringException) once php 8.3 is minimum
        } catch (\Exception) {
            throw new \InvalidArgumentException('Invalid date provided', 1743159490);
        }

        if ($format === 'time') {
            // time(sec) is stored as elapsed seconds in DB, hence we interpret it as time on 1970-01-01 for consistency
            $datetime = $datetime->setDate(1970, 01, 01)->setTime((int)$datetime->format('H'), (int)$datetime->format('i'), 0);
        } elseif ($format === 'timesec') {
            $datetime = $datetime->setDate(1970, 01, 01);
        } elseif ($format === 'date') {
            $datetime = $datetime->setTime(0, 0, 0);
        }

        return $datetime;
    }
}
