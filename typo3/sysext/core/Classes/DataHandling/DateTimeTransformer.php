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

use TYPO3\CMS\Core\Database\Query\QueryHelper;
use TYPO3\CMS\Core\Schema\Field\DateTimeFieldType;
use TYPO3\CMS\Core\Utility\MathUtility;

readonly class DateTimeTransformer
{
    /**
     * Transforms database values and user input to a \DateTime object.
     *
     * Unqualified ISO8601 strings are interpreted in server localtime.
     * (both from user input and from native database fields)
     */
    public function toDateTime(\DateTimeInterface|int|string|null $value, DateTimeFieldType|array $fieldInformation): ?\DateTimeInterface
    {
        if ($fieldInformation instanceof DateTimeFieldType) {
            $isNullable = $fieldInformation->isNullable();
            $format = $fieldInformation->getFormat();
            $persistenceType = $fieldInformation->getPersistenceType();
        } else {
            $isNullable = $fieldInformation['nullable'] ?? false;
            $format = $fieldInformation['format'] ?? 'datetime';
            $persistenceType = $fieldInformation['dbType'] ?? null;
        }

        if (!in_array($format, ['datetime', 'date', 'time', 'timesec'], true)) {
            throw new \InvalidArgumentException('Invalid format "' . $format . '" in datetime field', 1731300989);
        }

        if ($value === null || $value === '') {
            return null;
        }

        // Handle native date/time fields
        $isNativeDateTimeField = false;
        if (in_array($persistenceType, QueryHelper::getDateTimeTypes(), true)) {
            $isNativeDateTimeField = true;
            $dateTimeFormats = QueryHelper::getDateTimeFormats();
            if ($value === $dateTimeFormats[$persistenceType]['empty']) {
                return null;
            }
            $nullValue = $isNullable ? null : $dateTimeFormats[$persistenceType]['reset'];
            if ($nullValue === null) {
                $isNullable = true;
            }
        }

        if (!$isNullable && ($value === '0' || $value === 0)) {
            // Interpret 0 as an empty value if the field is not nullable
            return null;
        }

        try {
            $datetime = match (true) {
                $value instanceof \DateTimeImmutable => $value,
                $value instanceof \DateTimeInterface => \DateTimeImmutable::createFromMutable($value),
                // Unix timestamp
                is_int($value) || MathUtility::canBeInterpretedAsInteger($value) => new \DateTimeImmutable('@' . $value),
                // The value we receive from the backend form is an unqualified ISO 8601 date,
                // for instance "1999-11-11T11:11:11".
                // We can also accept an ISO8601 date with offsets,
                // for instance "1999-11-11T12:11:11+01:00"
                // And we accept database formatted strings,
                // for instance "1999-11-11 12:11:11"
                default => new \DateTimeImmutable($value),
            };
        } catch (\Exception) {
            // @todo this needs to be an exception
            return null;
        }

        if ($format === 'time') {
            // time(sec) is stored as elapsed seconds in DB, hence we interpret it as time on 1970-01-01 for consistency
            $datetime = $datetime->setDate(1970, 01, 01)->setTime((int)$datetime->format('H'), (int)$datetime->format('i'), 0);
        } elseif ($format === 'timesec' || $persistenceType === 'time') {
            $datetime = $datetime->setDate(1970, 01, 01);
        } elseif ($format === 'date' || $persistenceType === 'date') {
            $datetime = $datetime->setTime(0, 0, 0);
        }

        return $datetime;
    }

    public function toDatabaseValue(?\DateTimeInterface $datetime, DateTimeFieldType|array $fieldInformation): string|int|null
    {
        if ($fieldInformation instanceof DateTimeFieldType) {
            $isNullable = $fieldInformation->isNullable();
            $format = $fieldInformation->getFormat();
            $persistenceType = $fieldInformation->getPersistenceType();
        } else {
            $isNullable = $fieldInformation['nullable'] ?? false;
            $format = $fieldInformation['format'] ?? 'datetime';
            $persistenceType = $fieldInformation['dbType'] ?? null;
        }

        if (!in_array($format, ['datetime', 'date', 'time', 'timesec'], true)) {
            throw new \InvalidArgumentException('Invalid format "' . $format . '" in datetime field', 1731300990);
        }

        // Handle native date/time fields
        $isNativeDateTimeField = false;
        $nullValue = $isNullable ? null : 0;
        if (in_array($persistenceType, QueryHelper::getDateTimeTypes(), true)) {
            $isNativeDateTimeField = true;
            $dateTimeFormats = QueryHelper::getDateTimeFormats();
            /*
            if ($value === $dateTimeFormats[$persistenceType]['empty']) {
                return null;
            }
             */
            $nullValue = $isNullable ? null : $dateTimeFormats[$persistenceType]['reset'];
            if ($nullValue === null) {
                $isNullable = true;
            }
            $nativeDateTimeFieldFormat = $dateTimeFormats[$persistenceType]['format'];
        }

        if ($datetime === null) {
            return $nullValue;
        }

        // Handle native date/time fields
        if ($isNativeDateTimeField) {
            if ($persistenceType === 'datetime') {
                // native DATETIME values are stored in server LOCALTIME. Force conversion to the servers current timezone.
                $datetime = $datetime->setTimezone(new \DateTimeZone(date_default_timezone_get()));
            }
            // Format the value back to a date(time) string
            return $datetime->format($nativeDateTimeFieldFormat);
        }

        if ($format === 'timesec' || $format === 'time') {
            // Time is stored in seconds for integer fields
            return (int)$datetime->format('H') * 3600 + (int)$datetime->format('i') * 60 + (int)$datetime->format('s');
        }

        // Encode as unix timestamp (int) if no native field is used
        return $datetime->getTimestamp();
    }
}
