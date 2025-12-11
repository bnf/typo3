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

namespace TYPO3\CMS\Core\Scope;

use Symfony\Component\DependencyInjection\Attribute\AsTaggedItem;
use TYPO3\CMS\Core\Authentication\BackendUserAuthentication;

/**
 * Administrative tasks, like access to records of tables that are
 * restricted to administrators (`adminOnly`), e.g. backend users
 */
#[AsTaggedItem(index: self::IDENTIFIER, priority: 80)]
class AdminScope implements ScopeInterface
{
    public const IDENTIFIER = 'admin';

    public function getName(): string
    {
        return 'Administrative tasks';
    }

    public function getDescription(): string
    {
        return 'Perform tasks restricted to administrators, like managing backend users.';
    }

    public function getIcon(): string
    {
        return 'status-user-admin';
    }

    public function allowedForUser(ScopeUser $user): bool
    {
        return $user->user instanceof BackendUserAuthentication
            && $user->user->isAdmin();
    }
}
