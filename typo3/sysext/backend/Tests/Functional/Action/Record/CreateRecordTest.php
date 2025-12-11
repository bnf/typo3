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
use TYPO3\CMS\Core\Context\Context;
use TYPO3\CMS\Core\Core\Environment;
use TYPO3\CMS\Core\Database\ConnectionPool;
use TYPO3\CMS\Core\Localization\LanguageServiceFactory;
use TYPO3\CMS\Core\Utility\GeneralUtility;
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
    public function createsTextmediaContentElementWithImage(): void
    {
        $this->importCSVDataSet(__DIR__ . '/../../../../../core/Tests/Functional/Fixtures/sys_file_storage.csv');
        $this->importCSVDataSet(__DIR__ . '/Fixtures/sys_file.csv');

        $result = $this->createRecord('tt_content', 1, [
            '_schema' => 'tt_content',
            'CType' => 'textmedia',
            'header' => 'Header',
            'assets' => [
                [
                    '_schema' => 'sys_file_reference',
                    'uid_local' => ['_schema' => 'sys_file', 'uid' => 1],
                    'alternative' => 'Alternative',
                ],
            ],
        ]);

        $record = json_decode(json_encode($result), true)['record'];
        self::assertSame('textmedia', $record['CType']);
        self::assertSame(['1:/image.jpg'], array_column($record['assets'], 'identifier'));

        $references = $this->fetchRows('sys_file_reference');
        self::assertCount(1, $references);
        self::assertSame(1, (int)$references[0]['uid_local']);
        self::assertSame($record['uid'], (int)$references[0]['uid_foreign']);
        self::assertSame('tt_content', $references[0]['tablenames']);
        self::assertSame('assets', $references[0]['fieldname']);
        self::assertSame('Alternative', $references[0]['alternative']);
    }

    #[Test]
    public function createsFileReferenceFromFalIdentifier(): void
    {
        $this->importCSVDataSet(__DIR__ . '/../../../../../core/Tests/Functional/Fixtures/sys_file_storage.csv');
        GeneralUtility::mkdir_deep(Environment::getPublicPath() . '/fileadmin/images');
        file_put_contents(Environment::getPublicPath() . '/fileadmin/images/fal.jpg', 'image');

        $result = $this->createRecord('tt_content', 1, [
            '_schema' => 'tt_content',
            'CType' => 'textmedia',
            'header' => 'Header',
            'assets' => [
                [
                    '_schema' => 'sys_file_reference',
                    'uid_local' => ['_schema' => 'sys_file', 'identifier' => '1:/images/fal.jpg'],
                ],
            ],
        ]);

        $record = json_decode(json_encode($result), true)['record'];
        self::assertSame(['1:/images/fal.jpg'], array_column($record['assets'], 'identifier'));

        $files = $this->fetchRows('sys_file', []);
        self::assertCount(1, $files);
        self::assertSame('/images/fal.jpg', $files[0]['identifier']);
        $references = $this->fetchRows('sys_file_reference');
        self::assertCount(1, $references);
        self::assertSame((int)$files[0]['uid'], (int)$references[0]['uid_local']);
    }

    #[Test]
    public function rejectsFileReferenceToMissingFalIdentifier(): void
    {
        $this->importCSVDataSet(__DIR__ . '/../../../../../core/Tests/Functional/Fixtures/sys_file_storage.csv');

        $this->expectException(NotFoundError::class);
        $this->expectExceptionMessage('File "1:/images/missing.jpg" not found');
        $this->createRecord('tt_content', 1, [
            '_schema' => 'tt_content',
            'CType' => 'textmedia',
            'header' => 'Header',
            'assets' => [
                [
                    '_schema' => 'sys_file_reference',
                    'uid_local' => ['_schema' => 'sys_file', 'identifier' => '1:/images/missing.jpg'],
                ],
            ],
        ]);
    }

    #[Test]
    public function rejectsFileReferenceWithUidAndFalIdentifier(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('[/record/assets/0/uid_local] Failed to match exactly one schema');
        $this->createRecord('tt_content', 1, [
            '_schema' => 'tt_content',
            'CType' => 'textmedia',
            'header' => 'Header',
            'assets' => [
                [
                    '_schema' => 'sys_file_reference',
                    'uid_local' => ['_schema' => 'sys_file', 'uid' => 1, 'identifier' => '1:/images/fal.jpg'],
                ],
            ],
        ]);
    }

    #[Test]
    public function rejectsFileReferenceToOtherThanFile(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('[/record/assets/0/uid_local/_schema] Does not have a value equal to sys_file');
        $this->createRecord('tt_content', 1, [
            '_schema' => 'tt_content',
            'CType' => 'textmedia',
            'header' => 'Header',
            'assets' => [
                [
                    '_schema' => 'sys_file_reference',
                    'uid_local' => ['_schema' => 'pages', 'uid' => 1],
                ],
            ],
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

    private function fetchRows(string $table, array $criteria = ['deleted' => 0]): array
    {
        return $this->get(ConnectionPool::class)->getConnectionForTable($table)
            ->select(['*'], $table, $criteria, [], ['uid' => 'ASC'])
            ->fetchAllAssociative();
    }
}
