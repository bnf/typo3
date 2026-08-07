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

namespace TYPO3\CMS\Extbase\Tests\Functional\Persistence;

use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\Attributes\Test;
use TYPO3\CMS\Core\Core\SystemEnvironmentBuilder;
use TYPO3\CMS\Core\Database\ConnectionPool;
use TYPO3\CMS\Core\Http\ServerRequest;
use TYPO3\CMS\Extbase\Configuration\ConfigurationManagerInterface;
use TYPO3\CMS\Extbase\Persistence\Generic\PersistenceManager;
use TYPO3\CMS\Extbase\Persistence\Generic\Qom\ConstraintInterface;
use TYPO3\CMS\Extbase\Persistence\Generic\Qom\QueryObjectModelFactory;
use TYPO3\CMS\Extbase\Persistence\QueryInterface;
use TYPO3\TestingFramework\Core\Functional\Framework\DataHandling\ActionService;
use TYPO3Tests\BlogExample\Domain\Model\DateTimeStorage;
use TYPO3Tests\BlogExample\Domain\Repository\DateTimeStorageRepository;

/**
 * A type=datetime column that is not nullable stores an empty value instead of SQL NULL. Extbase
 * and DataHandler have to write the same value for it, and a query for null has to find it.
 *
 * The using class provides the variants as storageVariantDataProvider(): property, column and
 * the value stored for an empty date.
 */
trait DateTimeStorageTestTrait
{
    private const TABLE = 'tx_blogexample_domain_model_datetimestorage';

    /**
     * Native columns declared nullable=false have no column default, so every insert has to set
     * them. They hold a date wherever they are not under test.
     */
    private const NATIVE_NOT_NULL_COLUMNS = [
        'dateNotNull' => 'date_not_null',
        'datetimeNotNull' => 'datetime_not_null',
        'timeNotNull' => 'time_not_null',
    ];

    protected function setUp(): void
    {
        parent::setUp();
        $this->importCSVDataSet(__DIR__ . '/Fixtures/DateTimeStorageImport.csv');
        $this->importCSVDataSet(__DIR__ . '/../Property/Fixtures/DatabaseImports/be_users.csv');
        $this->setUpBackendUser(1);
        $request = new ServerRequest()->withAttribute('applicationType', SystemEnvironmentBuilder::REQUESTTYPE_BE);
        $this->get(ConfigurationManagerInterface::class)->setRequest($request);
    }

    /**
     * @return array<string, array{0: string}>
     */
    public static function propertyDataProvider(): array
    {
        return array_map(static fn(array $variant): array => [$variant[0]], self::storageVariantDataProvider());
    }

    /**
     * Row 1 has every date under test empty, row 2 has every date set.
     */
    private function persistViaExtbase(): void
    {
        $persistenceManager = $this->get(PersistenceManager::class);
        $empty = new DateTimeStorage();
        $filled = new DateTimeStorage();
        foreach (array_keys(self::NATIVE_NOT_NULL_COLUMNS) as $property) {
            $empty->{'set' . ucfirst($property)}(new \DateTime('2025-01-20T14:18:56'));
            $filled->{'set' . ucfirst($property)}(new \DateTime('2025-01-20T14:18:56'));
        }
        foreach (self::storageVariantDataProvider() as [$property]) {
            $empty->{'set' . ucfirst($property)}(null);
            $filled->{'set' . ucfirst($property)}(new \DateTime('2025-01-20T14:18:56'));
        }
        $persistenceManager->add($empty);
        $persistenceManager->add($filled);
        $persistenceManager->persistAll();
        $persistenceManager->clearState();
    }

    /**
     * Row 1 has every date under test cleared as FormEngine submits it, row 2 has every date set.
     */
    private function persistViaDataHandler(): void
    {
        $empty = [];
        $filled = [];
        foreach (self::NATIVE_NOT_NULL_COLUMNS as $column) {
            $empty[$column] = $filled[$column] = $this->dataHandlerValue($column);
        }
        foreach (self::storageVariantDataProvider() as [, $column]) {
            $empty[$column] = '';
            $filled[$column] = $this->dataHandlerValue($column);
        }
        $actionService = new ActionService();
        $actionService->createNewRecord(self::TABLE, 1, $empty);
        $actionService->createNewRecord(self::TABLE, 1, $filled);
        self::assertSame([], $actionService->getDataHandler()->errorLog);
    }

    /**
     * Writes rows past Extbase and DataHandler, the way data that predates them may look: one row
     * per value, from uid 1 on.
     *
     * @param list<int|string|null> $values
     */
    private function insertRows(string $column, array $values): void
    {
        $connection = $this->get(ConnectionPool::class)->getConnectionForTable(self::TABLE);
        foreach ($values as $index => $value) {
            $row = ['uid' => $index + 1, 'pid' => 1, $column => $value];
            foreach (self::NATIVE_NOT_NULL_COLUMNS as $notNullColumn) {
                $row[$notNullColumn] ??= str_starts_with($notNullColumn, 'time_') ? '14:18:00' : '2025-01-20';
            }
            $connection->insert(self::TABLE, $row);
        }
    }

    /**
     * @param int[] $nullUids The rows whose property is mapped to null
     * @param int[] $otherUids The rows holding a date
     */
    private function assertNullMatches(string $property, array $nullUids, array $otherUids): void
    {
        $repository = $this->get(DateTimeStorageRepository::class);
        foreach ($nullUids as $uid) {
            self::assertNull($repository->findByUid($uid)->{'get' . ucfirst($property)}(), 'row ' . $uid . ' is mapped to null');
        }
        $query = $repository->createQuery();
        self::assertSame($nullUids, $this->matchedUids($query->equals($property, null)), 'equals null');
        self::assertSame($otherUids, $this->matchedUids($query->logicalNot($query->equals($property, null))), 'logicalNot equals null');
    }

    private function dataHandlerValue(string $column): string
    {
        return str_starts_with($column, 'time_') ? '14:18:00' : '2025-01-20T14:18:56+00:00';
    }

    private function storedValue(string $column, int $uid): ?string
    {
        $value = $this->get(ConnectionPool::class)
            ->getConnectionForTable(self::TABLE)
            ->select([$column], self::TABLE, ['uid' => $uid])
            ->fetchOne();
        // Drivers differ on whether an integer column comes back as int or as string.
        return $value === null ? null : (string)$value;
    }

    /**
     * @return int[] The uids the constraint matches, ascending.
     */
    private function matchedUids(ConstraintInterface $constraint): array
    {
        $query = $this->get(DateTimeStorageRepository::class)->createQuery();
        $query->getQuerySettings()->setRespectStoragePage(false);
        $query->setOrderings(['uid' => QueryInterface::ORDER_ASCENDING]);
        $query->matching($constraint);
        return array_map(
            static fn(array $row): int => $row['uid'],
            iterator_to_array($query->execute(true))
        );
    }

    #[DataProvider('storageVariantDataProvider')]
    #[Test]
    public function extbaseStoresNullAsTheEmptyValueOfTheColumn(string $property, string $column, ?string $emptyValue): void
    {
        $this->persistViaExtbase();
        self::assertSame($emptyValue, $this->storedValue($column, 1));
        self::assertNotNull($this->storedValue($column, 2), 'the other row holds a date');
    }

    #[DataProvider('storageVariantDataProvider')]
    #[Test]
    public function dataHandlerStoresAnEmptyFieldAsTheEmptyValueOfTheColumn(string $property, string $column, ?string $emptyValue): void
    {
        $this->persistViaDataHandler();
        self::assertSame($emptyValue, $this->storedValue($column, 1));
        self::assertNotNull($this->storedValue($column, 2), 'the other row holds a date');
    }

    #[DataProvider('propertyDataProvider')]
    #[Test]
    public function theEmptyValueIsMappedBackToNull(string $property): void
    {
        $this->persistViaExtbase();
        $getter = 'get' . ucfirst($property);
        $repository = $this->get(DateTimeStorageRepository::class);
        self::assertNull($repository->findByUid(1)->{$getter}());
        self::assertInstanceOf(\DateTime::class, $repository->findByUid(2)->{$getter}());
    }

    #[DataProvider('propertyDataProvider')]
    #[Test]
    public function equalsNullMatchesTheRowMappedToNull(string $property): void
    {
        $this->persistViaExtbase();
        $query = $this->get(DateTimeStorageRepository::class)->createQuery();
        self::assertSame([1], $this->matchedUids($query->equals($property, null)));
    }

    #[DataProvider('propertyDataProvider')]
    #[Test]
    public function equalsNullMatchesTheRowDataHandlerLeftEmpty(string $property): void
    {
        $this->persistViaDataHandler();
        $query = $this->get(DateTimeStorageRepository::class)->createQuery();
        self::assertSame([1], $this->matchedUids($query->equals($property, null)));
    }

    #[DataProvider('propertyDataProvider')]
    #[Test]
    public function logicalNotEqualsNullMatchesTheOtherRow(string $property): void
    {
        $this->persistViaExtbase();
        $query = $this->get(DateTimeStorageRepository::class)->createQuery();
        self::assertSame([2], $this->matchedUids($query->logicalNot($query->equals($property, null))));
    }

    #[DataProvider('propertyDataProvider')]
    #[Test]
    public function logicalNotEqualsNullSkipsTheRowDataHandlerLeftEmpty(string $property): void
    {
        $this->persistViaDataHandler();
        $query = $this->get(DateTimeStorageRepository::class)->createQuery();
        self::assertSame([2], $this->matchedUids($query->logicalNot($query->equals($property, null))));
    }

    #[DataProvider('propertyDataProvider')]
    #[Test]
    public function notEqualToNullMatchesTheOtherRow(string $property): void
    {
        $this->persistViaExtbase();
        $qomFactory = $this->get(QueryObjectModelFactory::class);
        self::assertSame([2], $this->matchedUids(
            $qomFactory->comparison(
                $qomFactory->propertyValue($property),
                QueryInterface::OPERATOR_NOT_EQUAL_TO,
                null
            )
        ));
    }
}
