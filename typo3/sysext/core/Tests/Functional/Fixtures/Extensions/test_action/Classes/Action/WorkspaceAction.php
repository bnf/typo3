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

namespace TYPO3Tests\TestAction\Action;

use TYPO3\CMS\Core\Action\ActionContext;
use TYPO3\CMS\Core\Attribute\AsAction;
use TYPO3\CMS\Core\Authentication\BackendUserAuthentication;
use TYPO3\CMS\Core\Context\WorkspaceAspect;

/**
 * Switches to a temporary workspace like the record actions do and
 * returns the workspace that was active before.
 */
final readonly class WorkspaceAction
{
    #[AsAction(
        name: 'test/workspace',
    )]
    public function switch(ActionContext $context, int $workspace): string
    {
        $user = $context->principal;
        $previous = ($user instanceof BackendUserAuthentication ? $user->workspace : '-') . ':' . $context->context->getPropertyFromAspect('workspace', 'id');
        if ($user instanceof BackendUserAuthentication) {
            $user->workspace = $workspace;
        }
        $context->context->setAspect('workspace', new WorkspaceAspect($workspace));
        return $previous;
    }
}
