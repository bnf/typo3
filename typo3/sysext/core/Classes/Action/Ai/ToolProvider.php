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

use TYPO3\CMS\Core\Action\ActionContext;
use TYPO3\CMS\Core\Action\ActionRegistry;
use TYPO3\CMS\Core\Context\Context;
use TYPO3\CMS\Core\JsonSchema\Schema;

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
        private Context $context,
    ) {
        $this->tools = $this->buildTools();
    }

    /**
     * @param list<string> $scopes
     * @return array<string, Tool>
     */
    public function getTools(?array $scopes = null): array
    {
        if ($scopes !== null) {
            $map = array_fill_keys($scopes, true);
            $tools = [];
            foreach ($this->tools as $name => $tool) {
                foreach ($tool->scopes as $scope) {
                    if (!isset($map[$scope])) {
                        continue 2;
                    }
                }
                $tools[$name] = $tool;
            }
            return $tools;
        }
        return $this->tools;
    }

    public function hasTool(string $shortname, ?array $scopes): bool
    {
        return array_key_exists($shortname, $this->getTools($scopes));
    }

    public function getTool(string $shortname, ?array $scopes): Tool
    {
        $tools = $this->getTools($scopes);
        if (!array_key_exists($shortname, $tools)) {
            throw new \RuntimeException('Tool "' . $shortname . '" does not exist.', 1766476300);
        }
        return $tools[$shortname];
    }

    /**
     * @return array<string, Tool>
     */
    public function buildTools(): array
    {
        $tools = [];
        foreach ($this->actionRegistry->getActions() as $action) {
            $method = strtolower($action->method);
            $shortname = $method . '_' . preg_replace(
                '/[^a-zA-Z0-9_-]/',
                '_',
                preg_replace('#/{[^}]+}#', '', $action->name)
            );

            while (isset($tools[$shortname])) {
                $shortname .= '_';
            }

            $properties = [];
            $required = [];
            foreach ($action->parameters as $name => $parameter) {
                $schema = $parameter['schema'];
                if ($schema->type === 'object' && $schema->additionalProperties !== false) {
                    if ($parameter['optional']) {
                        // Skip parameter if optional, since OpenAI can not use these
                        continue;
                    }
                    // OpenAI tool strict mode can not consume tools that allow arbitrary properties
                    continue 2;
                }
                $properties[$name] = $schema;
                if (!$parameter['optional']) {
                    $required[] = $name;
                } else {
                    // OpenAI strict mode requires every parameter to be required
                    // @todo merge `null` as allowed value (or add the default) for optional properties
                    $required[] = $name;
                }
            }

            $inputSchema = new Schema(
                //'$schema' => 'https://json-schema.org/draft/2020-12/schema',
                type: 'object',
                additionalProperties: false,
                properties: $properties,
                required: $required,
            );

            $outputSchema = $action->result;

            $context = fn(ToolContext $toolContext): array => array_fill_keys(
                $action->contextParameter,
                new ActionContext(
                    $this->context,
                    $toolContext->principal,
                    $toolContext->translator,
                    $toolContext->request,
                    $toolContext->scopes,
                ),
            );
            $tools[$shortname] = new Tool(
                shortname: $shortname,
                name: $action->name,
                summary: $action->summary ?? '',
                description: $action->description ?? '',
                inputSchema: $this->actionRegistry->provideRefs($inputSchema),
                outputSchema: $this->actionRegistry->provideRefs($outputSchema),
                handler: fn(array $arguments, ToolContext $toolContext): mixed => $this->actionRegistry->invoke($action, [
                    ...$arguments,
                    ...$context($toolContext),
                ]),
                isReadOnly: $method === 'get',
                isDestructive: $method === 'delete',
                isIdempotent: $method === 'put',
                scopes: $action->scopes,
            );
        }

        return $tools;
    }
}
