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

namespace TYPO3\CMS\Core\Mcp;

use Symfony\Component\DependencyInjection\Attribute\AsTaggedItem;
use TYPO3\CMS\Core\Scope\ScopeInterface;
use TYPO3\CMS\Core\Scope\ScopeUser;

#[AsTaggedItem(index: 'mcp', priority: 1)]
final readonly class McpScope implements ScopeInterface
{
    public function getIdentifier(): string
    {
        return 'mcp';
    }

    public function getName(): string
    {
        return 'Model Context Protocol';
    }

    public function getDescription(): string
    {
        return 'Allow chatbot to interract with TYPO3';
    }

    public function getIcon(): string
    {
        return 'actions-chat';
    }

    public function allowedForUser(ScopeUser $user): bool
    {
        return true;
    }
}
