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
use TYPO3\CMS\Core\Action\Error\NotFoundError;
use TYPO3\CMS\Core\Action\Error\PermissionDeniedError;
use TYPO3\CMS\Core\Context\Context;
use TYPO3\CMS\Core\Database\ConnectionPool;
use TYPO3\CMS\Core\Localization\LanguageServiceFactory;
use TYPO3\TestingFramework\Core\Functional\FunctionalTestCase;

/**
 * Hotels 1, 2 and the hidden hotel 4 are located on page 1 (mounted for
 * editor and reader), hotel 3 on page 2 (not mounted). Sorted by their
 * sorting field, the hotels on page 1 are 2, 4, 1.
 */
final class FetchRecordsTest extends FunctionalTestCase
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
        $this->importCSVDataSet(__DIR__ . '/Fixtures/hotels_list.csv');
        $connection = $this->get(ConnectionPool::class)->getConnectionForTable('tx_testirreforeignfield_hotel');
        foreach ([1 => 30, 2 => 10, 3 => 5, 4 => 20] as $uid => $sorting) {
            $connection->update('tx_testirreforeignfield_hotel', ['sorting' => $sorting], ['uid' => $uid]);
        }
    }

    #[Test]
    public function adminListsRecordsOfAllPagesIncludingHiddenSortedByPageAndSorting(): void
    {
        self::assertSame(
            ['items' => [
                ['uid' => 2, 'pid' => 1, 'label' => 'Hotel 2', 'type' => null, 'hidden' => false, 'language' => 0],
                ['uid' => 4, 'pid' => 1, 'label' => 'Hotel hidden', 'type' => null, 'hidden' => true, 'language' => 0],
                ['uid' => 1, 'pid' => 1, 'label' => 'Hotel 1', 'type' => null, 'hidden' => false, 'language' => 0],
                ['uid' => 3, 'pid' => 2, 'label' => 'Hotel outside', 'type' => null, 'hidden' => false, 'language' => 0],
            ], 'next' => null],
            $this->invoke(1, ['schema' => 'tx_testirreforeignfield_hotel'])
        );
    }

    #[Test]
    public function editorListsRecordsOfMountedPagesOnly(): void
    {
        self::assertSame(
            ['items' => [
                ['uid' => 2, 'pid' => 1, 'label' => 'Hotel 2', 'type' => null, 'hidden' => null, 'language' => 0],
                ['uid' => 4, 'pid' => 1, 'label' => 'Hotel hidden', 'type' => null, 'hidden' => null, 'language' => 0],
                ['uid' => 1, 'pid' => 1, 'label' => 'Hotel 1', 'type' => null, 'hidden' => null, 'language' => 0],
            ], 'next' => null],
            $this->invoke(3, ['schema' => 'tx_testirreforeignfield_hotel'])
        );
    }

    #[Test]
    public function editorSearchesByLabel(): void
    {
        self::assertSame(
            [2],
            $this->uids($this->invoke(3, ['schema' => 'tx_testirreforeignfield_hotel', 'search' => 'tel 2']))
        );
    }

    #[Test]
    public function readerReceivesNoLabelOfExcludedField(): void
    {
        self::assertSame(
            ['', '', ''],
            array_column($this->invoke(4, ['schema' => 'tx_testirreforeignfield_hotel'])['items'], 'label')
        );
    }

    #[Test]
    public function readerCannotSearchInExcludedField(): void
    {
        self::assertSame(
            [],
            $this->uids($this->invoke(4, ['schema' => 'tx_testirreforeignfield_hotel', 'search' => 'Hotel 2']))
        );
    }

    #[Test]
    public function readerCannotListTableWithoutSelectPermission(): void
    {
        $this->expectException(PermissionDeniedError::class);
        $this->invoke(4, ['schema' => 'tx_testirreforeignfield_offer']);
    }

    #[Test]
    public function listOfUnknownTableIsNotFound(): void
    {
        $this->expectException(NotFoundError::class);
        $this->invoke(1, ['schema' => 'tx_unknown_table']);
    }

    #[Test]
    public function adminListsRecordsOfTableWithoutLanguageField(): void
    {
        self::assertSame(
            ['items' => [['uid' => 1, 'pid' => 0, 'label' => 'hotel editors', 'type' => null, 'hidden' => false, 'language' => null]], 'next' => null],
            $this->invoke(1, ['schema' => 'be_groups', 'search' => 'hotel editors'])
        );
    }

    #[Test]
    public function editorListsMountedPagesOnly(): void
    {
        self::assertSame(
            ['items' => [['uid' => 1, 'pid' => 0, 'label' => 'Root', 'type' => null, 'hidden' => null, 'language' => 0]], 'next' => null],
            $this->invoke(3, ['schema' => 'pages'])
        );
    }

    #[Test]
    public function adminListsAllPages(): void
    {
        self::assertSame(
            ['items' => [
                ['uid' => 1, 'pid' => 0, 'label' => 'Root', 'type' => '1', 'hidden' => false, 'language' => 0],
                ['uid' => 2, 'pid' => 0, 'label' => 'Outside', 'type' => '1', 'hidden' => false, 'language' => 0],
            ], 'next' => null],
            $this->invoke(1, ['schema' => 'pages'])
        );
    }

    #[Test]
    public function adminPaginatesRecords(): void
    {
        $arguments = ['schema' => 'tx_testirreforeignfield_hotel', 'limit' => 2];
        $firstPage = $this->invoke(1, $arguments);
        $secondPage = $this->invoke(1, $arguments + ['cursor' => $firstPage['next']]);

        self::assertSame([2, 4], $this->uids($firstPage));
        self::assertIsString($firstPage['next']);
        self::assertSame([[1, 3], null], [$this->uids($secondPage), $secondPage['next']]);
    }

    #[Test]
    public function editorPaginatesRecordsOfMountedPagesOnly(): void
    {
        $arguments = ['schema' => 'tx_testirreforeignfield_hotel', 'limit' => 2];
        $firstPage = $this->invoke(3, $arguments);
        $secondPage = $this->invoke(3, $arguments + ['cursor' => $firstPage['next']]);

        self::assertSame([2, 4], $this->uids($firstPage));
        self::assertSame([[1], null], [$this->uids($secondPage), $secondPage['next']]);
    }

    #[Test]
    public function invalidCursorIsRejected(): void
    {
        $this->expectException(ActionException::class);
        $this->invoke(1, ['schema' => 'tx_testirreforeignfield_hotel', 'cursor' => 'invalid']);
    }

    #[Test]
    public function limitBelowOneIsRejected(): void
    {
        $this->expectException(ActionException::class);
        $this->invoke(1, ['schema' => 'tx_testirreforeignfield_hotel', 'limit' => 0]);
    }

    #[Test]
    public function limitAboveMaximumIsRejected(): void
    {
        $this->expectException(ActionException::class);
        $this->invoke(1, ['schema' => 'tx_testirreforeignfield_hotel', 'limit' => 201]);
    }

    #[Test]
    public function adminFiltersRecordsByPage(): void
    {
        self::assertSame([3], $this->uids($this->invoke(1, ['schema' => 'tx_testirreforeignfield_hotel', 'pid' => 2])));
    }

    #[Test]
    public function editorReceivesNoRecordsOfPageNotMounted(): void
    {
        self::assertSame([], $this->uids($this->invoke(3, ['schema' => 'tx_testirreforeignfield_hotel', 'pid' => 2])));
    }

    #[Test]
    public function adminFiltersRecordsByType(): void
    {
        self::assertSame(
            [[1, 2], []],
            [
                $this->uids($this->invoke(1, ['schema' => 'pages', 'type' => '1'])),
                $this->uids($this->invoke(1, ['schema' => 'pages', 'type' => '254'])),
            ]
        );
    }

    #[Test]
    public function editorCannotFilterByTypeFieldWithoutPermission(): void
    {
        self::assertSame([], $this->uids($this->invoke(3, ['schema' => 'pages', 'type' => '1'])));
    }

    #[Test]
    public function typeFilterOfTableWithoutTypesIsRejected(): void
    {
        $this->expectException(ActionException::class);
        $this->invoke(1, ['schema' => 'tx_testirreforeignfield_hotel', 'type' => '1']);
    }

    #[Test]
    public function listContainsRecordsOfDefaultAndAllLanguagesByDefault(): void
    {
        $this->importCSVDataSet(__DIR__ . '/Fixtures/hotels_languages.csv');

        self::assertSame(
            [2, 4, 1, 6],
            $this->uids($this->invoke(1, ['schema' => 'tx_testirreforeignfield_hotel', 'pid' => 1]))
        );
    }

    #[Test]
    public function adminListsRecordsOfLanguage(): void
    {
        $this->importCSVDataSet(__DIR__ . '/Fixtures/hotels_languages.csv');

        $result = $this->invoke(1, ['schema' => 'tx_testirreforeignfield_hotel', 'language' => 1]);

        self::assertSame([5, 6], $this->uids($result));
        self::assertSame([1, -1], array_column($result['items'], 'language'));
    }

    #[Test]
    public function editorListsRecordsOfAllowedLanguage(): void
    {
        $this->importCSVDataSet(__DIR__ . '/Fixtures/hotels_languages.csv');

        $result = $this->invoke(7, ['schema' => 'tx_testirreforeignfield_hotel']);

        self::assertSame([2, 4, 1, 6], $this->uids($result));
        self::assertSame([0, 0, 0, -1], array_column($result['items'], 'language'));
    }

    #[Test]
    public function editorCannotListRecordsOfLanguageNotAllowed(): void
    {
        $this->importCSVDataSet(__DIR__ . '/Fixtures/hotels_languages.csv');

        $this->expectException(PermissionDeniedError::class);
        $this->invoke(7, ['schema' => 'tx_testirreforeignfield_hotel', 'language' => 1]);
    }

    #[Test]
    public function languageFilterOfTableWithoutLanguagesIsRejected(): void
    {
        $this->expectException(ActionException::class);
        $this->invoke(1, ['schema' => 'be_groups', 'language' => 1]);
    }

    /**
     * @return list<int>
     */
    private function uids(array $result): array
    {
        return array_column($result['items'], 'uid');
    }

    private function invoke(int $userUid, array $arguments): mixed
    {
        $backendUser = $this->setUpBackendUser($userUid);
        $languageService = $this->get(LanguageServiceFactory::class)->createFromUserPreferences($backendUser);
        $GLOBALS['LANG'] = $languageService;
        return json_decode(json_encode($this->get(ActionInvoker::class)->invoke(
            'records/{schema}:fetch',
            json_decode(json_encode((object)$arguments)),
            new ActionContext($this->get(Context::class), $backendUser, $languageService, null, []),
        )), true);
    }
}
