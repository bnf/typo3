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

namespace TYPO3\CMS\Backend\Http;

use Symfony\Component\DependencyInjection\Attribute\AutowireServiceClosure;
use TYPO3\CMS\Backend\Routing\UriBuilder;
use TYPO3\CMS\Core\Action\ActionUriGeneratorInterface;

/**
 * Builds absolute URIs to the backend routes of actions
 *
 * @internal
 */
final readonly class ActionUriGenerator implements ActionUriGeneratorInterface
{
    public function __construct(
        // Resolved lazily, as the router configuration depends on the action handler
        #[AutowireServiceClosure(UriBuilder::class)]
        private \Closure $uriBuilder,
    ) {}

    public function generate(string $actionId, array $arguments): string
    {
        return (string)($this->uriBuilder)()->buildUriFromRoute('action:' . $actionId, $arguments, UriBuilder::ABSOLUTE_URL);
    }
}
