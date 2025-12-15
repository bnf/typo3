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

namespace TYPO3\CMS\Core\Attribute;

use TYPO3\CMS\Core\Action\ActionType;
use TYPO3\CMS\Core\Action\Link;
use TYPO3\CMS\Core\Action\Target;
use TYPO3\CMS\Core\Scope\ScopeInterface;

#[\Attribute(\Attribute::TARGET_METHOD)]
class AsAction
{
    public const TAG_NAME = 'core.action';

    /**
     * @param string $route path of the action below the API prefix and version, e.g. `records/{schema}`; placeholders denote route parameters
     * @param ?string $id identifier of the action, used e.g. as OpenAPI operationId and tool name; derived from type, route and version if omitted
     * @param list<class-string<ScopeInterface>> $scopes
     * @param ?int $version API version of the action, part of its path (e.g. `/v1/…`); `null` for unversioned protocol endpoints
     * @param ?int $deprecated unix timestamp of the deprecation of this action
     * @param ?list<Target> $targets channels through which the action is offered, `null` for all
     * @param ?Link $location action providing the resource created by a `create` action, announced as `Location`
     */
    public function __construct(
        public string $route,
        public ActionType $type = ActionType::fetch,
        public ?string $id = null,
        public ?string $summary = null,
        public ?string $description = null,
        public ?string $tag = null,
        public array $scopes = [],
        public ?int $version = 1,
        public ?int $deprecated = null,
        public ?array $targets = null,
        public ?Link $location = null,
    ) {}
}
