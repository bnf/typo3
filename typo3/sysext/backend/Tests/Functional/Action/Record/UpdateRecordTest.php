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
use TYPO3\CMS\Core\Localization\LanguageServiceFactory;
use TYPO3\TestingFramework\Core\Functional\FunctionalTestCase;

final class UpdateRecordTest extends FunctionalTestCase
{
    protected array $testExtensionsToLoad = [
        'typo3/sysext/core/Tests/Functional/Fixtures/Extensions/test_irre_foreignfield',
    ];

    private ActionContext $context;

    protected function setUp(): void
    {
        parent::setUp();
        $this->importCSVDataSet(__DIR__ . '/../../../../../core/Tests/Functional/Fixtures/pages.csv');
        $this->importCSVDataSet(__DIR__ . '/../../../../../core/Tests/Functional/Fixtures/be_users_admin.csv');
        $this->importCSVDataSet(__DIR__ . '/Fixtures/tt_content.csv');
        $this->importCSVDataSet(__DIR__ . '/Fixtures/hotels.csv');
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
    public function updatesGivenFieldsOnly(): void
    {
        $result = $this->updateRecord('tt_content', 101, [
            '_schema' => 'tt_content',
            'header' => 'Updated',
        ]);

        $record = json_decode(json_encode($result), true)['record'];
        self::assertSame('Updated', $record['header']);
        self::assertSame('<p>Text</p>', $record['bodytext']);
        $row = $this->fetchRow('tt_content', 101);
        self::assertSame('Updated', $row['header']);
        self::assertSame('<p>Text</p>', $row['bodytext']);
        self::assertSame('text', $row['CType']);
    }

    #[Test]
    public function changesTypeOfContentElement(): void
    {
        $this->updateRecord('tt_content', 102, [
            '_schema' => 'tt_content',
            'CType' => 'text',
            'bodytext' => '<p>Text</p>',
        ]);

        $row = $this->fetchRow('tt_content', 102);
        self::assertSame('text', $row['CType']);
        self::assertSame('<p>Text</p>', $row['bodytext']);
    }

    #[Test]
    public function rejectsFieldNotAvailableForGivenType(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('[/record] Failed to match at least one schema');
        $this->updateRecord('tt_content', 101, [
            '_schema' => 'tt_content',
            'CType' => 'header',
            'bodytext' => '<p>Text</p>',
        ]);
    }

    #[Test]
    public function rejectsFieldNotAvailableForStoredType(): void
    {
        try {
            $this->updateRecord('tt_content', 102, [
                '_schema' => 'tt_content',
                'bodytext' => '<p>Text</p>',
            ]);
            self::fail('Expected update to be rejected');
        } catch (ActionException $e) {
            self::assertSame(1792748107, $e->getCode());
        }
        self::assertSame('', $this->fetchRow('tt_content', 102)['bodytext']);
    }

    #[Test]
    public function rejectsUnknownField(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('[/record] The property unknown is not defined');
        $this->updateRecord('tx_testirreforeignfield_hotel', 1, [
            '_schema' => 'tx_testirreforeignfield_hotel',
            'unknown' => 'value',
        ]);
    }

    #[Test]
    public function rejectsRecordNotMatchingSchemaInPath(): void
    {
        $this->expectException(ActionException::class);
        $this->expectExceptionCode(1792748106);
        $this->updateRecord('tt_content', 101, [
            '_schema' => 'tx_testirreforeignfield_hotel',
            'title' => 'Hotel',
        ]);
    }

    #[Test]
    public function rejectsMissingRecord(): void
    {
        $this->expectException(ActionException::class);
        $this->expectExceptionCode(1791445094);
        $this->updateRecord('tt_content', 99, [
            '_schema' => 'tt_content',
            'header' => 'Updated',
        ]);
    }

    #[Test]
    public function keepsInlineChildrenWhenFieldIsOmitted(): void
    {
        $this->updateRecord('tx_testirreforeignfield_hotel', 1, [
            '_schema' => 'tx_testirreforeignfield_hotel',
            'title' => 'Updated',
        ]);

        self::assertSame(['Offer 1', 'Offer 2'], $this->fetchOfferTitles(1));
    }

    #[Test]
    public function updatesExistingInlineChildren(): void
    {
        $result = $this->updateRecord('tx_testirreforeignfield_hotel', 1, [
            '_schema' => 'tx_testirreforeignfield_hotel',
            'offers' => [
                ['_schema' => 'tx_testirreforeignfield_offer', 'uid' => 1, 'title' => 'Updated'],
                ['_schema' => 'tx_testirreforeignfield_offer', 'uid' => 2],
            ],
        ]);

        $record = json_decode(json_encode($result), true)['record'];
        self::assertSame(['Updated', 'Offer 2'], array_column($record['offers'], 'title'));
        self::assertSame(['Updated', 'Offer 2'], $this->fetchOfferTitles(1));
    }

    #[Test]
    public function updatesNestedInlineChildren(): void
    {
        $this->updateRecord('tx_testirreforeignfield_hotel', 1, [
            '_schema' => 'tx_testirreforeignfield_hotel',
            'offers' => [
                [
                    '_schema' => 'tx_testirreforeignfield_offer',
                    'uid' => 1,
                    'prices' => [
                        ['_schema' => 'tx_testirreforeignfield_price', 'uid' => 1, 'price' => 99],
                    ],
                ],
                ['_schema' => 'tx_testirreforeignfield_offer', 'uid' => 2],
            ],
        ]);

        self::assertSame(99, (int)$this->fetchRow('tx_testirreforeignfield_price', 1)['price']);
    }

    #[Test]
    public function addsNewInlineChildren(): void
    {
        $this->updateRecord('tx_testirreforeignfield_hotel', 1, [
            '_schema' => 'tx_testirreforeignfield_hotel',
            'offers' => [
                ['_schema' => 'tx_testirreforeignfield_offer', 'uid' => 1],
                ['_schema' => 'tx_testirreforeignfield_offer', 'title' => 'New'],
                ['_schema' => 'tx_testirreforeignfield_offer', 'uid' => 2],
            ],
        ]);

        self::assertSame(['Offer 1', 'New', 'Offer 2'], $this->fetchOfferTitles(1));
    }

    #[Test]
    public function reordersInlineChildren(): void
    {
        $this->updateRecord('tx_testirreforeignfield_hotel', 1, [
            '_schema' => 'tx_testirreforeignfield_hotel',
            'offers' => [
                ['_schema' => 'tx_testirreforeignfield_offer', 'uid' => 2],
                ['_schema' => 'tx_testirreforeignfield_offer', 'uid' => 1],
            ],
        ]);

        self::assertSame(['Offer 2', 'Offer 1'], $this->fetchOfferTitles(1));
    }

    #[Test]
    public function deletesOmittedInlineChildren(): void
    {
        $this->updateRecord('tx_testirreforeignfield_hotel', 1, [
            '_schema' => 'tx_testirreforeignfield_hotel',
            'offers' => [
                ['_schema' => 'tx_testirreforeignfield_offer', 'uid' => 2],
            ],
        ]);

        self::assertSame(['Offer 2'], $this->fetchOfferTitles(1));
        self::assertSame(1, (int)$this->fetchRow('tx_testirreforeignfield_offer', 1)['deleted']);
        self::assertSame(1, (int)$this->fetchRow('tx_testirreforeignfield_price', 1)['deleted']);
    }

    #[Test]
    public function deletesAllInlineChildrenForEmptyList(): void
    {
        $this->updateRecord('tx_testirreforeignfield_hotel', 1, [
            '_schema' => 'tx_testirreforeignfield_hotel',
            'offers' => [],
        ]);

        self::assertSame([], $this->fetchOfferTitles(1));
    }

    #[Test]
    public function replacesFileReferences(): void
    {
        $this->importCSVDataSet(__DIR__ . '/../../../../../core/Tests/Functional/Fixtures/sys_file_storage.csv');
        $this->importCSVDataSet(__DIR__ . '/Fixtures/sys_file.csv');
        $this->importCSVDataSet(__DIR__ . '/Fixtures/sys_file_reference.csv');

        $result = $this->updateRecord('tt_content', 103, [
            '_schema' => 'tt_content',
            'assets' => [
                [
                    '_schema' => 'sys_file_reference',
                    'uid_local' => ['_schema' => 'sys_file', 'uid' => 1],
                    'alternative' => 'New',
                ],
            ],
        ]);

        $record = json_decode(json_encode($result), true)['record'];
        self::assertSame(['1:/image.jpg'], array_column($record['assets'], 'identifier'));
        self::assertSame(1, (int)$this->fetchRow('sys_file_reference', 1)['deleted']);
        $references = $this->get(ConnectionPool::class)->getConnectionForTable('sys_file_reference')
            ->select(['alternative'], 'sys_file_reference', ['uid_foreign' => 103, 'deleted' => 0])
            ->fetchFirstColumn();
        self::assertSame(['New'], $references);
    }

    #[Test]
    public function updatesExistingFileReference(): void
    {
        $this->importCSVDataSet(__DIR__ . '/../../../../../core/Tests/Functional/Fixtures/sys_file_storage.csv');
        $this->importCSVDataSet(__DIR__ . '/Fixtures/sys_file.csv');
        $this->importCSVDataSet(__DIR__ . '/Fixtures/sys_file_reference.csv');

        $this->updateRecord('tt_content', 103, [
            '_schema' => 'tt_content',
            'assets' => [
                ['_schema' => 'sys_file_reference', 'uid' => 1, 'alternative' => 'Updated'],
            ],
        ]);

        $reference = $this->fetchRow('sys_file_reference', 1);
        self::assertSame(0, (int)$reference['deleted']);
        self::assertSame('Updated', $reference['alternative']);
    }

    #[Test]
    public function rejectsInlineChildOfOtherParent(): void
    {
        try {
            $this->updateRecord('tx_testirreforeignfield_hotel', 1, [
                '_schema' => 'tx_testirreforeignfield_hotel',
                'offers' => [
                    ['_schema' => 'tx_testirreforeignfield_offer', 'uid' => 3, 'title' => 'Updated'],
                ],
            ]);
            self::fail('Expected update to be rejected');
        } catch (ActionException $e) {
            self::assertSame(1793019563, $e->getCode());
        }
        self::assertSame(['Offer 1', 'Offer 2'], $this->fetchOfferTitles(1));
        self::assertSame(['Offer 3'], $this->fetchOfferTitles(2));
    }

    #[Test]
    public function rejectsNewInlineChildWithUnknownField(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('[/record/offers/0] Failed to match exactly one schema');
        $this->updateRecord('tx_testirreforeignfield_hotel', 1, [
            '_schema' => 'tx_testirreforeignfield_hotel',
            'offers' => [
                ['_schema' => 'tx_testirreforeignfield_offer', 'title' => 'New', 'unknown' => 'value'],
            ],
        ]);
    }

    #[Test]
    public function rejectsUidNotMatchingIdentifier(): void
    {
        $this->expectException(ActionException::class);
        $this->expectExceptionCode(1793020722);
        $this->updateRecord('tx_testirreforeignfield_hotel', 1, [
            '_schema' => 'tx_testirreforeignfield_hotel',
            'uid' => 2,
        ]);
    }

    private function updateRecord(string $schema, int $identifier, array $record): mixed
    {
        return $this->get(ActionInvoker::class)->invoke(
            'records/{schema}/{identifier}:update',
            json_decode(json_encode(['schema' => $schema, 'identifier' => $identifier, 'record' => $record])),
            $this->context,
        );
    }

    private function fetchRow(string $table, int $uid): array
    {
        $queryBuilder = $this->get(ConnectionPool::class)->getQueryBuilderForTable($table);
        $queryBuilder->getRestrictions()->removeAll();
        return $queryBuilder->select('*')
            ->from($table)
            ->where($queryBuilder->expr()->eq('uid', $uid))
            ->executeQuery()
            ->fetchAssociative();
    }

    private function fetchOfferTitles(int $hotelUid): array
    {
        return array_column(
            $this->get(ConnectionPool::class)->getConnectionForTable('tx_testirreforeignfield_offer')->select(
                ['title'],
                'tx_testirreforeignfield_offer',
                ['parentid' => $hotelUid, 'parenttable' => 'tx_testirreforeignfield_hotel', 'deleted' => 0],
                [],
                ['sorting' => 'ASC'],
            )->fetchAllAssociative(),
            'title'
        );
    }
}
