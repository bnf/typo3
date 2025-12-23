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

use TYPO3\CMS\Core\Mcp\Enum\JsonRpc;

final readonly class Error
{
    /**
     * @param array{
     *   code: int,
     *   message: string,
     *   data?: mixed
     * } $error
     */
    public function __construct(
        public int|string $id,
        public array $error,
        public JsonRpc $jsonrpc = JsonRpc::VERSION20,
    ) {}
}
