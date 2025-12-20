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

use TYPO3\CMS\Backend\Action\Resource\Dto\CopySource;
use TYPO3\CMS\Backend\Action\Resource\Dto\File as FileDto;
use TYPO3\CMS\Backend\Action\Resource\Dto\Folder as FolderDto;
use TYPO3\CMS\Backend\Action\Resource\Dto\ResourceType;
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
use TYPO3\CMS\Core\Authentication\BackendUserAuthentication;
use TYPO3\CMS\Core\Resource\Enum\DuplicationBehavior;
use TYPO3\CMS\Core\Resource\Exception\ExistingTargetFileNameException;
use TYPO3\CMS\Core\Resource\Exception\ExistingTargetFolderException;
use TYPO3\CMS\Core\Resource\Exception\IllegalFileExtensionException;
use TYPO3\CMS\Core\Resource\Exception\InsufficientFileAccessPermissionsException;
use TYPO3\CMS\Core\Resource\Exception\InsufficientFolderAccessPermissionsException;
use TYPO3\CMS\Core\Resource\Exception\InsufficientUserPermissionsException;
use TYPO3\CMS\Core\Resource\Exception\InvalidFileNameException;
use TYPO3\CMS\Core\Resource\Exception\InvalidTargetFolderException;
use TYPO3\CMS\Core\Resource\Exception\NotInMountPointException;
use TYPO3\CMS\Core\Resource\File;
use TYPO3\CMS\Core\Resource\Folder;
use TYPO3\CMS\Core\SysLog\Action\File as SystemLogFileAction;
use TYPO3\CMS\Core\SysLog\Error as SystemLogErrorClassification;
use TYPO3\CMS\Core\Utility\Exception\NotImplementedMethodException;

/**
 * @internal
 */
final readonly class CreateResource
{
    public function __construct(
        private ResourceAccess $resourceAccess,
        private ResourceDtoFactory $resourceDtoFactory,
    ) {}

    /**
     * Creates a file or a folder in a folder, or copies a file or a folder into it.
     *
     * @param string $identifier Combined identifier of the folder, e.g. `1:/user_upload/`
     * @param ResourceType|null $type Type of the resource to create, not used for copies
     * @param string|null $name Name of the new resource, defaults to the name of the copied resource
     * @param string|null $content Content of a new file
     * @param CopySource|null $copyFrom File or folder to copy
     * @param DuplicationBehavior $conflictMode How to handle an existing resource with the same name when copying
     * @throws NotFoundError Folder or copied resource is not available
     * @throws PermissionDeniedError Resource may not be created by the user
     * @throws ConflictError A resource with the same name exists already
     */
    #[AsAction(
        name: 'folders',
        type: ActionType::create,
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
        ?ResourceType $type = null,
        ?string $name = null,
        ?string $content = null,
        ?CopySource $copyFrom = null,
        DuplicationBehavior $conflictMode = DuplicationBehavior::CANCEL,
    ): FileDto|FolderDto {
        $user = $this->resourceAccess->getModifyingUser($context);
        $folder = $this->resourceAccess->getFolder($identifier);
        if ($name !== null && trim($name) === '') {
            throw new ActionException('The name must not be empty', 1793350035);
        }
        try {
            $result = match (true) {
                $copyFrom !== null => $this->copy($user, $context, $folder, $copyFrom, $name, $conflictMode),
                $type === ResourceType::folder && $name !== null => $this->createFolder($user, $folder, $name),
                $type === ResourceType::file && $name !== null => $this->createFile($user, $folder, $name, $content),
                default => throw new ActionException('Either type and name or copyFrom must be given', 1793350036),
            };
        } catch (ExistingTargetFileNameException|ExistingTargetFolderException $e) {
            throw new ConflictError($this->resourceAccess->translate($context, 'FileUtility.DestinationExistedAlready', (string)$name), 1793350037, $e);
        } catch (InsufficientUserPermissionsException|InsufficientFileAccessPermissionsException|InsufficientFolderAccessPermissionsException|NotInMountPointException $e) {
            $this->resourceAccess->log($user, SystemLogFileAction::NEW_FILE, 'Creating a resource in "{destination}" denied: {reason}', ['destination' => $folder->getIdentifier(), 'reason' => $e->getMessage()], SystemLogErrorClassification::USER_ERROR);
            throw new PermissionDeniedError('Permission denied', 1793350038, $e);
        } catch (InvalidFileNameException|IllegalFileExtensionException $e) {
            throw new ActionException($this->resourceAccess->translate($context, 'FileUtility.ExtensionOfFileNameOrWasNotAllowed', (string)$name, (string)pathinfo((string)$name, PATHINFO_EXTENSION)), 1793350039, $e);
        } catch (InvalidTargetFolderException $e) {
            throw new ActionException($e->getMessage(), 1793350040, $e);
        } catch (NotImplementedMethodException $e) {
            throw new ActionException($e->getMessage(), 1793350041, $e);
        }
        return $result instanceof File
            ? $this->resourceDtoFactory->createFile($result, $context->request)
            : $this->resourceDtoFactory->createFolder($result);
    }

    private function copy(BackendUserAuthentication $user, ActionContext $context, Folder $folder, CopySource $copyFrom, ?string $name, DuplicationBehavior $conflictMode): File|Folder
    {
        if (($copyFrom->file === null) === ($copyFrom->folder === null)) {
            throw new ActionException('Either a file or a folder must be copied', 1793350042);
        }
        if ($copyFrom->file !== null) {
            $source = $this->resourceAccess->getFile($copyFrom->file);
            $result = $source->copyTo($folder, $name, $conflictMode);
            if (!$result instanceof File) {
                throw new ActionException('File could not be copied', 1793350043);
            }
            $this->resourceAccess->log($user, SystemLogFileAction::COPY, 'File "{identifier}" copied to "{destination}"', ['identifier' => $source->getIdentifier(), 'destination' => $result->getIdentifier()]);
            return $result;
        }
        $source = $this->resourceAccess->getFolder((string)$copyFrom->folder);
        $result = $source->copyTo($folder, $name, $conflictMode);
        $this->resourceAccess->log($user, SystemLogFileAction::COPY, 'Directory "{identifier}" copied to "{destination}"', ['identifier' => $source->getIdentifier(), 'destination' => $folder->getIdentifier()]);
        return $result;
    }

    private function createFolder(BackendUserAuthentication $user, Folder $folder, string $name): Folder
    {
        if ($folder->hasFolder($name)) {
            throw new ExistingTargetFolderException('Folder exists already', 1793350044);
        }
        $result = $folder->createFolder($name);
        $this->resourceAccess->log($user, SystemLogFileAction::NEW_FOLDER, 'Directory "{identifier}" created in "{destination}"', ['identifier' => $name, 'destination' => $folder->getIdentifier()]);
        return $result;
    }

    private function createFile(BackendUserAuthentication $user, Folder $folder, string $name, ?string $content): File
    {
        if ($folder->hasFile($name)) {
            throw new ExistingTargetFileNameException('File exists already', 1793350045);
        }
        $result = $folder->createFile($name);
        if ($content !== null) {
            $result->setContents($content);
        }
        $this->resourceAccess->log($user, SystemLogFileAction::NEW_FILE, 'File "{identifier}" created', ['identifier' => $name]);
        return $result;
    }
}
