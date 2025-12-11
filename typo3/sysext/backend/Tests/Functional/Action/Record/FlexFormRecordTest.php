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

namespace TYPO3\CMS\Backend\Tests\Functional\Action\Record;

use PHPUnit\Framework\Attributes\Test;
use TYPO3\CMS\Core\Action\ActionContext;
use TYPO3\CMS\Core\Action\ActionException;
use TYPO3\CMS\Core\Action\ActionInvoker;
use TYPO3\CMS\Core\Context\Context;
use TYPO3\CMS\Core\Database\ConnectionPool;
use TYPO3\CMS\Core\DataHandling\DataHandler;
use TYPO3\CMS\Core\Localization\LanguageServiceFactory;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\TestingFramework\Core\Functional\FunctionalTestCase;

final class FlexFormRecordTest extends FunctionalTestCase
{
    protected array $testExtensionsToLoad = [
        'typo3/sysext/backend/Tests/Functional/Action/Record/Fixtures/Extensions/test_record_flex',
    ];

    private ActionContext $context;

    protected function setUp(): void
    {
        parent::setUp();
        $this->importCSVDataSet(__DIR__ . '/../../../../../core/Tests/Functional/Fixtures/pages.csv');
        $this->importCSVDataSet(__DIR__ . '/../../../../../core/Tests/Functional/Fixtures/be_users_admin.csv');
        $backendUser = $this->setUpBackendUser(1);
        $languageService = $this->get(LanguageServiceFactory::class)->createFromUserPreferences($backendUser);
        $GLOBALS['LANG'] = $languageService;
        $this->context = new ActionContext(
            $this->get(Context::class),
            $backendUser,
            $languageService,
            null,
            [],
        );
    }

    #[Test]
    public function flexFormValuesAreWrittenAndReadBySheetAndFieldName(): void
    {
        $record = $this->createRecord([
            'record_type' => 'default',
            'title' => 'Record',
            'settings' => [
                'sDEF/settings.title' => 'Title',
                'sDEF/settings.limit' => 5,
                'sDEF/settings.enabled' => 1,
                'sDEF/settings.mode' => 'grid',
                'sItems/settings.items' => [
                    ['link' => ['title' => 'Home', 'url' => 't3://page?uid=1']],
                    ['divider' => ['label' => 'More']],
                ],
            ],
        ]);

        self::assertSame([
            'sDEF/settings.title' => 'Title',
            'sDEF/settings.limit' => 5,
            'sDEF/settings.enabled' => 1,
            'sDEF/settings.mode' => 'grid',
            'sItems/settings.items' => [
                // Links are read as parts, like link fields of records
                ['link' => ['title' => 'Home', 'url' => ['url' => 't3://page?uid=1', 'target' => '', 'class' => '', 'title' => '', 'additionalParams' => '']]],
                ['divider' => ['label' => 'More']],
            ],
        ], $record['settings']);

        $stored = GeneralUtility::xml2array($this->fetchRow($record['uid'])['settings']);
        self::assertSame('5', $stored['data']['sDEF']['lDEF']['settings.limit']['vDEF']);
        self::assertSame(
            [['link' => ['el' => ['title' => ['vDEF' => 'Home'], 'url' => ['vDEF' => 't3://page?uid=1']]]], ['divider' => ['el' => ['label' => ['vDEF' => 'More']]]]],
            array_values($stored['data']['sItems']['lDEF']['settings.items']['el'])
        );
    }

    #[Test]
    public function relationsInFlexFormsAreReadAsReferences(): void
    {
        $dataHandler = $this->get(DataHandler::class);
        $dataHandler->start([
            'tx_testrecordflex' => [
                'NEW1' => [
                    'pid' => 1,
                    'record_type' => 'default',
                    'title' => 'Record',
                    'settings' => ['data' => ['sDEF' => ['lDEF' => ['settings.pages' => ['vDEF' => '1']]]]],
                ],
            ],
        ], []);
        $dataHandler->process_datamap();

        $record = $this->fetchRecord($dataHandler->substNEWwithIDs['NEW1']);

        self::assertSame([['_schema' => 'pages', 'uid' => 1]], $record['settings']['sDEF/settings.pages']);
    }

    #[Test]
    public function patchKeepsOmittedFlexFormValuesAndReplacesSections(): void
    {
        $record = $this->createRecord([
            'record_type' => 'default',
            'title' => 'Record',
            'settings' => [
                'sDEF/settings.title' => 'Title',
                'sItems/settings.items' => [
                    ['link' => ['title' => 'Home', 'url' => 't3://page?uid=1']],
                    ['link' => ['title' => 'Other', 'url' => 't3://page?uid=2']],
                ],
            ],
        ]);

        $updated = $this->updateRecord($record['uid'], [
            'settings' => [
                'sDEF/settings.limit' => 10,
                'sItems/settings.items' => [
                    ['divider' => ['label' => 'More']],
                ],
            ],
        ]);

        self::assertSame('Title', $updated['settings']['sDEF/settings.title']);
        self::assertSame(10, $updated['settings']['sDEF/settings.limit']);
        self::assertSame([['divider' => ['label' => 'More']]], $updated['settings']['sItems/settings.items']);
    }

    #[Test]
    public function unknownFlexFormFieldIsRejected(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('settings.unknown');
        $this->createRecord([
            'record_type' => 'default',
            'title' => 'Record',
            'settings' => ['sDEF/settings.unknown' => 'value'],
        ]);
    }

    #[Test]
    public function relationInFlexFormCanNotBeWritten(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('settings.pages');
        $this->createRecord([
            'record_type' => 'default',
            'title' => 'Record',
            'settings' => ['sDEF/settings.pages' => [['_schema' => 'pages', 'uid' => 1]]],
        ]);
    }

    #[Test]
    public function dataStructureOfRecordTypeIsUsed(): void
    {
        $record = $this->createRecord([
            'record_type' => 'special',
            'title' => 'Record',
            'settings' => ['sDEF/settings.special' => 'Special'],
        ]);

        self::assertSame(['sDEF/settings.special' => 'Special'], $record['settings']);

        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('settings.title');
        $this->createRecord([
            'record_type' => 'special',
            'title' => 'Record',
            'settings' => ['sDEF/settings.title' => 'Title'],
        ]);
    }

    #[Test]
    public function sheetDependingOnStoredValueIsRead(): void
    {
        $dataHandler = $this->get(DataHandler::class);
        $dataHandler->start([
            'tx_testrecordflex' => [
                'NEW1' => [
                    'pid' => 1,
                    'record_type' => 'dynamic',
                    'title' => 'Record',
                    'settings' => ['data' => [
                        'sDEF' => ['lDEF' => ['settings.mode' => ['vDEF' => 'grid']]],
                        'sGrid' => ['lDEF' => ['settings.columns' => ['vDEF' => '3']]],
                    ]],
                ],
            ],
        ], []);
        $dataHandler->process_datamap();

        $record = $this->fetchRecord($dataHandler->substNEWwithIDs['NEW1']);

        self::assertSame('grid', $record['settings']['sDEF/settings.mode']);
        self::assertSame(3, $record['settings']['sGrid/settings.columns']);
    }

    #[Test]
    public function sheetDependingOnStoredValueIsWrittenByPatch(): void
    {
        $record = $this->createRecord([
            'record_type' => 'dynamic',
            'title' => 'Record',
            'settings' => ['sDEF/settings.mode' => 'grid'],
        ]);

        $updated = $this->updateRecord($record['uid'], [
            'settings' => ['sGrid/settings.columns' => 4],
        ]);

        self::assertSame(4, $updated['settings']['sGrid/settings.columns']);
    }

    #[Test]
    public function fieldNotInDataStructureOfStoredValueIsRejected(): void
    {
        $record = $this->createRecord([
            'record_type' => 'dynamic',
            'title' => 'Record',
            'settings' => ['sDEF/settings.mode' => 'list'],
        ]);

        $this->expectException(ActionException::class);
        $this->expectExceptionMessage('sGrid/settings.columns');
        $this->updateRecord($record['uid'], [
            'settings' => ['sGrid/settings.columns' => 4],
        ]);
    }

    private function createRecord(array $fields): array
    {
        $result = $this->get(ActionInvoker::class)->invoke(
            'create_records_by_schema_by_pid',
            json_decode(json_encode(['schema' => 'tx_testrecordflex', 'pid' => 1, 'record' => ['_schema' => 'tx_testrecordflex', ...$fields]])),
            $this->context,
        );
        return json_decode(json_encode($result), true)['record'];
    }

    private function updateRecord(int $uid, array $fields): array
    {
        $result = $this->get(ActionInvoker::class)->invoke(
            'update_records_by_schema_by_identifier',
            json_decode(json_encode(['schema' => 'tx_testrecordflex', 'identifier' => $uid, 'record' => ['_schema' => 'tx_testrecordflex', ...$fields]])),
            $this->context,
        );
        return json_decode(json_encode($result), true)['record'];
    }

    private function fetchRecord(int $uid): array
    {
        $result = $this->get(ActionInvoker::class)->invoke(
            'fetch_records_by_schema_by_identifier',
            json_decode(json_encode(['schema' => 'tx_testrecordflex', 'identifier' => $uid])),
            $this->context,
        );
        return json_decode(json_encode($result), true)['record'];
    }

    private function fetchRow(int $uid): array
    {
        return $this->get(ConnectionPool::class)->getConnectionForTable('tx_testrecordflex')
            ->select(['*'], 'tx_testrecordflex', ['uid' => $uid])
            ->fetchAssociative();
    }
}
