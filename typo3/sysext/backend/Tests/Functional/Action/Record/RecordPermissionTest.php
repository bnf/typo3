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
use TYPO3\CMS\Core\Action\ActionInvoker;
use TYPO3\CMS\Core\Action\Error\PermissionDeniedError;
use TYPO3\CMS\Core\Context\Context;
use TYPO3\CMS\Core\Database\ConnectionPool;
use TYPO3\CMS\Core\Localization\LanguageServiceFactory;
use TYPO3\TestingFramework\Core\Functional\FunctionalTestCase;

/**
 * Record schemas are static, they offer all tables and fields.
 * Permissions of the user are applied when records are written or read.
 *
 * - editor (uid 3): may modify hotels and offers, and their fields
 *   `hotel.title`, `hotel.offers` and `offer.title`, but not `offer.prices`
 * - reader (uid 4): may only select hotels, no excluded fields
 * - hotel reader (uid 6): may select hotels with `title` and `offers`, but no offers
 */
final class RecordPermissionTest extends FunctionalTestCase
{
    protected array $testExtensionsToLoad = [
        'typo3/sysext/core/Tests/Functional/Fixtures/Extensions/test_irre_foreignfield',
    ];

    protected function setUp(): void
    {
        parent::setUp();
        $this->importCSVDataSet(__DIR__ . '/Fixtures/pages_editable.csv');
        $this->importCSVDataSet(__DIR__ . '/../../../../../core/Tests/Functional/Fixtures/be_users_admin.csv');
        $this->importCSVDataSet(__DIR__ . '/Fixtures/be_users_editor.csv');
        $this->importCSVDataSet(__DIR__ . '/Fixtures/hotels.csv');
    }

    #[Test]
    public function editorCreatesRecordWithPermittedFields(): void
    {
        $result = $this->invoke(3, 'records/{schema}/{pid}:create', [
            'schema' => 'tx_testirreforeignfield_hotel',
            'pid' => 1,
            'record' => [
                '_schema' => 'tx_testirreforeignfield_hotel',
                'title' => 'Hotel',
                'offers' => [
                    ['_schema' => 'tx_testirreforeignfield_offer', 'title' => 'Offer'],
                ],
            ],
        ]);

        $record = json_decode(json_encode($result), true)['record'];
        self::assertSame('Hotel', $record['title']);
        self::assertSame(['Offer'], array_column($record['offers'], 'title'));
    }

    #[Test]
    public function editorCannotCreateRecordInTableWithoutModifyPermission(): void
    {
        $this->expectException(PermissionDeniedError::class);
        $this->invoke(3, 'records/{schema}/{pid}:create', [
            'schema' => 'tx_testirreforeignfield_price',
            'pid' => 1,
            'record' => ['_schema' => 'tx_testirreforeignfield_price', 'title' => 'Price'],
        ]);
    }

    #[Test]
    public function editorCannotCreateChildInTableWithoutModifyPermission(): void
    {
        try {
            $this->invoke(3, 'records/{schema}/{pid}:create', [
                'schema' => 'tx_testirreforeignfield_offer',
                'pid' => 1,
                'record' => [
                    '_schema' => 'tx_testirreforeignfield_offer',
                    'title' => 'Offer',
                    'prices' => [
                        ['_schema' => 'tx_testirreforeignfield_price', 'title' => 'Price'],
                    ],
                ],
            ]);
            self::fail('Expected creation to be rejected');
        } catch (PermissionDeniedError) {
        }
        self::assertSame(3, $this->countRows('tx_testirreforeignfield_offer'));
        self::assertSame(1, $this->countRows('tx_testirreforeignfield_price'));
    }

    #[Test]
    public function editorCannotCreateRecordWithExcludedField(): void
    {
        try {
            $this->invoke(3, 'records/{schema}/{pid}:create', [
                'schema' => 'tx_testirreforeignfield_offer',
                'pid' => 1,
                'record' => [
                    '_schema' => 'tx_testirreforeignfield_offer',
                    'title' => 'Offer',
                    'prices' => [],
                ],
            ]);
            self::fail('Expected creation to be rejected');
        } catch (PermissionDeniedError $e) {
            self::assertStringContainsString('tx_testirreforeignfield_offer.prices', $e->getMessage());
        }
        self::assertSame(3, $this->countRows('tx_testirreforeignfield_offer'));
    }

    #[Test]
    public function readerCannotCreateRecord(): void
    {
        $this->expectException(PermissionDeniedError::class);
        $this->invoke(4, 'records/{schema}/{pid}:create', [
            'schema' => 'tx_testirreforeignfield_hotel',
            'pid' => 1,
            'record' => ['_schema' => 'tx_testirreforeignfield_hotel', 'title' => 'Hotel'],
        ]);
    }

    #[Test]
    public function editorUpdatesPermittedField(): void
    {
        $this->invoke(3, 'records/{schema}/{identifier}:update', [
            'schema' => 'tx_testirreforeignfield_offer',
            'identifier' => 1,
            'record' => ['_schema' => 'tx_testirreforeignfield_offer', 'title' => 'Updated'],
        ]);

        self::assertSame('Updated', $this->fetchRow('tx_testirreforeignfield_offer', 1)['title']);
    }

    #[Test]
    public function editorCannotUpdateExcludedField(): void
    {
        try {
            $this->invoke(3, 'records/{schema}/{identifier}:update', [
                'schema' => 'tx_testirreforeignfield_offer',
                'identifier' => 1,
                'record' => [
                    '_schema' => 'tx_testirreforeignfield_offer',
                    'title' => 'Updated',
                    'prices' => [],
                ],
            ]);
            self::fail('Expected update to be rejected');
        } catch (PermissionDeniedError $e) {
            self::assertStringContainsString('tx_testirreforeignfield_offer.prices', $e->getMessage());
        }
        self::assertSame('Offer 1', $this->fetchRow('tx_testirreforeignfield_offer', 1)['title']);
        self::assertSame(0, (int)$this->fetchRow('tx_testirreforeignfield_price', 1)['deleted']);
    }

    #[Test]
    public function editorCannotDeleteChildrenOfHotelWithoutModifyPermission(): void
    {
        $this->importCSVDataSet(__DIR__ . '/Fixtures/be_users_editor_offers_readonly.csv');
        try {
            $this->invoke(5, 'records/{schema}/{identifier}:update', [
                'schema' => 'tx_testirreforeignfield_hotel',
                'identifier' => 1,
                'record' => ['_schema' => 'tx_testirreforeignfield_hotel', 'offers' => []],
            ]);
            self::fail('Expected update to be rejected');
        } catch (PermissionDeniedError) {
        }
        self::assertSame(0, (int)$this->fetchRow('tx_testirreforeignfield_offer', 1)['deleted']);
    }

    #[Test]
    public function readerCannotUpdateRecord(): void
    {
        try {
            $this->invoke(4, 'records/{schema}/{identifier}:update', [
                'schema' => 'tx_testirreforeignfield_hotel',
                'identifier' => 1,
                'record' => ['_schema' => 'tx_testirreforeignfield_hotel', 'title' => 'Updated'],
            ]);
            self::fail('Expected update to be rejected');
        } catch (PermissionDeniedError) {
        }
        self::assertSame('Hotel 1', $this->fetchRow('tx_testirreforeignfield_hotel', 1)['title']);
    }

    #[Test]
    public function readerCannotDeleteRecordOfTableWithoutSelectPermission(): void
    {
        try {
            $this->invoke(4, 'records/{schema}/{identifier}:delete', [
                'schema' => 'tx_testirreforeignfield_offer',
                'identifier' => 1,
            ]);
            self::fail('Expected delete to be rejected');
        } catch (PermissionDeniedError) {
        }
        self::assertSame(0, $this->fetchRow('tx_testirreforeignfield_offer', 1)['deleted']);
    }

    #[Test]
    public function editorReadsPermittedFieldsOnly(): void
    {
        $result = $this->invoke(3, 'records/{schema}/{identifier}:fetch', [
            'schema' => 'tx_testirreforeignfield_hotel',
            'identifier' => 1,
        ]);

        $record = json_decode(json_encode($result), true)['record'];
        self::assertSame('Hotel 1', $record['title']);
        self::assertSame(['Offer 1', 'Offer 2'], array_column($record['offers'], 'title'));
        self::assertArrayNotHasKey('prices', $record['offers'][0]);
    }

    #[Test]
    public function readerReadsRecordWithoutExcludedFields(): void
    {
        $result = $this->invoke(4, 'records/{schema}/{identifier}:fetch', [
            'schema' => 'tx_testirreforeignfield_hotel',
            'identifier' => 1,
        ]);

        $record = json_decode(json_encode($result), true)['record'];
        self::assertSame(1, $record['uid']);
        self::assertArrayNotHasKey('title', $record);
        self::assertArrayNotHasKey('offers', $record);
    }

    #[Test]
    public function readerDoesNotReceiveChildrenOfTableWithoutSelectPermission(): void
    {
        $result = $this->invoke(6, 'records/{schema}/{identifier}:fetch', [
            'schema' => 'tx_testirreforeignfield_hotel',
            'identifier' => 1,
        ]);

        $record = json_decode(json_encode($result), true)['record'];
        self::assertSame('Hotel 1', $record['title']);
        self::assertArrayNotHasKey('offers', $record);
    }

    #[Test]
    public function readerCannotReadTableWithoutSelectPermission(): void
    {
        $this->expectException(PermissionDeniedError::class);
        $this->invoke(4, 'records/{schema}/{identifier}:fetch', [
            'schema' => 'tx_testirreforeignfield_offer',
            'identifier' => 1,
        ]);
    }

    #[Test]
    public function editorReceivesUpdatedRecordWithPermittedFieldsOnly(): void
    {
        $result = $this->invoke(3, 'records/{schema}/{identifier}:update', [
            'schema' => 'tx_testirreforeignfield_offer',
            'identifier' => 1,
            'record' => ['_schema' => 'tx_testirreforeignfield_offer', 'title' => 'Updated'],
        ]);

        $record = json_decode(json_encode($result), true)['record'];
        self::assertSame('Updated', $record['title']);
        self::assertArrayNotHasKey('prices', $record);
    }

    private function invoke(int $userUid, string $action, array $arguments): mixed
    {
        $backendUser = $this->setUpBackendUser($userUid);
        $languageService = $this->get(LanguageServiceFactory::class)->createFromUserPreferences($backendUser);
        $GLOBALS['LANG'] = $languageService;
        return $this->get(ActionInvoker::class)->invoke(
            $action,
            json_decode(json_encode($arguments)),
            new ActionContext($this->get(Context::class), $backendUser, $languageService, null, []),
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

    private function countRows(string $table): int
    {
        return $this->get(ConnectionPool::class)->getConnectionForTable($table)->count('*', $table, ['deleted' => 0]);
    }
}
