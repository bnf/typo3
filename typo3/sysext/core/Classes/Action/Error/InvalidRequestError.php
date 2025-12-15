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

use TYPO3\CMS\Core\Action\ActionException;

/**
 * Thrown if parameters of a request are missing or invalid
 */
class InvalidRequestError extends ActionException
{
    /**
     * @param list<array<string, string>> $errors Each with a `detail` and the `pointer` (request body)
     *        or `parameter` (query or path) of the invalid value
     */
    public function __construct(
        string $message,
        int $code,
        public readonly array $errors = [],
        ?\Throwable $previous = null,
    ) {
        parent::__construct($message, $code, $previous);
    }

    public static function getHttpStatusCode(): int
    {
        return 400;
    }
}
