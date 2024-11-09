<?php

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

namespace TYPO3\CMS\Backend\Form\FormDataProvider;

use TYPO3\CMS\Backend\Form\FormDataProviderInterface;
use TYPO3\CMS\Core\Database\Query\QueryHelper;
use TYPO3\CMS\Core\Utility\MathUtility;

/**
 * Migrate date and datetime db field values to timestamp
 */
class DatabaseRowDateTimeFields implements FormDataProviderInterface
{
    /**
     * Migrate date and datetime db field values to timestamp
     *
     * @return array
     */
    public function addData(array $result)
    {
        foreach ($result['processedTca']['columns'] as $column => $columnConfig) {
            $type = $columnConfig['config']['type'] ?? '';
            if ($type === 'datetime') {
                $result['databaseRow'][$column] = $this->createDatetime(
                    $result['databaseRow'][$column] ?? null,
                    $columnConfig['config'],
                );
            }
        }
        return $result;
    }

    protected function createDatetime(string|int|null $value, array $config): ?\DateTimeImmutable
    {
        $dateTimeTypes = QueryHelper::getDateTimeTypes();
        $dbType = $config['dbType'] ?? '';
        $format = $config['format'] ?? 'datetime';
        $isNullable = $config['nullable'] ?? false;
        $isNative = in_array($dbType, $dateTimeTypes, true);

        if ($value === null || $value === '') {
            return null;
        }

        if ($isNative) {
            $dateTimeFormats = QueryHelper::getDateTimeFormats();
            $format = $dateTimeFormats[$dbType] ?? [];
            $emptyValueFormat = $format['empty'] ?? null;

            if (!$isNullable && $value === $emptyValueFormat) {
                return null;
            }

            if (is_int($value) || MathUtility::canBeInterpretedAsInteger($value)) {
                $datetime = new \DateTimeImmutable('@' . $value);
                // @todo: Should we really transform to localtime? We don't do this in DataHandler currently.
                // We should! …and we should do that in DataHandler as well, for consistency.
                return $datetime->setTimezone(new \DateTimeZone(date_default_timezone_get()));
            }
            // Create an DateTime object in current server timezone.
            // The database always contains server localtime (not UTC!),
            // something like "2016-01-01" or "2016-01-01 10:11:12".
            return new \DateTimeImmutable($value);
        }

        if (!$isNullable && ($value === '0' || $value === 0)) {
            return null;
        }

        $datetime = new \DateTimeImmutable('@' . $value);

        if ($format === 'date' || $format === 'datetime') {
            // Transform from UTC timestamp to localtime
            $datetime = $datetime->setTimezone(new \DateTimeZone(date_default_timezone_get()));
        }

        // @todo: Should we encode time/timesec in UTC or localtime?
        // We should do localtime, as we'd do that automatically for native fields as well

        return $datetime;
    }
}
