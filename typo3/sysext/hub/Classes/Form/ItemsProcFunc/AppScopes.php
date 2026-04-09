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

namespace TYPO3\CMS\Hub\Form\ItemsProcFunc;

use Symfony\Component\DependencyInjection\Attribute\Autoconfigure;
use TYPO3\CMS\Core\Scope\ScopeRegistry;

#[Autoconfigure(public: true)]
final readonly class AppScopes
{
    public function __construct(
        private ScopeRegistry $scopeRegistry
    ) {}

    public function provideTcaSelectItems(array &$params): void
    {
        foreach ($this->scopeRegistry as $identifier => $scope) {
            $params['items'][] = [
                'value' => $identifier,
                'label' => $scope->getName(),
                'icon' => $scope->getIcon(),
                'description' => [
                    'title' => $identifier,
                    'description' => $scope->getDescription(),
                ],
            ];
        }
    }
}
