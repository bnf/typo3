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

use Symfony\Component\DependencyInjection\Attribute\Autoconfigure;
use Symfony\Component\DependencyInjection\ServiceLocator;
use TYPO3\CMS\Core\JsonSchema\Schema;
use TYPO3\CMS\Core\JsonSchema\SchemaStore;

/**
 * @internal
 */
#[Autoconfigure(public: true)]
final readonly class ActionRegistry
{
    /**
     * @param ServiceLocator<ActionDescriptor> $actions
     */
    public function __construct(
        private ServiceLocator $actions,
        private SchemaStore $schemas,
    ) {}

    /**
     * @return list<string>
     */
    public function listSchemas(): array
    {
        return array_keys($this->schemas->getStatic());
        /*
        return [
            ...array_keys($this->schemas->getStatic()),
            ...array_keys($this->schemas->getDynamic()),
        ];
        */
    }

    public function getSchema(string $identifier): Schema
    {
        return $this->schemas->get($identifier);
    }

    /**
     * @return iterable<ActionDescriptor>
     */
    public function getRoutes(string $context): iterable
    {
        return $this->actions;
    }

    /**
     * @return iterable<ActionDescriptor>
     */
    public function getActions(): iterable
    {
        return $this->actions;
    }

    public function hasAction(string $id): bool
    {
        return $this->actions->has($id);
    }

    public function getAction(string $id): ActionDescriptor
    {
        return $this->actions->get($id);
    }

    public function getActionInputSchema(ActionDescriptor|string $action, bool $provideRefs = true): Schema
    {
        if (is_string($action)) {
            $action = $this->getAction($action);
        }
        $properties = [];
        $required = [];
        foreach ($action->parameters as $name => $parameter) {
            $properties[$name] = $parameter['schema'];
            if (!$parameter['optional']) {
                $required[] = $name;
            }
        }
        $schema = new Schema(
            type: 'object',
            properties: $properties,
            required: $required,
            additionalProperties: false,
        );
        if ($provideRefs) {
            $schema = $this->provideRefs($schema);
        }
        return $schema;
    }

    public function getActionOutputSchema(ActionDescriptor|string $action, bool $provideRefs = true): Schema
    {
        if (is_string($action)) {
            $action = $this->getAction($action);
        }
        $schema = $action->result;
        if ($provideRefs) {
            $schema = $this->provideRefs($schema);
        }
        return $schema;
    }

    public function provideRefs(Schema $schema): Schema
    {
        return $schema->with(['store' => $this->schemas]);
    }
}
