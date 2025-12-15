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
        public string $id,
        public ?string $name,
        public ?string $summary,
        public ?string $description,
        public string $type,
        public string $method,
        public ?string $route,
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
    ) {}
}
