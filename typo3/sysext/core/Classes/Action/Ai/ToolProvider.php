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
use cebe\openapi\spec\Operation;
use cebe\openapi\spec\PathItem;
use cebe\openapi\spec\Schema;
use TYPO3\CMS\Core\Action\ActionContext;
use TYPO3\CMS\Core\Action\ActionRegistry;
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
            //$map = array_fill_keys(array_keys($scopes, true);
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
        foreach ($this->actionRegistry->getItems() as $action) {
            $pathItem = Reader::readFromJson($action['operations'], PathItem::class);
            foreach ($pathItem->getOperations() as $method => $operation) {
                $shortname = $method . '_' . preg_replace(
                    '/[^a-zA-Z0-9_-]/',
                    '_',
                    preg_replace('#/{[^}]+}#', '', $action['name'])
                );

                $properties = [];
                $required = [];
                $usedComponents = [];
                foreach ($operation->parameters as $parameter) {
                    $schema = $parameter->schema ?? $parameter->content['application/json']->schema;
                    if ($schema->type === 'object' && $schema->additionalProperties !== false) {
                        if (!$parameter->required) {
                            continue;
                        }
                        // OpenAI tool strict mode can not consume tools that allow arbitrary properties
                        continue 2;
                    }
                    $usedComponents = [...$usedComponents, ...($schema->{'x-typo3-schemas'} ?? [])];
                    unset($schema->{'x-typo3-schemas'});
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
                    '$schema' => 'https://json-schema.org/draft/2020-12/schema',
                    'type' => 'object',
                    'additionalProperties' => false,
                    'properties' => $properties,
                    'required' => $required,
                    'x-typo3-schemas' => $usedComponents,
                ]);

                $response200 = $operation->responses->getResponse('200');
                $response204 = $operation->responses->getResponse('204');
                if ($response200 !== null) {
                    $outputSchema = $response200->content['application/json']->schema ?? null;
                    $outputSchema->{'$schema'} = 'https://json-schema.org/draft/2020-12/schema';
                } elseif ($response204 !== null) {
                    $outputSchema = new Schema([ 'type' => 'null' ]);
                } else {
                    throw new \InvalidArgumentException('Action does not contain a 200 or 204 response', 1771482039);
                }

                $contextParameter = $operation->{'x-typo3-context'} ?? [];
                $context = fn(ToolContext $toolContext): array => array_map(
                    fn(): ActionContext => new ActionContext(
                        $this->context,
                        $toolContext->principal,
                        $toolContext->languageService,
                        $toolContext->request,
                        $toolContext->scopes,
                    ),
                    array_combine($contextParameter, $contextParameter),
                );
                $tools[$shortname] = new Tool(
                    shortname: $shortname,
                    name: $action['name'],
                    summary: $action['summary'] ?? '',
                    description: $action['description'] ?? '',
                    inputSchema: $this->actionRegistry->provideRefs($inputSchema),
                    outputSchema: $this->actionRegistry->provideRefs($outputSchema),
                    handler: fn(array $arguments, ToolContext $toolContext): mixed => $this->actionRegistry->invoke($action, [
                        ...$arguments,
                        ...$context($toolContext),
                    ]),
                    isReadOnly: $method === 'get',
                    isDestructive: $method === 'delete',
                    isIdempotent: $method === 'put',
                    scopes: $this->getRequiredScopesFromOperation($operation),
                );
            }
        }

        return $tools;
    }

    /**
     * @return list<string>
     */
    private function getRequiredScopesFromOperation(Operation $operation): array
    {
        $scopes = [];
        foreach ($operation->security as $securityRequirement) {
            if (isset($securityRequirement->oauth2)) {
                foreach ($securityRequirement->oauth2 as $scope) {
                    $scopes[] = $scope;
                }
            }
        }
        return $scopes;
    }
}
