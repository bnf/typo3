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

use TYPO3\CMS\Core\JsonSchema\Schema;
use TYPO3\CMS\Core\Scope\ScopeInterface;

/**
 * @internal
 */
final readonly class ActionDescriptor
{
    public function __construct(
        public string $methodName,
        // Identifier usable as OpenAPI operationId and tool name, e.g. `fetch_records_by_schema`
        public string $id,
        public ?string $summary,
        public ?string $description,
        public string $type,
        // @todo remove
        public string $method,
        public string $route,
        public ?string $tag,
        public string $service,

        /** @var array<string, array{optional: bool, schema: Schema, http: array{source: 'route'|'query'|'body', jsonEncoded: bool}}> */
        public array $parameters,
        /** @var list<string> */
        public array $contextParameter,
        public Schema $result,
        /** @var array<class-string<ActionExceptionInterface>, string> */
        public array $errors,

        /** var list<class-string<ScopeInterface>> */
        /** @var list<string> */
        public array $scopes,
        public ?int $version,
        public ?int $deprecated,
        /** @var list<string> */
        public array $targets,
        // Parameter receiving uploaded content (e.g. the raw request body) instead of JSON
        public ?string $contentParameter = null,
        /** @var ?array{action: string, parameters: array<string, string>} */
        public ?array $location = null,
    ) {}

    public function hasTarget(Target $target): bool
    {
        return in_array($target->value, $this->targets, true);
    }

    /**
     * Path of the action below the API prefix, e.g. `v1/records/{schema}`
     */
    public function getPath(): string
    {
        return ($this->version !== null ? 'v' . $this->version . '/' : '') . $this->route;
    }
}
