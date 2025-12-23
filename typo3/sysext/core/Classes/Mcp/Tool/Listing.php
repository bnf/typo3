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

use Symfony\Component\DependencyInjection\Attribute\AsTaggedItem;
use TYPO3\CMS\Core\Action\Ai\Tool as AiTool;
use TYPO3\CMS\Core\Action\Ai\ToolProvider;
use TYPO3\CMS\Core\JsonSchema\Schema;
use TYPO3\CMS\Core\Mcp\Request;
use TYPO3\CMS\Core\Mcp\RequestHandlerInterface;
use TYPO3\CMS\Core\Mcp\Response;

#[AsTaggedItem(index: 'tools/list')]
final readonly class Listing implements RequestHandlerInterface
{
    public function __construct(
        private ToolProvider $toolProvider
    ) {}

    public function handle(Request $request): Response
    {
        return new Response($request->id, [
            'tools' => array_map(
                fn(AiTool $tool): object => (object)[
                    'name' => $tool->shortname,
                    'title' => $tool->summary,
                    'description' => $tool->description,
                    'inputSchema' => $tool->inputSchema ?? (object)[
                        'type' => 'object',
                        'properties' => (object)[],
                        'additionalProperties' => false,
                    ],
                    ...($tool->outputSchema === null ? [] : [
                        'outputSchema' => $this->ensureSchemaIsTypeObject($tool->outputSchema),
                    ]),
                    'annotations' => [
                        'readOnlyHint' => $tool->isReadOnly,
                        'destructiveHint' => $tool->isDestructive,
                        'idempotentHint' => $tool->isIdempotent,
                    ],
                ],
                array_values(
                    $this->toolProvider->getTools(
                        array_filter(
                            array_keys($request->context->scopes),
                            static fn(string $scope): bool => $scope !== 'mcp',
                        ),
                    )
                ),
            ),
        ]);
    }

    private function ensureSchemaIsTypeObject(Schema $schema): Schema|array
    {
        if ($schema->type === 'object') {
            return $schema;
        }

        $schemaData = $schema->toPlainObject();
        unset($schemaData->{'$defs'});
        return [
            'type' => 'object',
            'properties' => [
                // @todo delete components
                'data' => $schema->type === 'null'
                    // @todo see note in Tool/Call regarding "OK" response
                    ? ['type' => 'string', 'enum' => ['OK']]
                    : $schemaData,
            ],
            'additionalProperties' => false,
            'required' => ['data'],
            '$defs' => $schema->defs ?? [],
        ];
    }
}
