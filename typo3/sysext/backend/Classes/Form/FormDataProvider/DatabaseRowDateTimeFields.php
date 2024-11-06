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
use TYPO3\CMS\Core\Domain\DateTimeFormat;

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
        $dateTimeTypes = QueryHelper::getDateTimeTypes();
        $dateTimeFormats = QueryHelper::getDateTimeFormats();

        foreach ($result['processedTca']['columns'] as $column => $columnConfig) {
            if (($columnConfig['config']['type'] ?? '') !== 'datetime'
                || !in_array($columnConfig['config']['dbType'] ?? '', $dateTimeTypes, true)
            ) {
                // it's a UNIX timestamp! We do not modify this here, as it will only be treated as a datetime because
                // of eval being set to "date" or "datetime". This is handled in InputTextElement then.
                continue;
            }
            // ensure the column's value is set
            $result['databaseRow'][$column] ??= null;

            // Nullable fields do not need treatment
            $isNullable = $columnConfig['config']['nullable'] ?? false;
            if ($isNullable && $result['databaseRow'][$column] === null) {
                continue;
            }

            $format = $dateTimeFormats[$columnConfig['config']['dbType']] ?? [];
            $emptyValueFormat = $format['empty'] ?? null;
            if (!empty($result['databaseRow'][$column]) && $result['databaseRow'][$column] !== $emptyValueFormat) {
                // Create an unqualified ISO-8601 date from current field data; the database always contains server localtime
                // The field value is something like "2016-01-01" or "2016-01-01 10:11:12.
                $result['databaseRow'][$column] = (new \DateTime($result['databaseRow'][$column]))->format(DateTimeFormat::ISO8601_LOCALTIME);
            } else {
                $result['databaseRow'][$column] = $format['reset'] ?? null;
            }
        }
        return $result;
    }
}
