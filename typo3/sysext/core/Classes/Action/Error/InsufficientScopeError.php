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

namespace TYPO3\CMS\Core\Action\Error;

/**
 * The action requires a scope that has not been granted to the caller,
 * e.g. for the specific record that is accessed
 */
class InsufficientScopeError extends PermissionDeniedError
{
    public function __construct(
        string $message,
        int $code,
        public readonly string $scope,
        ?\Throwable $previous = null,
    ) {
        parent::__construct($message, $code, $previous);
    }
}
