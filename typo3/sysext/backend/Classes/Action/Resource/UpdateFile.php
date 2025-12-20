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

use TYPO3\CMS\Backend\Action\Resource\Dto\File as FileDto;
use TYPO3\CMS\Backend\Scope\ContentReadScope;
use TYPO3\CMS\Backend\Scope\ContentWriteScope;
use TYPO3\CMS\Core\Action\ActionContext;
use TYPO3\CMS\Core\Action\ActionException;
use TYPO3\CMS\Core\Action\ActionType;
use TYPO3\CMS\Core\Action\Error\ConflictError;
use TYPO3\CMS\Core\Action\Error\NotFoundError;
use TYPO3\CMS\Core\Action\Error\PermissionDeniedError;
use TYPO3\CMS\Core\Attribute\AsAction;
use TYPO3\CMS\Core\Resource\Enum\DuplicationBehavior;
use TYPO3\CMS\Core\Resource\Exception\ExistingTargetFileNameException;
use TYPO3\CMS\Core\Resource\Exception\IllegalFileExtensionException;
use TYPO3\CMS\Core\Resource\Exception\InsufficientFileAccessPermissionsException;
use TYPO3\CMS\Core\Resource\Exception\InsufficientFolderAccessPermissionsException;
use TYPO3\CMS\Core\Resource\Exception\InsufficientUserPermissionsException;
use TYPO3\CMS\Core\Resource\Exception\NotInMountPointException;
use TYPO3\CMS\Core\Resource\File;
use TYPO3\CMS\Core\SysLog\Action\File as SystemLogFileAction;
use TYPO3\CMS\Core\SysLog\Error as SystemLogErrorClassification;
use TYPO3\CMS\Core\Utility\Exception\NotImplementedMethodException;
use TYPO3\CMS\Core\Validation\ResultException;
use TYPO3\CMS\Core\Validation\ResultRenderingTrait;

/**
 * @internal
 */
final readonly class UpdateFile
{
    use ResultRenderingTrait;

    public function __construct(
        private ResourceAccess $resourceAccess,
        private ResourceDtoFactory $resourceDtoFactory,
    ) {}

    /**
     * Renames a file and/or moves it to another folder. The uid of the file is kept.
     *
     * @param int $uid uid of the file (`sys_file`)
     * @param string|null $name New name of the file
     * @param string|null $folder Combined identifier of the folder to move the file to, e.g. `1:/user_upload/`
     * @param DuplicationBehavior $conflictMode How to handle an existing file with the same name in the target folder
     * @throws NotFoundError File or folder is not available
     * @throws PermissionDeniedError File may not be modified by the user
     * @throws ConflictError A file with the same name exists already
     */
    #[AsAction(
        name: 'files/{uid}',
        type: ActionType::update,
        tag: 'resource',
        scopes: [
            ContentReadScope::class,
            ContentWriteScope::class,
        ],
    )]
    public function perform(
        int $uid,
        ActionContext $context,
        ?string $name = null,
        ?string $folder = null,
        DuplicationBehavior $conflictMode = DuplicationBehavior::CANCEL,
    ): FileDto {
        $user = $this->resourceAccess->getModifyingUser($context);
        $file = $this->resourceAccess->getFile($uid);
        $targetFolder = $folder !== null ? $this->resourceAccess->getFolder($folder) : null;
        if ($targetFolder?->getCombinedIdentifier() === $file->getParentFolder()->getCombinedIdentifier()) {
            $targetFolder = null;
        }
        if ($name === $file->getName()) {
            $name = null;
        }
        if ($targetFolder === null && $name === null) {
            throw new ActionException('Either name or folder must be changed', 1793350019);
        }
        if ($name !== null && trim($name) === '') {
            throw new ActionException('The name must not be empty', 1793350020);
        }

        $origin = $file->getIdentifier();
        $action = $targetFolder !== null ? SystemLogFileAction::MOVE : SystemLogFileAction::RENAME;
        try {
            $result = $targetFolder !== null
                ? $file->moveTo($targetFolder, $name, $conflictMode)
                : $file->rename($name, $conflictMode);
        } catch (ExistingTargetFileNameException $e) {
            throw new ConflictError($this->resourceAccess->translate($context, 'FileUtility.DestinationExistedAlready', $name ?? $file->getName()), 1793350021, $e);
        } catch (InsufficientUserPermissionsException|InsufficientFileAccessPermissionsException|InsufficientFolderAccessPermissionsException|NotInMountPointException $e) {
            $this->resourceAccess->log($user, $action, 'Modifying file "{identifier}" denied: {reason}', ['identifier' => $origin, 'reason' => $e->getMessage()], SystemLogErrorClassification::USER_ERROR);
            throw new PermissionDeniedError($this->resourceAccess->translate($context, $action === SystemLogFileAction::MOVE ? 'FileUtility.YouAreNotAllowedToMoveFiles' : 'FileUtility.YouAreNotAllowedToRenameFiles'), 1793350022, $e);
        } catch (IllegalFileExtensionException $e) {
            throw new ActionException($this->resourceAccess->translate($context, 'FileUtility.ExtensionOfFileNameOrWasNotAllowed', $name ?? $file->getName(), $file->getExtension()), 1793350023, $e);
        } catch (NotImplementedMethodException $e) {
            throw new ActionException($this->resourceAccess->translate($context, 'FileUtility.TheFunctionToMoveAFileBetweenStoragesIsNotYetImplemented'), 1793350024, $e);
        } catch (ResultException $e) {
            throw new ActionException($this->renderResultException($e, $context->translator), 1793350025, $e);
        }
        if (!$result instanceof File) {
            throw new ActionException('File could not be modified', 1793350026);
        }

        if ($action === SystemLogFileAction::MOVE) {
            $this->resourceAccess->log($user, $action, 'File "{identifier}" moved to "{destination}"', ['identifier' => $origin, 'destination' => $result->getIdentifier()]);
        } else {
            $this->resourceAccess->log($user, $action, 'File renamed from "{identifier}" to "{destination}"', ['identifier' => $origin, 'destination' => $result->getIdentifier()]);
        }
        return $this->resourceDtoFactory->createFile($result, $context->request);
    }
}
