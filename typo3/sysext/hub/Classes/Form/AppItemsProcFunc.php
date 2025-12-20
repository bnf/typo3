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

namespace TYPO3\CMS\Hub\Form;

use Symfony\Component\DependencyInjection\Attribute\Autoconfigure;
use TYPO3\CMS\Hub\Validation\CreateRecordAppTable;

/**
 * Helper method for TCA / FormEngine to list tables available for hub
 *
 * @internal
 */
#[Autoconfigure(public: true)]
class AppItemsProcFunc
{
    /**
     * Validate the tables, added to the tables select list
     */
    public function validateAllowedTablesForExternalCreation(array &$fieldDefinition): void
    {
        foreach ($fieldDefinition['items'] as $key => $item) {
            if (!CreateRecordAppTable::fromSelectItem($item)->isAllowedForItemsProcFunc()) {
                unset($fieldDefinition['items'][$key]);
            }
        }
        // Add default select option at the top
        $fieldDefinition['items'] = array_merge(
            [['label' => 'LLL:EXT:hub/Resources/Private/Language/locallang_db.xlf:sys_app.table_name.select', 'value' => '']],
            $fieldDefinition['items']
        );
    }
}
