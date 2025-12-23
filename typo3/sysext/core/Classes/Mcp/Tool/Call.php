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

namespace TYPO3\CMS\Core\Mcp\Tool;

use TYPO3\CMS\Core\Action\Ai\ToolContext;
use TYPO3\CMS\Core\Action\Ai\ToolProvider;
use TYPO3\CMS\Core\Mcp\Request;
use TYPO3\CMS\Core\Mcp\RequestHandlerInterface;
use TYPO3\CMS\Core\Mcp\Response;

final readonly class Call implements RequestHandlerInterface
{
    public function __construct(
        private ToolProvider $toolProvider
    ) {}

    public static function getName(): string
    {
        return 'tools/call';
    }

    public function handle(Request $request): Response
    {
        $toolName = (string)$request->params['name'];
        $tool = $this->toolProvider->getTool($toolName);
        $arguments = (array)$request->params['arguments'];

        try {
            // @todo validate arguments against json-schema
            $result = ($tool->handler)($arguments, ToolContext::fromActionContext($request->context));
            // @todo validate result against json-schema
            // @todo catch invalid arguments and expose as
            //       -32602 Invalid params (Invalid method parameter(s)).
        } catch (\RuntimeException $e) {
            return new Response($request->id, [
                'content' => [
                    (object)[
                        'type' => 'text',
                        'text' => $e->getMessage(),
                    ],
                ],
                'isError' => true,
            ]);
        }

        if ($tool->outputSchema !== null && $tool->outputSchema->type !== 'object') {
            $result = ['data' => $result];
        }

        return new Response($request->id, [
            // We only support MCP v2025-06-18, therefore no BC compatible `content`
            // result is returned here. That would look like:
            //   'content' => [(object)['type' => 'text', 'text' => json_encode($result)],
            'structuredContent' => $result,
        ]);
    }
}
