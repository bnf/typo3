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

/**
 * TODO:
 *  * Define semantics
 *  * Ideally
 *    * Access to pages
 *    * Access to tt_content
 *      * Access to everything that can be inlined in tt_content
 *    => In other words: Access to two aggregate roots: pages & tt_content
 */
#[AsTaggedItem(index: 'content:read', priority: 91)]
class ContentReadScope implements ScopeInterface
{
    private const MODULES = ['web_layout', 'records', 'media_management'];

    public function __construct(
        private readonly ModuleProvider $moduleProvider,
    ) {}

    public function getName(): string
    {
        return 'Read access to content';
    }

    public function getDescription(): string
    {
        return 'Read pages and content elements.';
    }

    public function getIcon(): string
    {
        return 'content-menu-sitemap-pages';
    }

    /**
     * Content is accessible to backend users that may access one of the
     * backend modules for pages, records or files.
     */
    public function allowedForUser(ScopeUser $user): bool
    {
        if (!$user->user instanceof BackendUserAuthentication) {
            return false;
        }
        foreach (self::MODULES as $module) {
            if ($this->moduleProvider->accessGranted($module, $user->user)) {
                return true;
            }
        }
        return false;
    }
}
