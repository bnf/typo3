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

use cebe\openapi\spec\Schema;

/**
 * @internal
 */
final readonly class Tool
{
    public function __construct(
        public string $shortname,
        public string $summary,
        public \Closure $handler,
        public string $description = '',
        public string $name = '',
        public ?Schema $inputSchema = null,
        public ?Schema $outputSchema = null,
    ) {}
}
