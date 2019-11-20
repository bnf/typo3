<?php
declare(strict_types = 1);

namespace TYPO3\CMS\Core\Core;

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

/**
 * This class has only been introduced to make the request id globally availbale, even via
 * dependency injection. This class is only to be used directly in \TYPO3\CMS\Core\Core\Bootstrap
 * and by the object container as a pseudo factory.
 *
 * @internal
 */
final class RequestId
{
    /**
     * @var string
     */
    private static $requestId;

    private function __construct()
    {
    }

    public static function get(): string
    {
        if (self::$requestId === null) {
            self::$requestId = substr(md5(uniqid('', true)), 0, 13);
        }

        return self::$requestId;
    }
}
