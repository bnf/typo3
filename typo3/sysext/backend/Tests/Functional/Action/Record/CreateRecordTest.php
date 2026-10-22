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

final class CreateRecordTest extends FunctionalTestCase
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
    public function createsRecordWithNestedInlineChildren(): void
    {
        $result = $this->createRecord('tx_testirreforeignfield_hotel', 1, [
            '_schema' => 'tx_testirreforeignfield_hotel',
            'title' => 'Hotel',
            'offers' => [
                [
                    '_schema' => 'tx_testirreforeignfield_offer',
                    'title' => 'Offer A',
                    'prices' => [
                        ['_schema' => 'tx_testirreforeignfield_price', 'title' => 'Price A1', 'price' => 10],
                        ['_schema' => 'tx_testirreforeignfield_price', 'title' => 'Price A2', 'price' => 20],
                    ],
                ],
                [
                    '_schema' => 'tx_testirreforeignfield_offer',
                    'title' => 'Offer B',
                ],
            ],
        ]);

        $record = json_decode(json_encode($result), true)['record'];
        self::assertSame('Hotel', $record['title']);
        self::assertSame(['Offer A', 'Offer B'], array_column($record['offers'], 'title'));
        self::assertSame(['Price A1', 'Price A2'], array_column($record['offers'][0]['prices'], 'title'));

        $offers = $this->fetchRows('tx_testirreforeignfield_offer');
        self::assertCount(2, $offers);
        foreach ($offers as $offer) {
            self::assertSame($record['uid'], (int)$offer['parentid']);
            self::assertSame('tx_testirreforeignfield_hotel', $offer['parenttable']);
            self::assertSame(1, (int)$offer['pid']);
        }
        $prices = $this->fetchRows('tx_testirreforeignfield_price');
        self::assertCount(2, $prices);
        foreach ($prices as $price) {
            self::assertSame($record['offers'][0]['uid'], (int)$price['parentid']);
            self::assertSame('tx_testirreforeignfield_offer', $price['parenttable']);
        }
    }

    #[Test]
    public function createsContentElementOfRequestedType(): void
    {
        $result = $this->createRecord('tt_content', 1, [
            '_schema' => 'tt_content',
            'CType' => 'text',
            'header' => 'Header',
            'bodytext' => '<p>Text</p>',
        ]);

        $record = json_decode(json_encode($result), true)['record'];
        self::assertSame('text', $record['CType']);
        self::assertSame('Header', $record['header']);
        self::assertSame('<p>Text</p>', $record['bodytext']);
        self::assertSame(1, $record['pid']);
    }

    #[Test]
    public function rejectsContentElementFieldNotAvailableForType(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('[/record] The property bodytext is not defined');
        $this->createRecord('tt_content', 1, [
            '_schema' => 'tt_content',
            'CType' => 'header',
            'header' => 'Header',
            'bodytext' => '<p>Text</p>',
        ]);
    }

    #[Test]
    public function rejectsContentElementWithoutType(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('[/record/CType] The property CType is required');
        $this->createRecord('tt_content', 1, [
            '_schema' => 'tt_content',
            'header' => 'Header',
        ]);
    }

    #[Test]
    public function rejectsUnknownField(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('[/record] The property unknown is not defined');
        $this->createRecord('tx_testirreforeignfield_hotel', 1, [
            '_schema' => 'tx_testirreforeignfield_hotel',
            'title' => 'Hotel',
            'unknown' => 'value',
        ]);
    }

    #[Test]
    public function rejectsUnknownFieldInNestedChild(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('[/record/offers/0] The property unknown is not defined');
        $this->createRecord('tx_testirreforeignfield_hotel', 1, [
            '_schema' => 'tx_testirreforeignfield_hotel',
            'title' => 'Hotel',
            'offers' => [
                ['_schema' => 'tx_testirreforeignfield_offer', 'title' => 'Offer', 'unknown' => 'value'],
            ],
        ]);
    }

    #[Test]
    public function rejectsChildOfForeignSchema(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('[/record/offers/0/_schema] Does not have a value equal to tx_testirreforeignfield_offer');
        $this->createRecord('tx_testirreforeignfield_hotel', 1, [
            '_schema' => 'tx_testirreforeignfield_hotel',
            'title' => 'Hotel',
            'offers' => [
                ['_schema' => 'tx_testirreforeignfield_price', 'title' => 'Price'],
            ],
        ]);
    }

    #[Test]
    public function rejectsParentIdentifierFields(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('[/record/offers/0] The property parentid is not defined');
        $this->createRecord('tx_testirreforeignfield_hotel', 1, [
            '_schema' => 'tx_testirreforeignfield_hotel',
            'title' => 'Hotel',
            'offers' => [
                ['_schema' => 'tx_testirreforeignfield_offer', 'title' => 'Offer', 'parentid' => 42],
            ],
        ]);
    }

    #[Test]
    public function reportsValidationErrorsOfDiscriminatedSchemaOnly(): void
    {
        try {
            $this->createRecord('tx_testirreforeignfield_hotel', 1, [
                '_schema' => 'tx_testirreforeignfield_hotel',
                'title' => 'Hotel',
                'unknown' => 'value',
            ]);
            self::fail('Expected validation to fail');
        } catch (\InvalidArgumentException $e) {
            self::assertSame(
                'schema validation error: [/record] The property unknown is not defined and the definition does not allow additional properties',
                $e->getMessage()
            );
        }
    }

    #[Test]
    public function rejectsUnknownSchema(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('[/record/_schema] Does not have a value in the enumeration');
        $this->createRecord('tx_unknown', 1, [
            '_schema' => 'tx_unknown',
            'title' => 'Unknown',
        ]);
    }

    #[Test]
    public function rejectsRecordNotMatchingSchemaInPath(): void
    {
        $this->expectException(ActionException::class);
        $this->createRecord('tx_testirreforeignfield_offer', 1, [
            '_schema' => 'tx_testirreforeignfield_hotel',
            'title' => 'Hotel',
        ]);
    }

    private function createRecord(string $schema, int $pid, array $record): mixed
    {
        return $this->get(ActionInvoker::class)->invoke(
            'records/{schema}/{pid}:create',
            json_decode(json_encode(['schema' => $schema, 'pid' => $pid, 'record' => $record])),
            $this->context,
        );
    }

    private function fetchRows(string $table): array
    {
        return $this->get(ConnectionPool::class)->getConnectionForTable($table)
            ->select(['*'], $table, ['deleted' => 0], [], ['uid' => 'ASC'])
            ->fetchAllAssociative();
    }
}
