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

namespace TYPO3\CMS\Backend\Action\Record;

use TYPO3\CMS\Core\Action\ActionContext;
use TYPO3\CMS\Core\Action\Error\PermissionDeniedError;
use TYPO3\CMS\Core\Authentication\BackendUserAuthentication;
use TYPO3\CMS\Core\Context\WorkspaceAspect;

/**
 * Switches the backend user of an action to the workspace requested by the client,
 * without changing the workspace stored for the user.
 *
 * The workspace is kept until the end of the request, as the result of the action
 * is serialized afterwards. Callers invoking several actions with the same user
 * restore the workspace themselves.
 */
final readonly class TemporaryWorkspace
{
    /**
     * @throws PermissionDeniedError
     */
    public function apply(ActionContext $context, ?int $workspace): void
    {
        if ($workspace === null) {
            return;
        }
        $user = $context->principal;
        if (!$user instanceof BackendUserAuthentication || !$user->setTemporaryWorkspace($workspace)) {
            throw new PermissionDeniedError('No access to workspace ' . $workspace, 1793114261);
        }
        $context->context->setAspect('workspace', new WorkspaceAspect($workspace));
    }
}
