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

use TYPO3\CMS\Core\Action\Ai\Tool as AiTool;
use TYPO3\CMS\Core\Action\Ai\ToolProvider;
use TYPO3\CMS\Core\Mcp\Request;
use TYPO3\CMS\Core\Mcp\RequestHandlerInterface;
use TYPO3\CMS\Core\Mcp\Response;

final readonly class Listing implements RequestHandlerInterface
{
    public function __construct(
        private ToolProvider $toolProvider
    ) {}

    public static function getName(): string
    {
        return 'tools/list';
    }

    public function handle(Request $request): Response
    {
        return new Response($request->id, [
            'tools' => array_map(
                static fn(AiTool $tool): object => (object)[
                    'name' => $tool->shortname,
                    'title' => $tool->summary,
                    'description' => $tool->description,
                    'inputSchema' => $tool->inputSchema ?? (object)[
                        'type' => 'object',
                        'properties' => (object)[],
                        'additionalProperties' => false,
                    ],
                    ...($tool->outputSchema === null ? [] : (
                        ($tool->outputSchema->type ?? null) === 'object' ? [
                            'outputSchema' => $tool->outputSchema,
                        ] : [
                            'outputSchema' => [
                                'type' => 'object',
                                'properties' => [
                                    // @todo delete components
                                    'data' => $tool->outputSchema,
                                ],
                                'additionalProperties' => false,
                                'required' => ['data'],
                                '$defs' => $tool->outputSchema->{'$defs'} ?? [],
                            ],
                        ]
                    )),
                ],
                array_values($this->toolProvider->getTools()),
            ),
        ]);
    }
}
