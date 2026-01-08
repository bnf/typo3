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

namespace TYPO3\CMS\Dashboard\Scope;

use Symfony\Component\DependencyInjection\Attribute\AsTaggedItem;
use TYPO3\CMS\Backend\Module\ModuleProvider;
use TYPO3\CMS\Core\Authentication\BackendUserAuthentication;
use TYPO3\CMS\Core\Scope\ScopeInterface;
use TYPO3\CMS\Core\Scope\ScopeUser;

#[AsTaggedItem(index: 'dashboard:read', priority: 50)]
final readonly class DashboardReadScope implements ScopeInterface
{
    public function __construct(
        private ModuleProvider $moduleProvider,
    ) {}

    public function getIdentifier(): string
    {
        return 'dashboard:read';
    }

    public function getName(): string
    {
        return 'Dashboard read access';
    }

    public function getDescription(): string
    {
        return 'Retrieve details about your dashboard';
    }

    public function getIcon(): string
    {
        return 'module-dashboard';
    }

    public function allowedForUser(ScopeUser $user): bool
    {
        return $user->user instanceof BackendUserAuthentication
            && $this->moduleProvider->accessGranted('dashboard', $user->user);
    }
}
