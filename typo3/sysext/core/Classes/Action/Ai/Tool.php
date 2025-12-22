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
 * @internal
 */
final readonly class Tool
{
    /**
     * @param list<string> $scopes
     */
    public function __construct(
        public string $shortname,
        public string $summary,
        public \Closure $handler,
        public string $description = '',
        public string $name = '',
        public ?Schema $inputSchema = null,
        public ?Schema $outputSchema = null,
        public bool $isReadOnly = false,
        public bool $isDestructive = true,
        public bool $isIdempotent = false,
        public array $scopes = [],
    ) {}
}
