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

use Symfony\AI\Agent\Toolbox\ToolboxInterface;
use Symfony\AI\Platform\Result\ToolCall;
use Symfony\AI\Platform\Tool\ExecutionReference;
use Symfony\AI\Platform\Tool\Tool as SymfonyTool;
use Symfony\AI\Agent\Toolbox\ToolResult;

/**
 * @internal
 */
final class SymfonyAiToolProvider implements ToolboxInterface
{
    /**
     * @var array<string, SymfonyTool>
     */
    private array $tools;

    public function __construct(
        private ToolProvider $toolProvider,
    ) {
        $this->tools = $this->buildTools();
    }

    /**
     * @return list<SymfonyTool>
     */
    public function getTools(): array
    {
        return array_values($this->tools);
    }

    public function hasTool(string $shortname): bool
    {
        return array_key_exists($shortname, $this->tools);
    }

    public function execute(ToolCall $call): ToolResult
    {
        $shortname = $call->getName();
        $arguments = $call->getArguments();

        $context = new ToolContext($GLOBALS['BE_USER'], $GLOBALS['LANG'], null);
        if (!$this->hasTool($shortname)) {
            throw new \RuntimeException('Tool "' . $shortname . '" does not exist.', 1771508864);
        }
        return new ToolResult(
            $call,
            ($this->toolProvider->getTool($shortname)->handler)($arguments, $context)
        );
    }

    /**
     * @return array<string, object{name: string, description: string, parameters: object, type: 'function', 'strict': true}>
     */
    public function buildTools(): array
    {
        return array_map(
            fn(Tool $tool): SymfonyTool => new SymfonyTool(
                new ExecutionReference('unusued'),
                $tool->shortname,
                $tool->summary . PHP_EOL . $tool->description,
                (array)$this->postProcessSchema($tool->inputSchema ?? (object)[
                    'type' => 'object',
                    'properties' => (object)[],
                    'additionalProperties' => false,
                ])
            ),
            $this->toolProvider->buildTools(),
        );
    }

    private function postProcessSchema(object|array|float|int|string|bool $schema): object|array|float|int|string|bool
    {
        if (is_array($schema)) {
            return array_map($this->postProcessSchema(...), $schema);
        }

        if (is_object($schema)) {
            if (isset($schema->type) && $schema->type === 'object' && isset($schema->properties)) {
                foreach (get_object_vars($schema->properties) as $property => $value) {
                    if (is_object($value) && (array)$value === []) {
                        // Use `true` instead of `{}`, as OpenAI otherwise errors with:
                        // "Invalid schema for function '…': In context=('properties', …), schema must have a 'type' key."
                        $schema->properties->{$property} = true;
                    }
                }
            }
            if (isset($schema->{'$ref'})) {
                // Remove description sibling from `$ref` nodes, to avoid OpenAI error like:
                // "Invalid schema for function '…': context=(…), $ref cannot have keywords {'description'}."
                unset($schema->description);
            }
            return (object)$this->postProcessSchema((array)$schema);
        }

        return $schema;
    }
}
