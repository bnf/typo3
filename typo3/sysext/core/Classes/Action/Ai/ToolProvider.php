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

use TYPO3\CMS\Core\Action\ActionInvoker;
use TYPO3\CMS\Core\Action\ActionRegistry;
use TYPO3\CMS\Core\Action\ActionType;
use TYPO3\CMS\Core\Context\Context;

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
        private ActionInvoker $actionInvoker,
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
            // @todo generalize "protocol" level selection in action descriptor
            if (in_array('mcp', $action->scopes, true)) {
                continue;
            }

            $shortname = $action->type . '_' . preg_replace(
                '/[^a-zA-Z0-9_]/',
                '_',
                preg_replace('#/{([^}]+)}#', '_by_\1', $action->name)
            );

            $type = ActionType::from($action->type);
            $tools[$shortname] = new Tool(
                shortname: $shortname,
                name: $action->name,
                summary: $action->summary,
                description: $action->description,
                inputSchema: $this->actionRegistry->getActionInputSchema($action)->toPlainObject(),
                outputSchema: $this->actionRegistry->getActionOutputSchema($action),
                handler: fn(array|object $arguments, ToolContext $toolContext): mixed => $this->actionInvoker->invoke(
                    $action->id,
                    (object)$arguments,
                    $toolContext->toActionContext($this->context),
                ),
                isReadOnly: $type->isReadOnly(),
                isDestructive: $type->isDestructive(),
                isIdempotent: $type->isIdempotent(),
                scopes: $action->scopes,
            );
        }

        return $tools;
    }
}
