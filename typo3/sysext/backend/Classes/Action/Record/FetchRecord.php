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
use TYPO3\CMS\Core\Action\Error\NotFoundError;
use TYPO3\CMS\Core\Action\Error\PermissionDeniedError;
use TYPO3\CMS\Core\Attribute\AsAction;
use TYPO3\CMS\Core\Domain\Dto\Record;
use TYPO3\CMS\Core\Domain\RecordFactory;
use TYPO3\CMS\Core\Domain\RecordSerializer;
use TYPO3\CMS\Core\Scope\ContentReadScope;
use TYPO3\CMS\Core\Authentication\BackendUserAuthentication;
use TYPO3\CMS\Core\Schema\Capability\TcaSchemaCapability;
use TYPO3\CMS\Core\Type\Bitmask\Permission;
use TYPO3\CMS\Core\Schema\TcaSchemaFactory;

final readonly class FetchRecord
{
    public function __construct(
        private RecordFactory $recordFactory,
        private RecordSerializer $recordSerializer,
        private TcaSchemaFactory $tcaSchemaFactory,
    ) {}

    /**
     * @template T of string
     * @param T $schema
     * @return array{record: Record}
     * @throws NotFoundError Record is not available
     * @todo Allow schema generation (and phpstan) to use `array{record: RecordDto<T>}`
     */
    #[AsAction(
        name: 'records/{schema}/{identifier}',
        tag: 'record',
        scopes: [
            ContentReadScope::class,
        ],
    )]
    public function perform(
        string $schema,
        int $identifier,
        ActionContext $context,
    ): array {
        $recordRow = $this->fetchRecordRow($context, $schema, $identifier);
        if ($recordRow === false) {
            throw new PermissionDeniedError('Permission denied', 1766253176);
        }
        if ($recordRow === null) {
            throw new NotFoundError('Record not found', 1766253177);
        }
        /*
        \TYPO3\CMS\Extbase\Utility\DebuggerUtility::var_dump(
            $this->recordFactory->createResolvedRecordFromDatabaseRow($schema, $recordRow)->toArray()
        );
        exit;
         */
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
