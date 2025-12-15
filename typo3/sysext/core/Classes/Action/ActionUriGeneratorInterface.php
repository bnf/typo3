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
 * Builds the URI under which an action invocation is reachable,
 * e.g. for the `Location` header of a created resource
 *
 * @internal
 */
interface ActionUriGeneratorInterface
{
    /**
     * @param string $actionId identifier of the action, e.g. `records/{schema}/{identifier}:fetch@1`
     * @param array<string, mixed> $arguments arguments of the invocation
     */
    public function generate(string $actionId, array $arguments): string;
}
