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

namespace TYPO3\CMS\Core\Action\Ai;

use cebe\openapi\Reader;
use cebe\openapi\spec\PathItem;
use cebe\openapi\spec\Schema;
use TYPO3\CMS\Core\Action\ActionRegistry;

/**
 * @internal
 */
final readonly class ToolProvider
{
    /**
     * @var array<string, Tool>
     */
    private array $tools;

    public function __construct(
        private ActionRegistry $actionRegistry,
    ) {
        $this->tools = $this->buildTools();
    }

    /**
     * @return array<string, Tool>
     */
    public function getTools(): array
    {
        return $this->tools;
    }

    public function hasTool(string $shortname): bool
    {
        return array_key_exists($shortname, $this->getTools());
    }

    public function getTool(string $shortname): Tool
    {
        if (!$this->hasTool($shortname)) {
            throw new \RuntimeException('Tool "' . $shortname . '" does not exist.', 1766476300);
        }
        return $this->tools[$shortname];
    }

    /**
     * @return array<string, Tool>
     */
    public function buildTools(): array
    {
        $tools = [];
        foreach ($this->actionRegistry->getItems() as $action) {
            $pathItem = Reader::readFromJson($action['operations'], PathItem::class);
            if (!isset($pathItem->get)) {
                continue;
            }

            $operation = $pathItem->get;
            $properties = [];
            $required = [];
            foreach ($operation->parameters as $parameter) {
                $schema = $parameter->schema ?? $parameter->content['application/json']->schema;
                if ($schema->type === 'object' && ($schema->additionalProperties ?? null) !== false) {
                    if (!$parameter->required) {
                        continue;
                    }
                    // OpenAI tool strict mode can not consume tools that allow arbitrary properties
                    continue 2;
                }
                $properties[$parameter->name] = $schema;
                if ($parameter->required) {
                    $required[] = $parameter->name;
                } else {
                    // OpenAI strict mode requires every parameter to be required
                    // @todo merge `null` as allowed value (or add the default) for optional properties
                    $required[] = $parameter->name;
                }
            }

            $inputSchema = new Schema([
                'type' => 'object',
                'additionalProperties' => false,
                'properties' => $properties,
                'required' => $required,
            ]);

            $response = $operation->responses->getResponse('200');
            $outputSchema = $response->content['application/json']->schema ?? null;

            $shortname = preg_replace('/[^a-zA-Z0-9_-]/', '_', $action['name']);
            $tools[$shortname] = new Tool(
                shortname: $shortname,
                name: $action['name'],
                summary: $action['summary'] ?? '',
                description: $action['description'] ?? '',
                inputSchema: $inputSchema,
                outputSchema: $outputSchema,
                handler: fn(array $arguments): mixed => $this->actionRegistry->invoke($action, $arguments),
            );
        }

        return $tools;
    }
}
