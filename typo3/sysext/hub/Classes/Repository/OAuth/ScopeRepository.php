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

namespace TYPO3\CMS\Hub\Repository\OAuth;

use League\OAuth2\Server\Entities\ClientEntityInterface;
use League\OAuth2\Server\Entities\ScopeEntityInterface;
use League\OAuth2\Server\Repositories\ScopeRepositoryInterface;
use TYPO3\CMS\Hub\Model\Scope;

final readonly class ScopeRepository implements ScopeRepositoryInterface
{
    public function getScopeEntityByIdentifier(string $identifier): ?ScopeEntityInterface
    {
        $scopes = [
            'basic' => [
                'name' => 'Basic',
                'description' => 'Basic details about you',
                'icon' => 'actions-user',
            ],
            'email' => [
                'name' => 'E-Mail Address',
                'description' => 'Your email address',
                'icon' => 'actions-envelope',
            ],
        ];

        if (array_key_exists($identifier, $scopes) === false) {
            return null;
        }

        return new Scope(
            $identifier,
            $scopes[$identifier]['name'],
            $scopes[$identifier]['description'],
            $scopes[$identifier]['icon'],
        );
    }

    /**
     * Given a client, grant type and optional user identifier validate the set of scopes requested are valid and optionally
     * append additional scopes or remove requested scopes.
     *
     * @param ScopeEntityInterface[] $scopes
     *
     * @return ScopeEntityInterface[]
     */
    public function finalizeScopes(
        array $scopes,
        string $grantType,
        ClientEntityInterface $clientEntity,
        ?string $userIdentifier = null,
        ?string $authCodeId = null
    ): array {
        return [
            $this->getScopeEntityByIdentifier('basic'),
            $this->getScopeEntityByIdentifier('email'),
        ];
    }
}
