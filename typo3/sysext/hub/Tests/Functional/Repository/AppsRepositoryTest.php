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

namespace TYPO3\CMS\Hub\Tests\Functional\Repository;

use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\Attributes\Test;
use TYPO3\CMS\Hub\Repository\AppDemand;
use TYPO3\CMS\Hub\Repository\AppRepository;
use TYPO3\TestingFramework\Core\Functional\FunctionalTestCase;

final class HubRepositoryTest extends FunctionalTestCase
{
    protected array $coreExtensionsToLoad = ['hub'];

    public static function demandProvider(): array
    {
        return [
            'default demand' => [
                new AppDemand(1, '', '', '', ''),
                4,
            ],
            'filter by name: Test' => [
                new AppDemand(1, '', '', 'Test', ''),
                2,
            ],
            'filter by name: Random' => [
                new AppDemand(1, '', '', 'Random', ''),
                1,
            ],
            'filter by name: INVALID' => [
                new AppDemand(1, '', '', 'INVALID', ''),
                2,
            ],
            'filter by app type: CreateRecordApp' => [
                new AppDemand(1, '', '', '', 'create-record'),
                1,
            ],
            'filter by name and app type: CreateRecordApp' => [
                new AppDemand(1, '', '', 'Test', 'create-record'),
                1,
            ],
        ];
    }

    #[DataProvider('demandProvider')]
    #[Test]
    public function findByDemandWorks(AppDemand $demand, int $resultCount): void
    {
        $this->importCSVDataSet(__DIR__ . '/../Fixtures/HubRepositoryTest_hub.csv');
        $results = (new AppRepository())->findByDemand($demand);
        self::assertCount($resultCount, $results);
    }

    #[Test]
    public function findAllWorks(): void
    {
        $this->importCSVDataSet(__DIR__ . '/../Fixtures/HubRepositoryTest_hub.csv');
        $results = (new AppRepository())->findAll();
        self::assertCount(4, $results);
    }

    #[Test]
    public function getAppRecordsWithoutDemand(): void
    {
        $this->importCSVDataSet(__DIR__ . '/../Fixtures/HubRepositoryTest_hub.csv');
        $hub = (new AppRepository())->getAppRecords();
        self::assertCount(4, $hub);
    }
}
