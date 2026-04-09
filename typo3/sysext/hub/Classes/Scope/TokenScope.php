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

namespace TYPO3\CMS\Hub\Scope;

use Symfony\Component\DependencyInjection\Attribute\AsTaggedItem;
use TYPO3\CMS\Core\Authentication\BackendUserAuthentication;
use TYPO3\CMS\Core\Scope\ScopeInterface;
use TYPO3\CMS\Core\Scope\ScopeUser;

#[AsTaggedItem(index: 'token:generate', priority: 90)]
class TokenScope implements ScopeInterface
{
    public function getName(): string
    {
        return 'Management of app tokens';
    }

    public function getDescription(): string
    {
        return 'Create tokens for API apps.';
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
