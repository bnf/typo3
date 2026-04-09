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

namespace TYPO3\CMS\Hub\Repository;

use TYPO3\CMS\Backend\Utility\BackendUtility;
use TYPO3\CMS\Core\Database\ConnectionPool;
use TYPO3\CMS\Core\Database\Query\QueryBuilder;
use TYPO3\CMS\Core\Database\Query\Restriction\DeletedRestriction;
use TYPO3\CMS\Core\Database\Query\Restriction\EndTimeRestriction;
use TYPO3\CMS\Core\Database\Query\Restriction\HiddenRestriction;
use TYPO3\CMS\Core\Database\Query\Restriction\StartTimeRestriction;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Hub\Model\AppInstruction;

/**
 * Accessing app records from the database
 *
 * @internal This class is not part of TYPO3's Core API.
 */
class AppRepository
{
    public function findAll(): array
    {
        return $this->map($this->getQueryBuilder()
            ->executeQuery()
            ->fetchAllAssociative());
    }

    public function countAll(?AppDemand $demand = null): int
    {
        $qb = $demand ? $this->getQueryBuilderForDemand($demand, false) : $this->getQueryBuilder(false);
        return (int)$qb
            ->count('*')
            ->executeQuery()
            ->fetchOne();
    }

    public function getAppRecords(?AppDemand $demand = null): array
    {
        return $demand !== null ? $this->findByDemand($demand) : $this->findAll();
    }

    /**
     * Used within the resolving / execution process, so starttime / endtime is added.
     */
    public function getAppRecordByIdentifier(string $identifier): ?AppInstruction
    {
        $queryBuilder = $this->getQueryBuilder();
        $queryBuilder
            ->getRestrictions()
            ->add(GeneralUtility::makeInstance(HiddenRestriction::class))
            ->add(GeneralUtility::makeInstance(StartTimeRestriction::class))
            ->add(GeneralUtility::makeInstance(EndTimeRestriction::class));
        $result = $queryBuilder
            ->where(
                $queryBuilder->expr()->eq('identifier', $queryBuilder->createNamedParameter($identifier))
            )
            ->executeQuery()
            ->fetchAssociative();
        if (!empty($result)) {
            return $this->mapSingleRow($result);
        }
        return null;
    }

    public function findByDemand(AppDemand $demand): array
    {
        return $this->map($this->getQueryBuilderForDemand($demand)
            ->setMaxResults($demand->getLimit())
            ->setFirstResult($demand->getOffset())
            ->executeQuery()
            ->fetchAllAssociative());
    }

    protected function getQueryBuilderForDemand(AppDemand $demand, bool $addOrderBy = true): QueryBuilder
    {
        $queryBuilder = $this->getQueryBuilder(false);
        if ($addOrderBy) {
            $queryBuilder->orderBy(
                $demand->getOrderField(),
                $demand->getOrderDirection()
            );
            // Ensure deterministic ordering.
            if ($demand->getOrderField() !== 'uid') {
                $queryBuilder->addOrderBy('uid', 'asc');
            }
        }

        $constraints = [];
        if ($demand->hasName()) {
            $escapedLikeString = '%' . $queryBuilder->escapeLikeWildcards($demand->getName()) . '%';
            $constraints[] = $queryBuilder->expr()->like(
                'name',
                $queryBuilder->createNamedParameter($escapedLikeString)
            );
        }
        if ($demand->hasAppType()) {
            $constraints[] = $queryBuilder->expr()->eq(
                'app_type',
                $queryBuilder->createNamedParameter($demand->getAppType())
            );
        }

        if (!empty($constraints)) {
            $queryBuilder->where(...$constraints);
        }
        return $queryBuilder;
    }

    protected function map(array $rows): array
    {
        $items = [];
        foreach ($rows as $row) {
            $items[] = $this->mapSingleRow($row);
        }
        return $items;
    }

    protected function mapSingleRow(array $row): AppInstruction
    {
        $row = BackendUtility::convertDatabaseRowValuesToPhp('sys_app', $row);
        return new AppInstruction($row);
    }

    protected function getQueryBuilder(bool $addDefaultOrderByClause = true): QueryBuilder
    {
        // @todo ConnectionPool could be injected
        $queryBuilder = GeneralUtility::makeInstance(ConnectionPool::class)
            ->getQueryBuilderForTable('sys_app');
        $queryBuilder->getRestrictions()
            ->removeAll()
            ->add(GeneralUtility::makeInstance(DeletedRestriction::class));
        $queryBuilder->select('*')->from('sys_app');
        if ($addDefaultOrderByClause) {
            $queryBuilder
                ->orderBy('name', 'asc')
                // Ensure deterministic ordering.
                ->addOrderBy('uid', 'asc');
        }
        return $queryBuilder;
    }
}
