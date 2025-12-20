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

use Psr\Http\Message\ServerRequestInterface;
use TYPO3\CMS\Backend\Action\Resource\Dto\File as FileDto;
use TYPO3\CMS\Backend\Action\Resource\Dto\FilePermissions;
use TYPO3\CMS\Backend\Action\Resource\Dto\Folder as FolderDto;
use TYPO3\CMS\Backend\Action\Resource\Dto\FolderPermissions;
use TYPO3\CMS\Backend\Action\Resource\Dto\RecordReference;
use TYPO3\CMS\Core\Imaging\IconRegistry;
use TYPO3\CMS\Core\Resource\Exception\InsufficientFolderAccessPermissionsException;
use TYPO3\CMS\Core\Resource\File;
use TYPO3\CMS\Core\Resource\Folder;
use TYPO3\CMS\Core\Utility\GeneralUtility;

/**
 * @internal
 */
final readonly class ResourceDtoFactory
{
    public function __construct(
        private IconRegistry $iconRegistry,
    ) {}

    public function createFile(File $file, ?ServerRequestInterface $request = null): FileDto
    {
        $url = $file->getPublicUrl();
        $metadataUid = (int)($file->getMetaData()->offsetGet('uid') ?? 0);
        return new FileDto(
            uid: $file->getUid(),
            identifier: $file->getCombinedIdentifier(),
            folder: $file->getParentFolder()->getCombinedIdentifier(),
            name: $file->getName(),
            extension: $file->getExtension(),
            mimeType: $file->getMimeType(),
            iconIdentifier: $this->iconRegistry->getIconIdentifierForFileExtension($file->getExtension()),
            size: (int)$file->getSize(),
            createdAt: $this->formatTimestamp($file->getCreationTime()),
            modifiedAt: $this->formatTimestamp($file->getModificationTime()),
            url: $url !== null && $request !== null ? GeneralUtility::locationHeaderUrl($url, $request) : $url,
            hasPreview: $file->isImage() || $file->isMediaFile(),
            metadata: $metadataUid > 0 ? new RecordReference('sys_file_metadata', $metadataUid) : null,
            permissions: new FilePermissions(
                read: $file->checkActionPermission('read'),
                write: $file->checkActionPermission('write'),
                rename: $file->checkActionPermission('rename'),
                delete: $file->checkActionPermission('delete'),
            ),
        );
    }

    public function createFolder(Folder $folder): FolderDto
    {
        return new FolderDto(
            identifier: $folder->getCombinedIdentifier(),
            parent: $this->getParentIdentifier($folder),
            name: $folder->getName(),
            permissions: new FolderPermissions(
                read: $folder->checkActionPermission('read'),
                write: $folder->checkActionPermission('write'),
                add: $folder->checkActionPermission('add'),
                rename: $folder->checkActionPermission('rename'),
                delete: $folder->checkActionPermission('delete'),
            ),
        );
    }

    private function getParentIdentifier(Folder $folder): ?string
    {
        try {
            $parent = $folder->getParentFolder();
        } catch (InsufficientFolderAccessPermissionsException) {
            return null;
        }
        return $parent->getIdentifier() !== $folder->getIdentifier() ? $parent->getCombinedIdentifier() : null;
    }

    private function formatTimestamp(int $timestamp): ?string
    {
        return $timestamp > 0 ? date(\DateTimeInterface::ATOM, $timestamp) : null;
    }
}
