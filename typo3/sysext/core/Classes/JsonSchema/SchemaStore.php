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

namespace TYPO3\CMS\Core\JsonSchema;

final class SchemaStore implements \JsonSerializable
{
    /**
     * @param array<string, Schema> $schemas
     * @param array<string, array{className: string, title: string, templates: array<string, string>, schema: ?Schema}> $dynamicSchemas
     */
    public function __construct(
        private array $schemas = [],
        private array $dynamicSchemas = [],
        private ?DynamicSchemaProviderRegistry $dynamicSchemaProviderRegistry = null,
    ) {}

    public function isEmpty(): bool
    {
        return $this->getIdentifiers() === [];
    }

    public function has(string $schema): bool
    {
        return array_key_exists($schema, $this->schemas) || array_key_exists($schema, $this->dynamicSchemas);
    }

    public function get(string $schema): Schema
    {
        if (isset($this->schemas[$schema])) {
            return $this->schemas[$schema];
        }
        if ($this->dynamicSchemaProviderRegistry?->has($schema)) {
            return $this->dynamicSchemaProviderRegistry->get($schema)->getSchema($this);
        }
        // Subschemas of dynamic providers are added to the store while the provider builds its schema
        foreach ($this->dynamicSchemaProviderRegistry ?? [] as $dynamicSchemaProvider) {
            if (in_array($schema, $dynamicSchemaProvider->getProvidedSchemas(), true)) {
                $dynamicSchemaProvider->getSchema($this);
                if (isset($this->schemas[$schema])) {
                    return $this->schemas[$schema];
                }
            }
        }
        throw new \InvalidArgumentException('Schema "' . $schema . '" not available', 1775546876);
    }

    public function set(string $schemaName, Schema $schema): void
    {
        $this->schemas[$schemaName] = $schema;
    }

    /**
     * @param array<string, string> $templates
     */
    public function defineDynamic(string $schemaName, string $className, string $title, array $templates): void
    {
        $this->dynamicSchemas[$schemaName] = [
            'className' => $className,
            'title' => $title,
            'templates' => $templates,
            'schema' => null,
        ];
    }

    public function getStatic(): array
    {
        return $this->schemas;
    }

    public function getIdentifiers(): array
    {
        $runtimeIdentifiers = [];
        if ($this->dynamicSchemaProviderRegistry !== null) {
            foreach ($this->dynamicSchemaProviderRegistry as $dynamicSchemaProvider) {
                $runtimeIdentifiers = [
                    ...$runtimeIdentifiers,
                    ...$dynamicSchemaProvider->getProvidedSchemas(),
                ];
            }
        }
        return array_unique([
            ...array_keys($this->getStatic()),
            ...array_keys($this->getDynamic()),
            ...$runtimeIdentifiers,
        ]);
    }

    /**
     * @return array<string, array{className: string, title: string, templates: array<string, string>, schema: ?Schema}> $dynamicSchemas
     */
    public function getDynamic(): array
    {
        return $this->dynamicSchemas;
    }

    public function jsonSerialize(): object
    {
        return (object)$this->schemas;
    }
}
