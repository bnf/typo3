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

use TYPO3\CMS\Core\JsonSchema\Schema;

/**
 * @phpstan-type OpenAiTool object{name: string, description: string, parameters: object, type: 'function', 'strict': bool, handler: \Closure}
 * @internal
 */
final class OpenAiToolProvider
{
    /**
     * @var array<string, OpenAiTool>
     */
    private array $tools;

    public function __construct(
        private ToolProvider $toolProvider,
    ) {
        $this->tools = $this->buildTools();
    }

    /**
     * @return list<OpenAiTool>
     */
    public function getTools(): array
    {
        return array_values($this->tools);
    }

    public function hasTool(string $shortname): bool
    {
        return array_key_exists($shortname, $this->tools);
    }

    public function callTool(string $shortname, array|object $arguments, ToolContext $context): mixed
    {
        if (!$this->hasTool($shortname)) {
            throw new \RuntimeException('Tool "' . $shortname . '" does not exist.', 1768335430);
        }
        ($this->tools[$shortname]->handler)($arguments, $context);
        return $this->tools[$shortname];
    }

    /**
     * @return array<string, OpenAiTool>
     */
    public function buildTools(): array
    {
        return array_map($this->processTool(...), $this->toolProvider->buildTools());
    }

    /**
     * @return OpenAiTool
     */
    private function processTool(Tool $tool): object
    {
        $meta = (object)['strict' => true];
        $schema = $this->postProcessSchema($tool->inputSchema, $meta);
        return (object)[
            'type' => 'function',
            'strict' => $meta->strict,
            'name' => $tool->shortname,
            'description' => $tool->summary . PHP_EOL . $tool->description,
            'parameters' => $schema,
            'handler' => $tool->handler,
        ];
    }

    private function postProcessSchema(object|array|float|int|string|bool $schema, object $meta): object|array|float|int|string|bool
    {
        if ($schema instanceof Schema) {
            $schema = $schema->toPlainObject();
        }
        if (is_array($schema)) {
            return array_map(fn ($schema) => $this->postProcessSchema($schema, $meta), $schema);
        }

        if (is_object($schema)) {
            if (isset($schema->type) && $schema->type === 'object') {
                if (isset($schema->additionalProperties) && $schema->additionalProperties !== false) {
                    $meta->strict = false;
                }
                if (isset($schema->properties)) {
                    $properties = get_object_vars($schema->properties);
                    if (count($properties) !== count($schema->required ?? [])) {
                        $meta->strict = false;
                    }
                    foreach ($properties as $property => $value) {
                        if (is_object($value) && (array)$value === []) {
                            // Use `true` instead of `{}`, as OpenAI otherwise errors with:
                            // "Invalid schema for function '…': In context=('properties', …), schema must have a 'type' key."
                            $schema->properties->{$property} = true;
                        }
                    }
                }
            }
            if (isset($schema->{'$ref'})) {
                // Remove description sibling from `$ref` nodes, to avoid OpenAI error like:
                // "Invalid schema for function '…': context=(…), $ref cannot have keywords {'description'}."
                unset($schema->description);
            }
            return (object)$this->postProcessSchema((array)$schema, $meta);
        }

        return $schema;
    }
}
