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
use TYPO3\CMS\Core\Domain\Dto\RecordPatch;
use TYPO3\CMS\Core\Domain\RecordSerializer;
use TYPO3\CMS\Core\Utility\GeneralUtility;

final readonly class UpdateRecord
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
     * @param int|null $workspace Workspace to update the record in, defaults to the current workspace of the user
     * @return array{record: Record}
     * @throws NotFoundError Record is not available
     */
    #[AsAction(
        name: 'records/{schema}/{identifier}',
        type: ActionType::update,
        tag: 'record',
        scopes: [
            ContentReadScope::class,
            ContentWriteScope::class,
        ],
    )]
    public function perform(
        string $schema,
        int $identifier,
        RecordPatch $record,
        ActionContext $context,
        #[ActionParameter(source: ParameterSource::query)]
        ?int $workspace = null,
    ): array {
        if ($record->schema !== $schema) {
            throw new ActionException('Record schema does not match the requested schema', 1792748106);
        }
        if (isset($record->fields['uid']) && $record->fields['uid'] !== $identifier) {
            throw new ActionException('Record uid does not match the requested identifier', 1793020722);
        }

        $this->temporaryWorkspace->apply($context, $workspace);
        $user = $context->principal;
        $recordRow = $user instanceof BackendUserAuthentication
            ? $this->recordRepository->findRowByUid($schema, $identifier, $user)
            : false;
        if ($recordRow === false) {
            throw new PermissionDeniedError('You have no permission for the desired record', 1791445093);
        }
        if ($recordRow === null) {
            throw new ActionException('Target record not found', 1791445094);
        }

        ['dataMap' => $dataMap, 'cmdMap' => $cmdMap] = $this->recordInputDataMapBuilder->buildPatch($record, $recordRow);
        $user = $this->assertAccess($context, $record, $dataMap, $cmdMap);
        $dataHandler = GeneralUtility::makeInstance(DataHandler::class);
        $dataHandler->start($dataMap, $cmdMap);
        $dataHandler->process_datamap();
        $dataHandler->process_cmdmap();

        if ($dataHandler->errorLog !== []) {
            throw new ActionException('Record could not be updated', 1791445095);
        }

        $updatedRecord = $this->recordRepository->findByUid($schema, $identifier, $user);
        if ($updatedRecord === false) {
            throw new PermissionDeniedError('Permission denied', 1791445096);
        }
        if ($updatedRecord === null) {
            throw new ActionException('Record could not be updated', 1791445097);
        }
        return [
            'record' => new Record($updatedRecord, $this->recordSerializer, $user),
        ];
    }

    private function assertAccess(ActionContext $context, RecordPatch $record, array $dataMap, array $cmdMap = []): BackendUserAuthentication
    {
        $backendUser = $context->principal;
        if (!$backendUser instanceof BackendUserAuthentication) {
            throw new PermissionDeniedError('Records can only be written by backend users', 1793024582);
        }
        $denied = $this->recordInputAccessCheck->getDeniedAccess($backendUser, $record, $dataMap, $cmdMap);
        if ($denied !== []) {
            throw new PermissionDeniedError('No permission to modify ' . implode(', ', $denied), 1793024592);
        }
        return $backendUser;
    }
}
