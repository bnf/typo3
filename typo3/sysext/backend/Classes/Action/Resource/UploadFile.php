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

use Psr\Http\Message\StreamInterface;
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
use TYPO3\CMS\Core\Resource\Exception\InvalidFileNameException;
use TYPO3\CMS\Core\Resource\Exception\NotInMountPointException;
use TYPO3\CMS\Core\Resource\Exception\UploadSizeException;
use TYPO3\CMS\Core\Resource\File;
use TYPO3\CMS\Core\SysLog\Action\File as SystemLogFileAction;
use TYPO3\CMS\Core\SysLog\Error as SystemLogErrorClassification;
use TYPO3\CMS\Core\Validation\ResultException;
use TYPO3\CMS\Core\Validation\ResultRenderingTrait;

/**
 * @internal
 */
final readonly class UploadFile
{
    use ResultRenderingTrait;

    public function __construct(
        private ResourceAccess $resourceAccess,
        private ResourceDtoFactory $resourceDtoFactory,
    ) {}

    /**
     * Uploads a file, the request body is the content of the file.
     *
     * @param StreamInterface $content Content of the file
     * @param string $folder Combined identifier of the folder, e.g. `1:/user_upload/`
     * @param string $name Name of the file
     * @param DuplicationBehavior $conflictMode How to handle an existing file with the same name
     * @throws NotFoundError Folder is not available
     * @throws PermissionDeniedError File may not be uploaded by the user
     * @throws ConflictError A file with the same name exists already
     */
    #[AsAction(
        name: 'files',
        type: ActionType::create,
        tag: 'resource',
        scopes: [
            ContentReadScope::class,
            ContentWriteScope::class,
        ],
    )]
    public function perform(
        StreamInterface $content,
        string $folder,
        string $name,
        ActionContext $context,
        DuplicationBehavior $conflictMode = DuplicationBehavior::CANCEL,
    ): FileDto {
        $user = $this->resourceAccess->getModifyingUser($context);
        $targetFolder = $this->resourceAccess->getFolder($folder);
        if (trim($name) === '') {
            throw new ActionException('The name must not be empty', 1793350054);
        }
        $uploadedFile = $this->resourceAccess->createUploadedFile($content, $name);
        try {
            $result = $targetFolder->getStorage()->addUploadedFile($uploadedFile, $targetFolder, $name, $conflictMode);
        } catch (ExistingTargetFileNameException $e) {
            throw new ConflictError($this->resourceAccess->translate($context, 'FileUtility.DestinationExistedAlready', $name), 1793350055, $e);
        } catch (InsufficientUserPermissionsException|InsufficientFileAccessPermissionsException|InsufficientFolderAccessPermissionsException|NotInMountPointException $e) {
            $this->resourceAccess->log($user, SystemLogFileAction::UPLOAD, 'File uploading denied due to insufficient permissions', [], SystemLogErrorClassification::USER_ERROR);
            throw new PermissionDeniedError($this->resourceAccess->translate($context, 'FileUtility.YouAreNotAllowedToUploadFiles'), 1793350056, $e);
        } catch (UploadSizeException $e) {
            throw new ActionException($this->resourceAccess->translate($context, 'FileUtility.TheUploadedFileExceedsTheSize-limit', $name), 1793350057, $e);
        } catch (IllegalFileExtensionException|InvalidFileNameException $e) {
            throw new ActionException($this->resourceAccess->translate($context, 'FileUtility.ExtensionOfFileNameOrWasNotAllowed', $name, (string)pathinfo($name, PATHINFO_EXTENSION)), 1793350058, $e);
        } catch (ResultException $e) {
            throw new ActionException($this->renderResultException($e, $context->translator), 1793350059, $e);
        } finally {
            if (file_exists($uploadedFile->getTemporaryFileName())) {
                unlink($uploadedFile->getTemporaryFileName());
            }
        }
        if (!$result instanceof File) {
            throw new ActionException('File could not be uploaded', 1793350060);
        }
        $this->resourceAccess->log($user, SystemLogFileAction::UPLOAD, 'File "{identifier}" uploaded to "{destination}"', ['identifier' => $name, 'destination' => $targetFolder->getIdentifier()]);
        return $this->resourceDtoFactory->createFile($result, $context->request);
    }
}
