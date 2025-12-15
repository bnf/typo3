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
 * Reference from the result of an action to another action, modelled
 * after the OpenAPI link object
 *
 * The parameters of the linked action are filled by runtime expressions:
 * `$request.path.<name>`, `$request.query.<name>` and `$request.body#/<name>`
 * refer to arguments of the linking action, `$response.body#/<pointer>` to
 * a value of its result (JSON pointer).
 */
final readonly class Link
{
    /**
     * @param array{class-string, string} $action class and method name of the linked action, e.g. `[FetchRecord::class, 'perform']`
     * @param array<string, string> $parameters runtime expressions by parameter name of the linked action
     */
    public function __construct(
        public array $action,
        public array $parameters = [],
    ) {}
}
