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

namespace TYPO3\CMS\Backend\Scope;

use Symfony\Component\DependencyInjection\Attribute\AsTaggedItem;
use TYPO3\CMS\Backend\Module\ModuleProvider;
use TYPO3\CMS\Core\Authentication\BackendUserAuthentication;
use TYPO3\CMS\Core\Scope\ScopeInterface;
use TYPO3\CMS\Core\Scope\ScopeUser;

#[AsTaggedItem(index: 'content:write', priority: 90)]
class ContentWriteScope implements ScopeInterface
{
    private const FILE_PERMISSIONS = [
        'addFile', 'writeFile', 'copyFile', 'moveFile', 'renameFile', 'deleteFile',
        'addFolder', 'writeFolder', 'copyFolder', 'moveFolder', 'renameFolder', 'deleteFolder',
    ];

    public function __construct(
        private readonly ContentReadScope $contentReadScope,
        private readonly ModuleProvider $moduleProvider,
    ) {}

    public function getName(): string
    {
        return 'Writable access to content';
    }

    public function getDescription(): string
    {
        return 'Modify pages and content elements.';
    }

    public function getIcon(): string
    {
        return 'content-menu-sitemap-pages';
    }

    /**
     * Content is writable for users with read access to content, that may
     * modify any table, or files in the file module. File permissions alone
     * are not sufficient, as backend users get all of them by default.
     */
    public function allowedForUser(ScopeUser $user): bool
    {
        if (!$user->user instanceof BackendUserAuthentication || !$this->contentReadScope->allowedForUser($user)) {
            return false;
        }
        if ($user->user->isAdmin() || ($user->user->groupData['tables_modify'] ?? '') !== '') {
            return true;
        }
        if (!$this->moduleProvider->accessGranted('media_management', $user->user)) {
            return false;
        }
        $filePermissions = $user->user->getFilePermissions();
        foreach (self::FILE_PERMISSIONS as $permission) {
            if ($filePermissions[$permission] ?? false) {
                return true;
            }
        }
        return false;
    }
}
