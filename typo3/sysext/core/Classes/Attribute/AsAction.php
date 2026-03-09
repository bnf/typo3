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
use TYPO3\CMS\Core\Scope\ScopeInterface;

#[\Attribute(\Attribute::TARGET_METHOD)]
class AsAction
{
    public const TAG_NAME = 'core.action';

    /**
     * @param list<class-string<ScopeInterface>> $scopes
     */
    public function __construct(
        public ActionType $type = ActionType::fetch,
        public ?string $name = null,
        public ?string $summary = null,
        public ?string $description = null,
        public ?string $route = null,
        public ?string $context = null,
        public ?string $ajaxAlias = null,
        public ?string $tag = null,
        //public ?array $meta = null,
        public array $scopes = [],
    ) {}
}
