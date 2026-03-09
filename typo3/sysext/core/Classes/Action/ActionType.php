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

namespace TYPO3\CMS\Core\Action;

enum ActionType: string
{
    case fetch = 'fetch';
    case create = 'create';
    case replace = 'replace';
    case update = 'update';
    case delete = 'delete';
    case dispatch = 'dispatch';

    public function isReadOnly(): bool
    {
        return $this === self::fetch;
    }

    public function isDestructrive(): bool
    {
        return $this === self::delete || $this === self::dispatch;
    }

    public function isIdempotent(): bool
    {
        return $this === self::replace;
    }

    public function getHttpVerb(): string
    {
        return match($this) {
            self::fetch => 'GET',
            self::create, self::dispatch => 'POST',
            self::replace => 'PUT',
            self::update => 'PATCH',
            self::delete => 'DELETE',
        };
    }
}
