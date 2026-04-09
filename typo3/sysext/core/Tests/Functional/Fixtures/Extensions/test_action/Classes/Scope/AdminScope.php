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

namespace TYPO3Tests\TestAction\Scope;

use Symfony\Component\DependencyInjection\Attribute\AsTaggedItem;
use TYPO3\CMS\Core\Authentication\BackendUserAuthentication;
use TYPO3\CMS\Core\Scope\ScopeInterface;
use TYPO3\CMS\Core\Scope\ScopeUser;

#[AsTaggedItem(index: 'test:admin')]
final class AdminScope implements ScopeInterface
{
    public function getName(): string
    {
        return 'Test scope for admins';
    }

    public function getDescription(): string
    {
        return 'Test scope that is allowed for admins only.';
    }

    public function getIcon(): string
    {
        return 'actions-variable';
    }

    public function allowedForUser(ScopeUser $user): bool
    {
        return $user->user instanceof BackendUserAuthentication
            && $user->user->isAdmin();
    }
}
