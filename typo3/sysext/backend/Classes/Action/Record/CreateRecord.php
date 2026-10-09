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

use TYPO3\CMS\Backend\Utility\BackendUtility;
use TYPO3\CMS\Core\Action\ActionContext;
use TYPO3\CMS\Core\Action\ActionType;
use TYPO3\CMS\Core\Action\ActionException;
use TYPO3\CMS\Core\Action\Error\NotFoundError;
use TYPO3\CMS\Core\Action\Error\PermissionDeniedError;
use TYPO3\CMS\Core\Attribute\AsAction;
use TYPO3\CMS\Core\Domain\Dto\Record;
use TYPO3\CMS\Core\Domain\RecordFactory;
use TYPO3\CMS\Core\Domain\RecordSerializer;
use TYPO3\CMS\Core\Scope\ContentReadScope;
use TYPO3\CMS\Core\Scope\ContentWriteScope;
use TYPO3\CMS\Core\Authentication\BackendUserAuthentication;
use TYPO3\CMS\Core\Schema\Capability\TcaSchemaCapability;
use TYPO3\CMS\Core\Type\Bitmask\Permission;
use TYPO3\CMS\Core\Schema\TcaSchemaFactory;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Core\DataHandling\DataHandler;

final readonly class CreateRecord
{
    public function __construct(
        private RecordFactory $recordFactory,
        private RecordSerializer $recordSerializer,
        private TcaSchemaFactory $tcaSchemaFactory,
    ) {}

    /**
     * @template T of string
     * @param T $schema
     * @param array<string, mixed> $recordData
     * @return array{record: Record}
     * @throws NotFoundError Record is not available
     */
    #[AsAction(
        name: 'records/{schema}/{pid}',
        type: ActionType::create,
        tag: 'record',
        scopes: [
            ContentReadScope::class,
            ContentWriteScope::class,
        ],
    )]
    public function perform(
        string $schema,
        int $pid,
        array $recordData,
        ActionContext $context,
    ): array {
        $pageRow = $this->fetchRecordRow($context, 'pages', $pid);
        if ($pageRow === false) {
            throw new PermissionDeniedError('You have no permission for the desired target page', 1791445083);
        }
        if ($pageRow === null) {
            throw new ActionException('Target page not found', 1791445084);
        }

        // @todo validate recordData
        $recordData['pid'] = $pageRow['uid'];
        $newId = uniqid('NEW');
        $datamap = [
            $schema => [
                $newId => $recordData,
            ],
        ];
        $dataHandler = GeneralUtility::makeInstance(DataHandler::class);
        $dataHandler->start($datamap, []);
        $dataHandler->process_datamap();

        if ($dataHandler->errorLog !== []) {
            throw new ActionException('Record could not be created', 1791445085);
        }

        $recordUid = (int)$dataHandler->substNEWwithIDs[$newId];

        $recordRow = $this->fetchRecordRow($context, $schema, $recordUid);
        if ($recordRow === false) {
            throw new PermissionDeniedError('Permission denied', 1791445086);
        }
        if ($recordRow === null) {
            throw new ActionException('Record could not be created', 1791445086);
        }
        return [
            'record' => new Record(
                $this->recordFactory->createResolvedRecordFromDatabaseRow($schema, $recordRow),
                $this->recordSerializer,
            ),
        ];
    }

    protected function fetchRecordRow(ActionContext $context, string $table, int $uid): false|null|array
    {
        $user = $context->principal;

        if (!$user instanceof BackendUserAuthentication) {
            return false;
        }

        if (!$user->check('tables_select', $table)) {
            return false;
        }

        $row = BackendUtility::getRecord($table, $uid);
        if (!is_array($row)) {
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
}
