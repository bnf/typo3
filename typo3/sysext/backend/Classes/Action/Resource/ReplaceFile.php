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
final readonly class ReplaceFile
{
    use ResultRenderingTrait;

    public function __construct(
        private ResourceAccess $resourceAccess,
        private ResourceDtoFactory $resourceDtoFactory,
    ) {}

    /**
     * Replaces the content of a file, the request body is the new content. The uid
     * of the file is kept.
     *
     * @param int $uid uid of the file (`sys_file`)
     * @param StreamInterface $content New content of the file
     * @param string|null $name New name of the file, e.g. if the file type changes
     * @throws NotFoundError File is not available
     * @throws PermissionDeniedError File may not be replaced by the user
     * @throws ConflictError A file with the new name exists already
     */
    #[AsAction(
        name: 'files/{uid}',
        type: ActionType::replace,
        tag: 'resource',
        scopes: [
            ContentReadScope::class,
            ContentWriteScope::class,
        ],
    )]
    public function perform(
        int $uid,
        StreamInterface $content,
        ActionContext $context,
        ?string $name = null,
    ): FileDto {
        $user = $this->resourceAccess->getModifyingUser($context);
        $file = $this->resourceAccess->getFile($uid);
        if ($name !== null && trim($name) === '') {
            throw new ActionException('The name must not be empty', 1793350061);
        }
        $storage = $file->getStorage();
        $uploadedFile = $this->resourceAccess->createUploadedFile($content, $name ?? $file->getName());
        try {
            $result = $name !== null && $name !== $file->getName()
                ? $storage->replaceAndRenameUploadedFile($uploadedFile, $file, $name)
                : $storage->addUploadedFile($uploadedFile, $file->getParentFolder(), $file->getName(), DuplicationBehavior::REPLACE);
        } catch (ExistingTargetFileNameException $e) {
            throw new ConflictError($this->resourceAccess->translate($context, 'FileUtility.DestinationExistedAlready', (string)$name), 1793350062, $e);
        } catch (InsufficientUserPermissionsException|InsufficientFileAccessPermissionsException|InsufficientFolderAccessPermissionsException|NotInMountPointException $e) {
            $this->resourceAccess->log($user, SystemLogFileAction::UPLOAD, 'Overwrite denied for "{destination}" due to insufficient permissions', ['destination' => $file->getIdentifier()], SystemLogErrorClassification::USER_ERROR);
            throw new PermissionDeniedError($this->resourceAccess->translate($context, 'FileUtility.YouAreNotAllowedToOverride', $file->getName()), 1793350063, $e);
        } catch (UploadSizeException $e) {
            throw new ActionException($this->resourceAccess->translate($context, 'FileUtility.TheUploadedFileExceedsTheSize-limit', $file->getName()), 1793350064, $e);
        } catch (IllegalFileExtensionException|InvalidFileNameException $e) {
            throw new ActionException($this->resourceAccess->translate($context, 'FileUtility.ExtensionOfFileNameOrWasNotAllowed', (string)$name, (string)pathinfo((string)$name, PATHINFO_EXTENSION)), 1793350065, $e);
        } catch (ResultException $e) {
            throw new ActionException($this->renderResultException($e, $context->translator), 1793350066, $e);
        } finally {
            if (file_exists($uploadedFile->getTemporaryFileName())) {
                unlink($uploadedFile->getTemporaryFileName());
            }
        }
        if (!$result instanceof File) {
            throw new ActionException('File could not be replaced', 1793350067);
        }
        $this->resourceAccess->log($user, SystemLogFileAction::UPLOAD, 'File "{identifier}" replaced with "{destination}"', ['identifier' => $result->getName(), 'destination' => $file->getIdentifier()]);
        return $this->resourceDtoFactory->createFile($result, $context->request);
    }
}
