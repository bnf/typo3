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
use TYPO3\CMS\Core\Attribute\AsAction;
use TYPO3\CMS\Core\Mcp\Enum\JsonRpc;

final readonly class Action
{
    public function __construct(
        private Dispatcher $dispatcher,
    ) {}

    /**
     * @param array<string, mixed> $params
     */
    #[AsAction(
        name: 'mcp',
        tag: 'mcp',
        method: 'POST',
    )]
    public function handle(
        ActionContext $context,
        JsonRpc $jsonrpc,
        string $method,
        int|string|null $id = null,
        array $params = [],
    ): Response|Error|null {
        if ($id === null) {
            $message = new Notification(
                jsonrpc: $jsonrpc,
                method: $method,
                params: $params,
            );
        } else {
            $message = new Request(
                context: $context,
                jsonrpc: $jsonrpc,
                id: $id,
                method: $method,
                params: $params,
            );
        }
        return $this->dispatcher->dispatch($message);
    }
}
