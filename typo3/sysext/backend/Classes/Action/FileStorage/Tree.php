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

namespace TYPO3\CMS\Backend\Action\FileStorage;

use Psr\EventDispatcher\EventDispatcherInterface;
use Psr\Http\Message\ServerRequestInterface;
use TYPO3\CMS\Backend\Controller\Event\AfterFileStorageTreeItemsPreparedEvent;
use TYPO3\CMS\Backend\Dto\Tree\FileTreeItem;
use TYPO3\CMS\Backend\Dto\Tree\Label\Label;
use TYPO3\CMS\Backend\Dto\Tree\TreeItem;
use TYPO3\CMS\Backend\Scope\ContentReadScope;
use TYPO3\CMS\Backend\Tree\FileStorageTreeProvider;
use TYPO3\CMS\Core\Action\ActionContext;
use TYPO3\CMS\Core\Action\Error\NotFoundError;
use TYPO3\CMS\Core\Action\Error\PermissionDeniedError;
use TYPO3\CMS\Core\Attribute\AsAction;
use TYPO3\CMS\Core\Authentication\BackendUserAuthentication;
use TYPO3\CMS\Core\Http\ServerRequest;
use TYPO3\CMS\Core\Imaging\IconFactory;
use TYPO3\CMS\Core\Imaging\IconSize;
use TYPO3\CMS\Core\Localization\LanguageService;
use TYPO3\CMS\Core\Resource\Exception\FolderDoesNotExistException;
use TYPO3\CMS\Core\Resource\Exception\InsufficientFolderAccessPermissionsException;
use TYPO3\CMS\Core\Resource\Folder;
use TYPO3\CMS\Core\Resource\FolderInterface;
use TYPO3\CMS\Core\Resource\ResourceFactory;

/**
 * Actions providing data to the file storage tree.
 *
 * @internal This class provides specific backend actions and is not considered part of the Public TYPO3 API.
 */
readonly class Tree
{
    public function __construct(
        protected IconFactory $iconFactory,
        protected FileStorageTreeProvider $treeProvider,
        protected ResourceFactory $resourceFactory,
        protected EventDispatcherInterface $eventDispatcher,
    ) {}

    /**
     * Loads data for the first time, or when expanding a folder.
     *
     * @param string|null $parent URL encoded combined identifier of the folder to expand
     * @param int $depth Depth of the folder to expand
     * @return list<FileTreeItem>
     */
    #[AsAction(
        name: 'filestorage/tree',
        summary: 'Provide data for file storage tree',
        scopes: [
            ContentReadScope::class,
        ],
    )]
    public function fetchDataAction(
        ActionContext $context,
        ?string $parent = null,
        int $depth = 1,
    ): array {
        if ($parent !== null && $parent !== '') {
            $folder = $this->resourceFactory->getFolderObjectFromCombinedIdentifier(rawurldecode($parent));
            $items = $this->treeProvider->getSubfolders($folder, $depth + 1);
        } else {
            $items = $this->treeProvider->getRootNodes($this->getBackendUser());
        }
        return $this->getPreparedItemsForOutput($context->request ?? new ServerRequest(), $items);
    }

    /**
     * Returns the combined identifiers of the folders from the storage root to the folder
     *
     * @param string $identifier Combined identifier of the folder
     * @return array{rootline: list<string>}
     * @throws NotFoundError Folder is not available
     * @throws PermissionDeniedError Folder is not readable for the user
     */
    #[AsAction(
        name: 'filestorage/tree/rootline',
        summary: 'Provide rootline of a folder in the file storage tree',
        scopes: [
            ContentReadScope::class,
        ],
    )]
    public function fetchRootlineAction(string $identifier): array
    {
        try {
            $folder = $this->resourceFactory->getFolderObjectFromCombinedIdentifier($identifier);
        } catch (InsufficientFolderAccessPermissionsException) {
            throw new PermissionDeniedError('Permission denied', 1793350068);
        } catch (FolderDoesNotExistException) {
            throw new NotFoundError('Folder not found', 1793350069);
        }

        $rootline = [];
        while (true) {
            $identifier = $folder->getCombinedIdentifier();
            $rootline[] = $identifier;
            try {
                $parent = $folder->getParentFolder();
            } catch (InsufficientFolderAccessPermissionsException) {
                break;
            }
            if ($parent->getCombinedIdentifier() === $identifier) {
                // parent folder of root folder is the root folder => break
                break;
            }
            $folder = $parent;
        }

        return [
            'rootline' => array_reverse($rootline),
        ];
    }

    /**
     * Used when the search / filter is used.
     *
     * @param string $q Search term
     * @return list<FileTreeItem>
     * @throws \Exception
     */
    #[AsAction(
        name: 'filestorage/tree/filter',
        summary: 'Provide filtered data for file storage tree',
        scopes: [
            ContentReadScope::class,
        ],
    )]
    public function filterDataAction(ActionContext $context, string $q = ''): array
    {
        $foundFolders = $this->treeProvider->getFilteredTree($this->getBackendUser(), $q);

        $items = [];
        foreach ($foundFolders as $folder) {
            if (!$folder instanceof Folder) {
                continue;
            }
            $storage = $folder->getStorage();
            $itemsInRootLine = [];

            // Go back the root folder structure until the root folder
            $nextFolder = $folder;
            $isParent = false;
            do {
                $itemsInRootLine[$nextFolder->getCombinedIdentifier()] = array_merge(
                    $this->treeProvider->prepareFolderInformation($nextFolder),
                    [
                        'expanded' => $isParent,
                        'loaded' => true,
                    ]
                );
                $isParent = true;
                try {
                    $nextFolder = $nextFolder->getParentFolder();
                } catch (InsufficientFolderAccessPermissionsException) {
                    $nextFolder = null;
                }
            } while ($nextFolder instanceof FolderInterface && $nextFolder->getIdentifier() !== '/');
            // Add the storage / sys_filemount itself
            $storageData = $this->treeProvider->prepareFolderInformation(
                $storage->getRootLevelFolder(true),
                $storage->getName()
            );
            $storageData = array_merge($storageData, [
                'depth' => 0,
                'expanded' => true,
            ]);
            $itemsInRootLine[$storage->getUid() . ':/'] = $storageData;

            $itemsInRootLine = array_reverse($itemsInRootLine);
            $depth = 0;
            foreach ($itemsInRootLine as $k => $itm) {
                $itm['depth'] = $depth++;
                $items[$k] = $itm;
            }
        }

        ksort($items);
        $items = array_values($items);
        return $this->getPreparedItemsForOutput($context->request ?? new ServerRequest(), $items);
    }

    /**
     * Adds information for the JSON result to be rendered. Additionally, dispatches event for modification.
     *
     * @return list<FileTreeItem>
     */
    protected function getPreparedItemsForOutput(ServerRequestInterface $request, array $items): array
    {
        foreach ($items as &$item) {
            $folder = $item['resource'];
            $isStorage = $item['recordType'] !== 'sys_file';
            $item['resourceType'] = $isStorage ? 'storage' : 'folder';
            if ($isStorage && !$folder->getStorage()->isOnline()) {
                $item['name'] .= ' (' . $this->getLanguageService()->translate('is_offline', 'core.db.sys_file_storage') . ')';
            }
            $icon = $this->iconFactory->getIconForResource($folder, IconSize::SMALL, null, $isStorage ? ['mount-root' => true] : []);
            $item['icon'] = $icon->getIdentifier();
            $item['overlayIcon'] = $icon->getOverlayIcon() ? $icon->getOverlayIcon()->getIdentifier() : '';

            $tsConfigLabels = $this->getBackendUser()->getTSConfig()['options.']['folderTree.']['label.'] ?? [];
            if (trim($tsConfigLabels[$folder->getCombinedIdentifier() . '.']['label'] ?? '') !== '') {
                $item['labels'][] = new Label(
                    label: $this->getLanguageService()->sL($tsConfigLabels[$folder->getCombinedIdentifier() . '.']['label']),
                    color: (string)($tsConfigLabels[$folder->getCombinedIdentifier() . '.']['color'] ?? '#ff8722'),
                );
            }
        }

        return array_map(
            static function (array $item): FileTreeItem {
                return new FileTreeItem(
                    item: new TreeItem(
                        identifier: $item['identifier'],
                        parentIdentifier: (string)($item['parentIdentifier'] ?? ''),
                        recordType: (string)($item['recordType'] ?? ''),
                        name: (string)($item['name'] ?? ''),
                        prefix: (string)($item['prefix'] ?? ''),
                        suffix: (string)($item['suffix'] ?? ''),
                        tooltip: (string)($item['tooltip'] ?? ''),
                        depth: (int)($item['depth'] ?? 0),
                        hasChildren: (bool)($item['hasChildren'] ?? false),
                        loaded: (bool)($item['loaded'] ?? false),
                        icon: $item['icon'],
                        overlayIcon: $item['overlayIcon'],
                        statusInformation: (array)($item['statusInformation'] ?? []),
                        labels: (array)($item['labels'] ?? []),
                    ),
                    pathIdentifier: (string)($item['pathIdentifier'] ?? ''),
                    storage: (int)($item['storage'] ?? 0),
                    resourceType: $item['resourceType'],
                );
            },
            $this->eventDispatcher->dispatch(
                new AfterFileStorageTreeItemsPreparedEvent($request, $items)
            )->getItems()
        );
    }

    protected function getBackendUser(): BackendUserAuthentication
    {
        return $GLOBALS['BE_USER'];
    }

    protected function getLanguageService(): LanguageService
    {
        return $GLOBALS['LANG'];
    }
}
