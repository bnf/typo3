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

use TYPO3\CMS\Backend\Action\Resource\Dto\Folder as FolderDto;
use TYPO3\CMS\Backend\Scope\ContentReadScope;
use TYPO3\CMS\Backend\Scope\ContentWriteScope;
use TYPO3\CMS\Core\Action\ActionContext;
use TYPO3\CMS\Core\Action\ActionException;
use TYPO3\CMS\Core\Action\ActionType;
use TYPO3\CMS\Core\Action\Error\ConflictError;
use TYPO3\CMS\Core\Action\Error\NotFoundError;
use TYPO3\CMS\Core\Action\Error\PermissionDeniedError;
use TYPO3\CMS\Core\Action\ParameterSource;
use TYPO3\CMS\Core\Attribute\ActionParameter;
use TYPO3\CMS\Core\Attribute\AsAction;
use TYPO3\CMS\Core\Resource\Enum\DuplicationBehavior;
use TYPO3\CMS\Core\Resource\Exception\ExistingTargetFolderException;
use TYPO3\CMS\Core\Resource\Exception\InsufficientFileAccessPermissionsException;
use TYPO3\CMS\Core\Resource\Exception\InsufficientFolderAccessPermissionsException;
use TYPO3\CMS\Core\Resource\Exception\InsufficientUserPermissionsException;
use TYPO3\CMS\Core\Resource\Exception\InvalidTargetFolderException;
use TYPO3\CMS\Core\Resource\Exception\NotInMountPointException;
use TYPO3\CMS\Core\Resource\Folder;
use TYPO3\CMS\Core\SysLog\Action\File as SystemLogFileAction;
use TYPO3\CMS\Core\SysLog\Error as SystemLogErrorClassification;
use TYPO3\CMS\Core\Utility\Exception\NotImplementedMethodException;

/**
 * @internal
 */
final readonly class UpdateFolder
{
    public function __construct(
        private ResourceAccess $resourceAccess,
        private ResourceDtoFactory $resourceDtoFactory,
    ) {}

    /**
     * Renames a folder and/or moves it into another folder. The identifier of the
     * folder changes, the response contains the new one.
     *
     * @param string $identifier Combined identifier of the folder, e.g. `1:/user_upload/images/`
     * @param string|null $name New name of the folder
     * @param string|null $parent Combined identifier of the folder to move the folder into
     * @param DuplicationBehavior $conflictMode How to handle an existing folder with the same name in the target folder
     * @throws NotFoundError Folder is not available
     * @throws PermissionDeniedError Folder may not be modified by the user
     * @throws ConflictError A folder with the same name exists already
     */
    #[AsAction(
        name: 'folders',
        type: ActionType::update,
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
        ?string $name = null,
        ?string $parent = null,
        DuplicationBehavior $conflictMode = DuplicationBehavior::CANCEL,
    ): FolderDto {
        $user = $this->resourceAccess->getModifyingUser($context);
        $folder = $this->resourceAccess->getFolder($identifier);
        $targetFolder = $parent !== null ? $this->resourceAccess->getFolder($parent) : null;
        if ($targetFolder?->getCombinedIdentifier() === $this->getParentIdentifier($folder)) {
            $targetFolder = null;
        }
        if ($name === $folder->getName()) {
            $name = null;
        }
        if ($targetFolder === null && $name === null) {
            throw new ActionException('Either name or parent must be changed', 1793350027);
        }
        if ($name !== null && trim($name) === '') {
            throw new ActionException('The name must not be empty', 1793350028);
        }
        if ($folder->getIdentifier() === $folder->getStorage()->getRootLevelFolder(false)->getIdentifier()) {
            throw new PermissionDeniedError('The root folder of a storage can not be modified', 1793350029);
        }

        $origin = $folder->getIdentifier();
        $action = $targetFolder !== null ? SystemLogFileAction::MOVE : SystemLogFileAction::RENAME;
        try {
            if ($targetFolder !== null) {
                $result = $folder->moveTo($targetFolder, $name, $conflictMode);
            } elseif ($folder->getParentFolder()->hasFolder($name) && $conflictMode === DuplicationBehavior::CANCEL) {
                throw new ExistingTargetFolderException('Folder exists already', 1793350030);
            } else {
                $result = $folder->rename($name);
            }
        } catch (ExistingTargetFolderException $e) {
            throw new ConflictError($this->resourceAccess->translate($context, 'FileUtility.TargetAlreadyExists', $name ?? $folder->getName()), 1793350031, $e);
        } catch (InsufficientUserPermissionsException|InsufficientFileAccessPermissionsException|InsufficientFolderAccessPermissionsException|NotInMountPointException $e) {
            $this->resourceAccess->log($user, $action, 'Modifying directory "{identifier}" denied: {reason}', ['identifier' => $origin, 'reason' => $e->getMessage()], SystemLogErrorClassification::USER_ERROR);
            throw new PermissionDeniedError($this->resourceAccess->translate($context, $action === SystemLogFileAction::MOVE ? 'FileUtility.YouAreNotAllowedToMoveDirectories' : 'FileUtility.YouAreNotAllowedToRenameDirectories'), 1793350032, $e);
        } catch (InvalidTargetFolderException $e) {
            throw new ActionException($this->resourceAccess->translate($context, 'FileUtility.CannotMoveFolderIntoTargetFolderBecauseTheTargetFolderIsAlreadyWithinTheFolderToBeMoved', $folder->getName(), (string)$targetFolder?->getName()), 1793350033, $e);
        } catch (NotImplementedMethodException $e) {
            throw new ActionException($this->resourceAccess->translate($context, 'FileUtility.TheFunctionToMoveAFolderBetweenStoragesIsNotYetImplemented'), 1793350034, $e);
        }

        if ($action === SystemLogFileAction::MOVE) {
            $this->resourceAccess->log($user, $action, 'Directory "{identifier}" moved to "{destination}"', ['identifier' => $origin, 'destination' => $result->getIdentifier()]);
        } else {
            $this->resourceAccess->log($user, $action, 'Directory renamed from "{identifier}" to "{destination}"', ['identifier' => $origin, 'destination' => $result->getIdentifier()]);
        }
        return $this->resourceDtoFactory->createFolder($result);
    }

    private function getParentIdentifier(Folder $folder): ?string
    {
        try {
            return $folder->getParentFolder()->getCombinedIdentifier();
        } catch (InsufficientFolderAccessPermissionsException) {
            return null;
        }
    }
}
