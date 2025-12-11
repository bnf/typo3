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
use TYPO3\CMS\Core\Action\ActionException;
use TYPO3\CMS\Core\Action\ActionType;
use TYPO3\CMS\Core\Action\Error\NotFoundError;
use TYPO3\CMS\Core\Attribute\AsAction;
use TYPO3\CMS\Core\DataHandling\DataHandler;
use TYPO3\CMS\Core\Scope\ContentReadScope;
use TYPO3\CMS\Core\Scope\ContentWriteScope;
use TYPO3\CMS\Core\Utility\GeneralUtility;

final readonly class DeleteRecord
{
    /**
     * @throws NotFoundError Record is not available
     * @throws ActionException Record could not be deleted
     */
    #[AsAction(
        name: 'records/{schema}/{identifier}',
        type: ActionType::delete,
        tag: 'record',
        scopes: [
            ContentReadScope::class,
            ContentWriteScope::class,
        ],
    )]
    public function perform(
        string $schema,
        int $identifier,
        ActionContext $context,
    ): void {
        $recordRow = BackendUtility::getRecord($schema, $identifier);
        if ($recordRow === null) {
            throw new NotFoundError('Record not found', 1782890002);
        }

        $cmd = [
            $schema => [
                $identifier => [
                    'delete' => 1,
                ],
            ],
        ];

        $dataHandler = GeneralUtility::makeInstance(DataHandler::class);
        $dataHandler->start([], $cmd);
        $dataHandler->process_cmdmap();

        if ($dataHandler->errorLog !== []) {
            throw new ActionException('Record could not be deleted', 1782889694);
        }
    }
}
