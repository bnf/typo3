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

use TYPO3\CMS\Core\Action\ActionContext;
use TYPO3\CMS\Core\Mcp\Enum\JsonRpc;

final readonly class Request
{
    /**
     * @param array<string, mixed> $params
     */
    public function __construct(
        public ActionContext $context,
        public JsonRpc $jsonrpc,
        public int|string $id,
        public string $method,
        public array $params,
    ) {}
}
