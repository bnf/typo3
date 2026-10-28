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
use TYPO3\CMS\Backend\Module\ModuleProvider;
use TYPO3\CMS\Backend\Utility\BackendUtility;
use TYPO3\CMS\Core\Action\ActionContext;
use TYPO3\CMS\Core\Action\Error\NotFoundError;
use TYPO3\CMS\Core\Action\Error\PermissionDeniedError;
use TYPO3\CMS\Core\Authentication\BackendUserAuthentication;
use TYPO3\CMS\Core\Database\Connection;
use TYPO3\CMS\Core\Database\ConnectionPool;
use TYPO3\CMS\Core\Http\UploadedFile;
use TYPO3\CMS\Core\Resource\Exception\FileDoesNotExistException;
use TYPO3\CMS\Core\Resource\Exception\FolderDoesNotExistException;
use TYPO3\CMS\Core\Resource\Exception\InsufficientFolderAccessPermissionsException;
use TYPO3\CMS\Core\Resource\Exception\InvalidPathException;
use TYPO3\CMS\Core\Resource\File;
use TYPO3\CMS\Core\Resource\Folder;
use TYPO3\CMS\Core\Resource\ResourceFactory;
use TYPO3\CMS\Core\SysLog\Error as SystemLogErrorClassification;
use TYPO3\CMS\Core\SysLog\Type as SystemLogType;
use TYPO3\CMS\Core\Utility\GeneralUtility;

/**
 * Resolves files and folders for resource actions and checks access
 *
 * @internal
 */
final readonly class ResourceAccess
{
    private const LABELS = 'LLL:EXT:core/Resources/Private/Language/fileMessages.xlf:';

    public function __construct(
        private ResourceFactory $resourceFactory,
        private ModuleProvider $moduleProvider,
        private ConnectionPool $connectionPool,
    ) {}

    /**
     * @throws NotFoundError
     * @throws PermissionDeniedError
     */
    public function getFile(int $uid): File
    {
        try {
            $file = $this->resourceFactory->getFileObject($uid);
        } catch (FileDoesNotExistException) {
            throw new NotFoundError('File not found', 1793347561);
        }
        if ($file->isMissing() || $file->isDeleted()) {
            throw new NotFoundError('File not found', 1793347562);
        }
        if ($file->getStorage()->isFallbackStorage() || !$file->checkActionPermission('read')) {
            throw new PermissionDeniedError('Permission denied', 1793347563);
        }
        return $file;
    }

    /**
     * @throws NotFoundError
     * @throws PermissionDeniedError
     */
    public function getFolder(string $identifier): Folder
    {
        try {
            $folder = $this->resourceFactory->getFolderObjectFromCombinedIdentifier($identifier);
        } catch (InsufficientFolderAccessPermissionsException) {
            throw new PermissionDeniedError('Permission denied', 1793347565);
        } catch (FolderDoesNotExistException|InvalidPathException) {
            throw new NotFoundError('Folder not found', 1793347566);
        }
        if ($folder->getStorage()->isFallbackStorage() || !$folder->checkActionPermission('read')) {
            throw new PermissionDeniedError('Permission denied', 1793347567);
        }
        return $folder;
    }

    /**
     * Files and folders are modified by users with access to the media module only,
     * like in the backend
     *
     * @throws PermissionDeniedError
     */
    public function getModifyingUser(ActionContext $context): BackendUserAuthentication
    {
        $user = $context->principal;
        if (!$user instanceof BackendUserAuthentication || !$this->moduleProvider->accessGranted('media_management', $user)) {
            throw new PermissionDeniedError('Modifying files requires access to the media module', 1793350018);
        }
        return $user;
    }

    /**
     * Writes request contents to a temporary file, that is handled like an upload
     * by the storage, including its upload restrictions
     */
    public function createUploadedFile(StreamInterface $content, string $name): UploadedFile
    {
        $temporaryFile = GeneralUtility::tempnam('resource_upload_');
        $target = fopen($temporaryFile, 'wb');
        if ($content->isSeekable()) {
            $content->rewind();
        }
        while (!$content->eof()) {
            fwrite($target, $content->read(1048576));
        }
        fclose($target);
        return new UploadedFile($temporaryFile, (int)filesize($temporaryFile), UPLOAD_ERR_OK, $name);
    }

    /**
     * @param array<string, string> $data
     */
    public function log(BackendUserAuthentication $user, int $action, string $message, array $data, int $severity = SystemLogErrorClassification::MESSAGE): void
    {
        $user->writelog(SystemLogType::FILE, $action, $severity, null, $message, $data);
    }

    /**
     * Records that use the files, references to deleted records are ignored like
     * in the file list
     *
     * @param list<int> $fileUids
     * @return list<string> e.g. `[record:tt_content:12]`
     */
    public function findUsages(array $fileUids): array
    {
        if ($fileUids === []) {
            return [];
        }
        $queryBuilder = $this->connectionPool->getQueryBuilderForTable('sys_refindex');
        $rows = $queryBuilder
            ->select('tablename', 'recuid')
            ->from('sys_refindex')
            ->where(
                $queryBuilder->expr()->eq('ref_table', $queryBuilder->createNamedParameter('sys_file')),
                $queryBuilder->expr()->in('ref_uid', $queryBuilder->createNamedParameter($fileUids, Connection::PARAM_INT_ARRAY)),
                $queryBuilder->expr()->neq('tablename', $queryBuilder->createNamedParameter('sys_file_metadata')),
            )
            ->executeQuery()
            ->fetchAllAssociative();
        $usages = [];
        foreach ($rows as $row) {
            $table = (string)$row['tablename'];
            $uid = (int)$row['recuid'];
            if ($table === 'sys_file_reference') {
                $reference = BackendUtility::getRecord('sys_file_reference', $uid);
                $table = (string)($reference['tablenames'] ?? '');
                $uid = (int)($reference['uid_foreign'] ?? 0);
                if ($table === '' || BackendUtility::getRecord($table, $uid) === null) {
                    continue;
                }
            }
            $usages[] = '[record:' . $table . ':' . $uid . ']';
        }
        return array_values(array_unique($usages));
    }

    public function translate(ActionContext $context, string $key, string ...$arguments): string
    {
        return $this->translateLabel($context, self::LABELS . $key, ...$arguments);
    }

    public function translateLabel(ActionContext $context, string $label, string ...$arguments): string
    {
        return sprintf($context->translator->label($label), ...$arguments);
    }
}
