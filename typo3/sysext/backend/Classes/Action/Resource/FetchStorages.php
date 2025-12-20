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

use TYPO3\CMS\Backend\Action\Resource\Dto\Mount;
use TYPO3\CMS\Backend\Action\Resource\Dto\Storage;
use TYPO3\CMS\Backend\Scope\ContentReadScope;
use TYPO3\CMS\Core\Action\ActionContext;
use TYPO3\CMS\Core\Attribute\AsAction;
use TYPO3\CMS\Core\Authentication\BackendUserAuthentication;
use TYPO3\CMS\Core\Resource\Folder;
use TYPO3\CMS\Core\Resource\ResourceStorage;

/**
 * @internal
 */
final readonly class FetchStorages
{
    public function __construct(
        private ResourceDtoFactory $resourceDtoFactory,
    ) {}

    /**
     * Provides the file storages of the user with their entry folders
     *
     * @return array{items: list<Storage>}
     */
    #[AsAction(
        name: 'storages',
        tag: 'resource',
        scopes: [
            ContentReadScope::class,
        ],
    )]
    public function perform(ActionContext $context): array
    {
        $user = $context->principal;
        if (!$user instanceof BackendUserAuthentication) {
            return ['items' => []];
        }
        $items = [];
        foreach ($user->getFileStorages() as $storage) {
            $mounts = $this->getMounts($storage, $user);
            if ($mounts !== []) {
                $items[] = new Storage($storage->getUid(), $storage->getName(), $mounts);
            }
        }
        return ['items' => $items];
    }

    /**
     * @return list<Mount>
     */
    private function getMounts(ResourceStorage $storage, BackendUserAuthentication $user): array
    {
        $mounts = [];
        foreach ($storage->getFileMounts() as $fileMount) {
            if (($fileMount['folder'] ?? null) instanceof Folder) {
                $mounts[] = new Mount((string)$fileMount['title'], $this->resourceDtoFactory->createFolder($fileMount['folder']));
            }
        }
        if ($mounts === [] && $user->isAdmin()) {
            $mounts[] = new Mount($storage->getName(), $this->resourceDtoFactory->createFolder($storage->getRootLevelFolder()));
        }
        return $mounts;
    }
}
