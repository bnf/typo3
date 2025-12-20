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

namespace TYPO3\CMS\Backend\Action\Resource;

use TYPO3\CMS\Backend\Scope\ContentReadScope;
use TYPO3\CMS\Backend\Scope\ContentWriteScope;
use TYPO3\CMS\Core\Action\ActionContext;
use TYPO3\CMS\Core\Action\ActionType;
use TYPO3\CMS\Core\Action\Error\ConflictError;
use TYPO3\CMS\Core\Action\Error\NotFoundError;
use TYPO3\CMS\Core\Action\Error\PermissionDeniedError;
use TYPO3\CMS\Core\Attribute\AsAction;
use TYPO3\CMS\Core\Resource\Exception\InsufficientFileAccessPermissionsException;
use TYPO3\CMS\Core\Resource\Exception\NotInMountPointException;
use TYPO3\CMS\Core\SysLog\Action\File as SystemLogFileAction;
use TYPO3\CMS\Core\SysLog\Error as SystemLogErrorClassification;

/**
 * @internal
 */
final readonly class DeleteFile
{
    public function __construct(
        private ResourceAccess $resourceAccess,
    ) {}

    /**
     * Deletes a file that is not used by records anymore
     *
     * @param int $uid uid of the file (`sys_file`)
     * @throws NotFoundError File is not available
     * @throws PermissionDeniedError File may not be deleted by the user
     * @throws ConflictError File is still used by records
     */
    #[AsAction(
        name: 'files/{uid}',
        type: ActionType::delete,
        tag: 'resource',
        scopes: [
            ContentReadScope::class,
            ContentWriteScope::class,
        ],
    )]
    public function perform(int $uid, ActionContext $context): void
    {
        $user = $this->resourceAccess->getModifyingUser($context);
        $file = $this->resourceAccess->getFile($uid);
        $usages = $this->resourceAccess->findUsages([$file->getUid()]);
        if ($usages !== []) {
            throw new ConflictError(
                $this->resourceAccess->translateLabel($context, 'LLL:EXT:core/Resources/Private/Language/locallang_core.xlf:message.description.fileNotDeletedHasReferences', $file->getName()) . ' ' . implode(', ', $usages),
                1793350046
            );
        }
        try {
            $file->delete();
        } catch (InsufficientFileAccessPermissionsException|NotInMountPointException $e) {
            $this->resourceAccess->log($user, SystemLogFileAction::DELETE, 'Access denied for file "{identifier}" due to insufficient permissions', ['identifier' => $file->getIdentifier()], SystemLogErrorClassification::USER_ERROR);
            throw new PermissionDeniedError($this->resourceAccess->translate($context, 'FileUtility.YouAreNotAllowedToAccessTheFile', $file->getIdentifier()), 1793350047, $e);
        }
        $this->resourceAccess->log($user, SystemLogFileAction::DELETE, 'File "{identifier}" deleted', ['identifier' => $file->getIdentifier()]);
    }
}
