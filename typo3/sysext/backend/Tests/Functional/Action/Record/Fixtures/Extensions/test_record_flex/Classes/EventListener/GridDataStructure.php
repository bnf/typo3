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

namespace TYPO3Tests\TestRecordFlex\EventListener;

use TYPO3\CMS\Core\Attribute\AsEventListener;
use TYPO3\CMS\Core\Configuration\Event\AfterFlexFormDataStructureIdentifierInitializedEvent;
use TYPO3\CMS\Core\Configuration\Event\AfterFlexFormDataStructureParsedEvent;
use TYPO3\CMS\Core\Utility\GeneralUtility;

/**
 * Adds a sheet to records of type "dynamic" depending on the stored mode,
 * like EXT:form adds sheets depending on the stored form definition
 */
final readonly class GridDataStructure
{
    #[AsEventListener('test-record-flex/grid-data-structure-identifier')]
    public function addStoredMode(AfterFlexFormDataStructureIdentifierInitializedEvent $event): void
    {
        if ($event->getTableName() !== 'tx_testrecordflex'
            || $event->getFieldName() !== 'settings'
            || ($event->getRow()['record_type'] ?? '') !== 'dynamic'
        ) {
            return;
        }
        $stored = $event->getRow()['settings'] ?? '';
        $flexData = is_string($stored) && $stored !== '' ? GeneralUtility::xml2array($stored) : [];
        $identifier = $event->getIdentifier();
        $identifier['test-record-flex-mode'] = is_array($flexData) ? (string)($flexData['data']['sDEF']['lDEF']['settings.mode']['vDEF'] ?? '') : '';
        $event->setIdentifier($identifier);
    }

    #[AsEventListener('test-record-flex/grid-data-structure')]
    public function addGridSheet(AfterFlexFormDataStructureParsedEvent $event): void
    {
        if (($event->getIdentifier()['test-record-flex-mode'] ?? '') !== 'grid') {
            return;
        }
        $dataStructure = $event->getDataStructure();
        $dataStructure['sheets']['sGrid'] = [
            'ROOT' => [
                'type' => 'array',
                'sheetTitle' => 'Grid',
                'el' => [
                    'settings.columns' => [
                        'label' => 'Columns',
                        'config' => [
                            'type' => 'number',
                        ],
                    ],
                ],
            ],
        ];
        $event->setDataStructure($dataStructure);
    }
}
