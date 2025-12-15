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

namespace TYPO3\CMS\Core\Action;

/**
 * Evaluates the runtime expressions of a link
 *
 * @internal
 */
final readonly class LinkResolver
{
    public function __construct(
        private ActionRegistry $actionRegistry,
    ) {}

    /**
     * Resolve the action and arguments the location of an action invocation refers to
     *
     * @param object $arguments arguments of the invocation, as passed to the action
     * @param mixed $result result of the invocation
     * @return ?array{action: string, arguments: array<string, mixed>}
     * @throws \DomainException if the result lacks a value required by the linked action
     */
    public function resolveLocation(ActionDescriptor $action, object $arguments, mixed $result): ?array
    {
        if ($action->location === null) {
            return null;
        }
        $linkedAction = $this->actionRegistry->getAction($action->location['action']);
        // Pointers refer to the result as serialized for the client
        $result = json_decode(json_encode($result, JSON_THROW_ON_ERROR));
        $linkedArguments = [];
        foreach ($action->location['parameters'] as $name => $expression) {
            $value = $this->evaluate(self::parseExpression($expression), $arguments, $result);
            if ($value !== null) {
                $linkedArguments[$name] = $value;
            } elseif (!$linkedAction->parameters[$name]['optional']) {
                throw new \DomainException(sprintf('Location of action "%s" lacks a value for "%s" (%s)', $action->id, $name, $expression), 1793709234);
            }
        }
        return [
            'action' => $linkedAction->id,
            'arguments' => $linkedArguments,
        ];
    }

    /**
     * @return array{source: 'route'|'query'|'body'|'result', name: ?string, pointer: list<string>}
     * @throws \InvalidArgumentException
     */
    public static function parseExpression(string $expression): array
    {
        if (preg_match('/^\$request\.(path|query)\.([a-zA-Z_][a-zA-Z0-9_]*)$/', $expression, $matches)) {
            return ['source' => $matches[1] === 'path' ? 'route' : 'query', 'name' => $matches[2], 'pointer' => []];
        }
        if (preg_match('/^\$(request|response)\.body#((?:\/[^\/]*)*)$/', $expression, $matches)) {
            $pointer = array_map(
                static fn(string $segment): string => str_replace(['~1', '~0'], ['/', '~'], $segment),
                $matches[2] === '' ? [] : explode('/', substr($matches[2], 1)),
            );
            if ($matches[1] === 'response') {
                return ['source' => 'result', 'name' => null, 'pointer' => $pointer];
            }
            if ($pointer !== []) {
                return ['source' => 'body', 'name' => array_shift($pointer), 'pointer' => $pointer];
            }
        }
        throw new \InvalidArgumentException(sprintf('Unsupported runtime expression "%s"', $expression), 1793709235);
    }

    /**
     * @param array{source: 'route'|'query'|'body'|'result', name: ?string, pointer: list<string>} $expression
     */
    private function evaluate(array $expression, object $arguments, mixed $result): mixed
    {
        $value = $expression['name'] === null ? $result : ($arguments->{$expression['name']} ?? null);
        foreach ($expression['pointer'] as $segment) {
            $value = match (true) {
                is_object($value) => $value->{$segment} ?? null,
                is_array($value) => $value[$segment] ?? null,
                default => null,
            };
        }
        return $value;
    }
}
