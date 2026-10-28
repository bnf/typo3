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
use TYPO3\CMS\Backend\Action\Resource\Dto\Folder as FolderDto;
use TYPO3\CMS\Backend\Scope\ContentReadScope;
use TYPO3\CMS\Core\Action\ActionContext;
use TYPO3\CMS\Core\Action\ActionException;
use TYPO3\CMS\Core\Action\Error\NotFoundError;
use TYPO3\CMS\Core\Action\Error\PermissionDeniedError;
use TYPO3\CMS\Core\Attribute\AsAction;
use TYPO3\CMS\Core\Resource\File;
use TYPO3\CMS\Core\Resource\Folder;

/**
 * @internal
 */
final readonly class FetchFolder
{
    private const MAX_LIMIT = 200;

    public function __construct(
        private ResourceAccess $resourceAccess,
        private ResourceDtoFactory $resourceDtoFactory,
    ) {}

    /**
     * Provides a folder and its content, subfolders first, both ordered by name.
     * If there is more content, `next` is to be passed as `cursor` to fetch the
     * next page.
     *
     * @param string $identifier Combined identifier of the folder, e.g. `1:/user_upload/`
     * @param string|null $name Only the file or subfolder with exactly this name
     * @param int $limit Maximum number of items, 1 to 200
     * @param string|null $cursor `next` of the previous page
     * @return array{folder: FolderDto, items: list<FolderDto|FileDto>, next: string|null}
     * @throws NotFoundError Folder is not available
     * @throws PermissionDeniedError Folder is not readable for the user
     */
    #[AsAction(
        name: 'folders',
        tag: 'resource',
        scopes: [
            ContentReadScope::class,
        ],
    )]
    public function perform(
        string $identifier,
        ActionContext $context,
        ?string $name = null,
        int $limit = 50,
        ?string $cursor = null,
    ): array {
        if ($limit < 1 || $limit > self::MAX_LIMIT) {
            throw new ActionException('Limit must be between 1 and ' . self::MAX_LIMIT, 1793347564);
        }
        $folder = $this->resourceAccess->getFolder($identifier);
        $offset = $cursor === null ? 0 : $this->decodeCursor($cursor);

        $next = null;
        if ($name !== null) {
            $items = [
                ...($folder->hasFolder($name) ? [$folder->getSubfolder($name)] : []),
                ...($folder->hasFile($name) ? [$folder->getFile($name)] : []),
            ];
        } else {
            $storage = $folder->getStorage();
            $folderCount = $storage->countFoldersInFolder($folder);
            $items = $offset < $folderCount ? $folder->getSubfolders($offset, $limit) : [];
            $remaining = $limit - count($items);
            if ($remaining > 0) {
                $items = [
                    ...$items,
                    ...$folder->getFiles(max(0, $offset - $folderCount), $remaining, Folder::FILTER_MODE_USE_OWN_AND_STORAGE_FILTERS, false, 'name'),
                ];
            }
            if ($offset + $limit < $folderCount + $storage->countFilesInFolder($folder)) {
                $next = $this->encodeCursor($offset + $limit);
            }
        }

        return [
            'folder' => $this->resourceDtoFactory->createFolder($folder),
            'items' => array_values(array_map(
                fn(Folder|File $item): FolderDto|FileDto => $item instanceof Folder
                    ? $this->resourceDtoFactory->createFolder($item)
                    : $this->resourceDtoFactory->createFile($item, $context->request),
                array_filter($items, static fn(mixed $item): bool => $item instanceof Folder || $item instanceof File),
            )),
            'next' => $next,
        ];
    }

    private function encodeCursor(int $offset): string
    {
        return rtrim(strtr(base64_encode(json_encode([$offset], JSON_THROW_ON_ERROR)), '+/', '-_'), '=');
    }

    private function decodeCursor(string $cursor): int
    {
        $values = json_decode((string)base64_decode(strtr($cursor, '-_', '+/'), true), true);
        if (!is_array($values) || !is_int($values[0] ?? null) || $values[0] < 0 || count($values) !== 1) {
            throw new ActionException('Invalid cursor', 1793347568);
        }
        return $values[0];
    }
}
