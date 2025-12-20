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
use TYPO3\CMS\Core\Action\ParameterSource;
use TYPO3\CMS\Core\Attribute\ActionParameter;
use TYPO3\CMS\Core\Attribute\AsAction;
use TYPO3\CMS\Core\Resource\Exception\FileOperationErrorException;
use TYPO3\CMS\Core\Resource\Exception\InsufficientFolderAccessPermissionsException;
use TYPO3\CMS\Core\Resource\Exception\InsufficientUserPermissionsException;
use TYPO3\CMS\Core\Resource\Exception\NotInMountPointException;
use TYPO3\CMS\Core\Resource\File;
use TYPO3\CMS\Core\Resource\Folder;
use TYPO3\CMS\Core\SysLog\Action\File as SystemLogFileAction;
use TYPO3\CMS\Core\SysLog\Error as SystemLogErrorClassification;

/**
 * @internal
 */
final readonly class DeleteFolder
{
    public function __construct(
        private ResourceAccess $resourceAccess,
    ) {}

    /**
     * Deletes a folder, unless it contains files that are used by records
     *
     * @param string $identifier Combined identifier of the folder, e.g. `1:/user_upload/images/`
     * @param bool $recursive Delete the folder with all its content, required for folders that are not empty
     * @throws NotFoundError Folder is not available
     * @throws PermissionDeniedError Folder may not be deleted by the user
     * @throws ConflictError Folder is not empty or contains files that are used by records
     */
    #[AsAction(
        name: 'folders',
        type: ActionType::delete,
        tag: 'resource',
        scopes: [
            ContentReadScope::class,
            ContentWriteScope::class,
        ],
    )]
    public function perform(
        #[ActionParameter(source: ParameterSource::query)]
        string $identifier,
        ActionContext $context,
        #[ActionParameter(source: ParameterSource::query)]
        bool $recursive = false,
    ): void {
        $user = $this->resourceAccess->getModifyingUser($context);
        $folder = $this->resourceAccess->getFolder($identifier);
        if ($folder->getIdentifier() === $folder->getStorage()->getRootLevelFolder(false)->getIdentifier()) {
            throw new PermissionDeniedError('The root folder of a storage can not be deleted', 1793350048);
        }
        if (!$recursive && ($folder->getFileCount() > 0 || $folder->getStorage()->countFoldersInFolder($folder, false) > 0)) {
            throw new ConflictError('The folder is not empty, it can be deleted recursively only', 1793350049);
        }
        $fileUids = array_map(
            static fn(File $file): int => $file->getUid(),
            array_filter($folder->getFiles(0, 0, Folder::FILTER_MODE_NO_FILTERS, true), static fn(mixed $file): bool => $file instanceof File),
        );
        if ($this->resourceAccess->findUsages(array_values($fileUids)) !== []) {
            throw new ConflictError($this->resourceAccess->translateLabel($context, 'LLL:EXT:core/Resources/Private/Language/locallang_core.xlf:message.description.folderNotDeletedHasFilesWithReferences'), 1793350050);
        }
        try {
            $folder->delete($recursive);
        } catch (InsufficientUserPermissionsException|InsufficientFolderAccessPermissionsException|NotInMountPointException $e) {
            $this->resourceAccess->log($user, SystemLogFileAction::DELETE, 'Access denied for directory "{identifier}" due to insufficient permissions', ['identifier' => $folder->getIdentifier()], SystemLogErrorClassification::USER_ERROR);
            throw new PermissionDeniedError($this->resourceAccess->translate($context, 'FileUtility.YouAreNotAllowedToAccessTheDirectory', $folder->getIdentifier()), 1793350051, $e);
        } catch (FileOperationErrorException $e) {
            throw new ConflictError($this->resourceAccess->translate($context, 'FileUtility.CouldNotDeleteDirectory', $folder->getIdentifier()), 1793350052, $e);
        }
        $this->resourceAccess->log($user, SystemLogFileAction::DELETE, 'Directory "{identifier}" deleted', ['identifier' => $folder->getIdentifier()]);
    }
}
