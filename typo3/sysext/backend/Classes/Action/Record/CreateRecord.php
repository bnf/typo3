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

use TYPO3\CMS\Backend\Scope\ContentReadScope;
use TYPO3\CMS\Backend\Scope\ContentWriteScope;
use TYPO3\CMS\Core\Action\ActionContext;
use TYPO3\CMS\Core\Action\ActionException;
use TYPO3\CMS\Core\Action\ActionType;
use TYPO3\CMS\Core\Action\Error\NotFoundError;
use TYPO3\CMS\Core\Action\Error\PermissionDeniedError;
use TYPO3\CMS\Core\Action\ParameterSource;
use TYPO3\CMS\Core\Attribute\ActionParameter;
use TYPO3\CMS\Core\Attribute\AsAction;
use TYPO3\CMS\Core\Authentication\BackendUserAuthentication;
use TYPO3\CMS\Core\DataHandling\DataHandler;
use TYPO3\CMS\Core\DataHandling\RecordInputAccessCheck;
use TYPO3\CMS\Core\DataHandling\RecordInputDataMapBuilder;
use TYPO3\CMS\Core\Domain\Dto\Record;
use TYPO3\CMS\Core\Domain\Dto\RecordInput;
use TYPO3\CMS\Core\Domain\RecordSerializer;
use TYPO3\CMS\Core\Utility\GeneralUtility;

final readonly class CreateRecord
{
    public function __construct(
        private RecordSerializer $recordSerializer,
        private RecordRepository $recordRepository,
        private RecordInputDataMapBuilder $recordInputDataMapBuilder,
        private RecordInputAccessCheck $recordInputAccessCheck,
        private TemporaryWorkspace $temporaryWorkspace,
    ) {}

    /**
     * @template T of string
     * @param T $schema
     * @param int|null $workspace Workspace to create the record in, defaults to the current workspace of the user
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
        RecordInput $record,
        ActionContext $context,
        #[ActionParameter(source: ParameterSource::query)]
        ?int $workspace = null,
    ): array {
        if ($record->schema !== $schema) {
            throw new ActionException('Record schema does not match the requested schema', 1792673869);
        }

        $this->temporaryWorkspace->apply($context, $workspace);
        $user = $context->principal;
        $pageRow = $user instanceof BackendUserAuthentication
            ? $this->recordRepository->findRowByUid('pages', $pid, $user)
            : false;
        if ($pageRow === false) {
            throw new PermissionDeniedError('You have no permission for the desired target page', 1791445083);
        }
        if ($pageRow === null) {
            throw new ActionException('Target page not found', 1791445084);
        }

        ['id' => $newId, 'dataMap' => $dataMap] = $this->recordInputDataMapBuilder->build($record, (int)$pageRow['uid']);
        $user = $this->assertAccess($context, $record, $dataMap);
        $dataHandler = GeneralUtility::makeInstance(DataHandler::class);
        $dataHandler->start($dataMap, []);
        $dataHandler->process_datamap();

        if ($dataHandler->errorLog !== []) {
            throw new ActionException('Record could not be created', 1791445085);
        }

        $recordUid = (int)$dataHandler->substNEWwithIDs[$newId];

        $createdRecord = $this->recordRepository->findByUid($schema, $recordUid, $user);
        if ($createdRecord === false) {
            throw new PermissionDeniedError('Permission denied', 1791445086);
        }
        if ($createdRecord === null) {
            throw new ActionException('Record could not be created', 1791445087);
        }
        return [
            'record' => new Record($createdRecord, $this->recordSerializer, $user),
        ];
    }

    private function assertAccess(ActionContext $context, RecordInput $record, array $dataMap, array $cmdMap = []): BackendUserAuthentication
    {
        $backendUser = $context->principal;
        if (!$backendUser instanceof BackendUserAuthentication) {
            throw new PermissionDeniedError('Records can only be written by backend users', 1793024581);
        }
        $denied = $this->recordInputAccessCheck->getDeniedAccess($backendUser, $record, $dataMap, $cmdMap);
        if ($denied !== []) {
            throw new PermissionDeniedError('No permission to modify ' . implode(', ', $denied), 1793024591);
        }
        return $backendUser;
    }
}
