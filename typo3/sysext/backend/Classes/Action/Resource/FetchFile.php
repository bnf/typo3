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

use TYPO3\CMS\Backend\Action\Resource\Dto\File as FileDto;
use TYPO3\CMS\Backend\Scope\ContentReadScope;
use TYPO3\CMS\Core\Action\ActionContext;
use TYPO3\CMS\Core\Action\Error\NotFoundError;
use TYPO3\CMS\Core\Action\Error\PermissionDeniedError;
use TYPO3\CMS\Core\Attribute\AsAction;

/**
 * @internal
 */
final readonly class FetchFile
{
    public function __construct(
        private ResourceAccess $resourceAccess,
        private ResourceDtoFactory $resourceDtoFactory,
    ) {}

    /**
     * @param int $uid uid of the file (`sys_file`)
     * @throws NotFoundError File is not available
     * @throws PermissionDeniedError File is not readable for the user
     */
    #[AsAction(
        name: 'files/{uid}',
        tag: 'resource',
        scopes: [
            ContentReadScope::class,
        ],
    )]
    public function perform(int $uid, ActionContext $context): FileDto
    {
        return $this->resourceDtoFactory->createFile($this->resourceAccess->getFile($uid), $context->request);
    }
}
