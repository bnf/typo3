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

namespace TYPO3\CMS\Backend\Action\Record;

use Doctrine\DBAL\ArrayParameterType;
use TYPO3\CMS\Backend\Tree\Repository\PageTreeRepository;
use TYPO3\CMS\Backend\Utility\BackendUtility;
use TYPO3\CMS\Core\Authentication\BackendUserAuthentication;
use TYPO3\CMS\Core\Database\Connection;
use TYPO3\CMS\Core\Database\ConnectionPool;
use TYPO3\CMS\Core\Database\Query\Restriction\DeletedRestriction;
use TYPO3\CMS\Core\Database\Query\Restriction\WorkspaceRestriction;
use TYPO3\CMS\Core\Domain\RecordFactory;
use TYPO3\CMS\Core\Domain\RecordInterface;
use TYPO3\CMS\Core\Schema\Capability\LabelCapability;
use TYPO3\CMS\Core\Schema\Capability\LanguageAwareSchemaCapability;
use TYPO3\CMS\Core\Schema\Capability\TcaSchemaCapability;
use TYPO3\CMS\Core\Schema\TcaSchema;
use TYPO3\CMS\Core\Schema\TcaSchemaFactory;
use TYPO3\CMS\Core\Type\Bitmask\Permission;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Core\Versioning\VersionState;

/**
 * Finds records as seen by a backend user in their current workspace.
 * Records are addressed by their live uid and overlaid with their workspace version.
 *
 * Results are `false` if the user has no access, and `null` if the record is not available.
 *
 * @internal
 */
final readonly class RecordRepository
{
    public function __construct(
        private RecordFactory $recordFactory,
        private TcaSchemaFactory $tcaSchemaFactory,
        private ConnectionPool $connectionPool,
    ) {}

    public function findByUid(string $table, int $uid, BackendUserAuthentication $user): false|RecordInterface|null
    {
        $row = $this->findRowByUid($table, $uid, $user);
        if (!is_array($row)) {
            return $row;
        }
        return $this->recordFactory->createResolvedRecordFromDatabaseRow($table, $row);
    }

    public function findRowByUid(string $table, int $uid, BackendUserAuthentication $user): false|array|null
    {
        if (!$user->check('tables_select', $table)) {
            return false;
        }

        $row = BackendUtility::getRecordWSOL($table, $uid);
        if (!is_array($row) || !$this->isAvailableInWorkspace($row, $user->workspace)) {
            return null;
        }

        $schema = $this->tcaSchemaFactory->get($table);
        $rootLevelCapability = $schema->getCapability(TcaSchemaCapability::RestrictionRootLevel);

        $pageId = (int)($table === 'pages' ? $row['uid'] : $row['pid']);
        if ($pageId === 0) {
            if ($user->isAdmin() || $rootLevelCapability->canAccessRecordsOnRootLevel()) {
                return $row;
            }
            return false;
        }

        $pageRow = $table === 'pages' ? $row : BackendUtility::getRecord('pages', $pageId);
        if (!is_array($pageRow)) {
            return null;
        }

        if (!$user->doesUserHaveAccess($pageRow, Permission::PAGE_SHOW)) {
            return false;
        }

        return $row;
    }

    /**
     * Finds records of the given language (and of all languages) on pages accessible
     * by the user, optionally filtered by label, page and record type. Records are ordered by
     * the fields of `getSortFields()` and start after the given cursor (values of
     * these fields). `next` is the cursor of the next page, if there are more records.
     *
     * @param list<int>|null $cursor
     * @return false|array{rows: list<array<string, mixed>>, next: list<int>|null}|null
     */
    public function findRows(
        string $table,
        BackendUserAuthentication $user,
        int $limit,
        ?array $cursor = null,
        string $search = '',
        ?int $pid = null,
        ?string $type = null,
        int $language = 0,
    ): false|array|null {
        if (!$this->tcaSchemaFactory->has($table)) {
            return null;
        }
        if (!$user->check('tables_select', $table) || !$user->checkLanguageAccess($language)) {
            return false;
        }
        $schema = $this->tcaSchemaFactory->get($table);
        $noRows = ['rows' => [], 'next' => null];

        $queryBuilder = $this->connectionPool->getQueryBuilderForTable($table);
        $queryBuilder->getRestrictions()
            ->removeAll()
            ->add(GeneralUtility::makeInstance(DeletedRestriction::class))
            ->add(GeneralUtility::makeInstance(WorkspaceRestriction::class, $user->workspace));
        $queryBuilder
            ->select('*')
            ->from($table)
            ->setMaxResults($limit + 1);

        $sortFields = $this->getSortFields($table);
        foreach ($sortFields as $sortField) {
            $queryBuilder->addOrderBy($sortField);
        }
        if ($cursor !== null) {
            $constraints = [];
            foreach ($sortFields as $index => $sortField) {
                $constraint = [$queryBuilder->expr()->gt($sortField, $queryBuilder->createNamedParameter($cursor[$index], Connection::PARAM_INT))];
                for ($previous = 0; $previous < $index; $previous++) {
                    $constraint[] = $queryBuilder->expr()->eq($sortFields[$previous], $queryBuilder->createNamedParameter($cursor[$previous], Connection::PARAM_INT));
                }
                $constraints[] = $queryBuilder->expr()->and(...$constraint);
            }
            $queryBuilder->andWhere($queryBuilder->expr()->or(...$constraints));
        }

        if ($schema->isLanguageAware()) {
            /** @var LanguageAwareSchemaCapability $languageCapability */
            $languageCapability = $schema->getCapability(TcaSchemaCapability::Language);
            $queryBuilder->andWhere($queryBuilder->expr()->in(
                $languageCapability->getLanguageField()->getName(),
                $queryBuilder->createNamedParameter([$language, -1], ArrayParameterType::INTEGER)
            ));
        } elseif ($language !== 0) {
            return $noRows;
        }

        if ($search !== '') {
            /** @var LabelCapability|null $labelCapability */
            $labelCapability = $schema->hasCapability(TcaSchemaCapability::Label) ? $schema->getCapability(TcaSchemaCapability::Label) : null;
            $labelField = $labelCapability?->getPrimaryFieldName();
            if ($labelField === null || !$this->isFieldReadable($table, $labelField, $user)) {
                return $noRows;
            }
            $queryBuilder->andWhere($queryBuilder->expr()->like(
                $labelField,
                $queryBuilder->createNamedParameter('%' . $queryBuilder->escapeLikeWildcards($search) . '%')
            ));
        }

        if ($pid !== null) {
            $queryBuilder->andWhere($queryBuilder->expr()->eq('pid', $queryBuilder->createNamedParameter($pid, Connection::PARAM_INT)));
        }

        if ($type !== null) {
            $typeField = $this->getTypeField($table);
            if ($typeField === null || !$this->isFieldReadable($table, $typeField, $user)) {
                return $noRows;
            }
            $queryBuilder->andWhere($queryBuilder->expr()->eq($typeField, $queryBuilder->createNamedParameter($type)));
        }

        if (!$user->isAdmin()) {
            $pageIds = $this->getAccessiblePageIds($user);
            $constraints = [];
            if ($pageIds !== []) {
                $constraints[] = $queryBuilder->expr()->in(
                    $table === 'pages' ? 'uid' : 'pid',
                    $queryBuilder->createNamedParameter($pageIds, ArrayParameterType::INTEGER)
                );
            }
            if ($table !== 'pages' && $schema->getCapability(TcaSchemaCapability::RestrictionRootLevel)->canAccessRecordsOnRootLevel()) {
                $constraints[] = $queryBuilder->expr()->eq('pid', $queryBuilder->createNamedParameter(0, Connection::PARAM_INT));
            }
            if ($constraints === []) {
                return $noRows;
            }
            $queryBuilder->andWhere($queryBuilder->expr()->or(...$constraints));
        }

        $fetchedRows = $queryBuilder->executeQuery()->fetchAllAssociative();
        $hasMore = count($fetchedRows) > $limit;
        $fetchedRows = array_slice($fetchedRows, 0, $limit);
        // Rows are filtered after fetching, the next page thus starts after the last fetched row
        $lastRow = end($fetchedRows);
        $next = $hasMore && $lastRow !== false
            ? array_map(static fn(string $sortField): int => (int)$lastRow[$sortField], $sortFields)
            : null;

        $rows = [];
        foreach ($fetchedRows as $row) {
            BackendUtility::workspaceOL($table, $row, $user->workspace);
            if (is_array($row) && $this->isAvailableInWorkspace($row, $user->workspace)) {
                $rows[] = $row;
            }
        }
        return ['rows' => $rows, 'next' => $next];
    }

    /**
     * Fields records are ordered by in `findRows()`: page and sorting field
     * for tables with manual sorting, the uid in any case.
     *
     * @return list<string>
     */
    public function getSortFields(string $table): array
    {
        $schema = $this->tcaSchemaFactory->get($table);
        if (!$schema->hasCapability(TcaSchemaCapability::SortByField)) {
            return ['uid'];
        }
        return ['pid', $schema->getCapability(TcaSchemaCapability::SortByField)->getFieldName(), 'uid'];
    }

    /**
     * Field holding the record type, null for tables without record types.
     */
    public function getTypeField(string $table): ?string
    {
        $schema = $this->tcaSchemaFactory->get($table);
        if (!$schema->supportsSubSchema() || $schema->getSubSchemaTypeInformation()->isPointerToForeignFieldInForeignSchema()) {
            return null;
        }
        return $schema->getSubSchemaTypeInformation()->getFieldName();
    }

    /**
     * Reference to a record to identify it, built from the fields the user may read.
     * `type` and `hidden` are null if the user may not read the field, `type` is null
     * for tables without record types as well. `language` is structural like `uid`
     * and `pid` (access to languages is checked when finding records), it is null
     * for tables without languages.
     *
     * @return array{uid: int, pid: int, label: string, type: string|null, hidden: bool|null, language: int|null}
     */
    public function getReference(string $table, array $row, BackendUserAuthentication $user): array
    {
        $schema = $this->tcaSchemaFactory->get($table);
        $typeField = $this->getTypeField($table);
        $hiddenField = $schema->getRawConfiguration()['enablecolumns']['disabled'] ?? null;
        return [
            'uid' => (int)$row['uid'],
            'pid' => (int)$row['pid'],
            'label' => $this->getLabel($table, $row, $user),
            'type' => $typeField !== null && $this->isFieldReadable($table, $typeField, $user) ? (string)$row[$typeField] : null,
            'hidden' => match (true) {
                $hiddenField === null => false,
                $this->isFieldReadable($table, $hiddenField, $user) => (bool)$row[$hiddenField],
                default => null,
            },
            'language' => $this->getLanguageId($schema, $row),
        ];
    }

    private function getLanguageId(TcaSchema $schema, array $row): ?int
    {
        if (!$schema->isLanguageAware()) {
            return null;
        }
        /** @var LanguageAwareSchemaCapability $languageCapability */
        $languageCapability = $schema->getCapability(TcaSchemaCapability::Language);
        return (int)$row[$languageCapability->getLanguageField()->getName()];
    }

    private function getLabel(string $table, array $row, BackendUserAuthentication $user): string
    {
        foreach (array_keys($row) as $fieldName) {
            if (!$this->isFieldReadable($table, (string)$fieldName, $user)) {
                unset($row[$fieldName]);
            }
        }
        return (string)BackendUtility::getRecordTitle($table, $row, false, false);
    }

    private function isAvailableInWorkspace(array $row, int $workspace): bool
    {
        // Versions are only available via the uid of their live record
        return !((int)($row['t3ver_oid'] ?? 0) > 0 && !isset($row['_ORIG_uid']))
            && in_array((int)($row['t3ver_wsid'] ?? 0), [0, $workspace], true)
            && VersionState::tryFrom((int)($row['t3ver_state'] ?? 0)) !== VersionState::DELETE_PLACEHOLDER;
    }

    private function isFieldReadable(string $table, string $fieldName, BackendUserAuthentication $user): bool
    {
        $schema = $this->tcaSchemaFactory->get($table);
        return $user->isAdmin()
            || !$schema->hasField($fieldName)
            || !$schema->getField($fieldName)->supportsAccessControl()
            || $user->check('non_exclude_fields', $table . ':' . $fieldName);
    }

    /**
     * @return list<int>
     */
    private function getAccessiblePageIds(BackendUserAuthentication $user): array
    {
        $mounts = $user->getWebmounts();
        if ($mounts === []) {
            return [];
        }
        $pageTreeRepository = GeneralUtility::makeInstance(PageTreeRepository::class, $user->workspace);
        $pageTreeRepository->setAdditionalWhereClause($user->getPagePermsClause(Permission::PAGE_SHOW));
        return array_map(intval(...), array_column($pageTreeRepository->getFlattenedPages($mounts, 99), 'uid'));
    }
}
