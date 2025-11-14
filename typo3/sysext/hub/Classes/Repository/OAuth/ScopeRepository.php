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
use TYPO3\CMS\Core\Scope\ScopeRegistry;
use TYPO3\CMS\Core\Scope\ScopeUser;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Hub\Authentication\AppUserAuthentication;
use TYPO3\CMS\Hub\Model\Client;
use TYPO3\CMS\Hub\Model\Scope;

final readonly class ScopeRepository implements ScopeRepositoryInterface
{
    public function __construct(
        private ScopeRegistry $scopeRegistry
    ) {}

    public function getScopeByIdentifier(string $identifier): ?Scope
    {
        if (!$this->scopeRegistry->has($identifier)) {
            return null;
        }

        return Scope::create($identifier, $this->scopeRegistry->get($identifier));
    }

    public function getScopeEntityByIdentifier(string $identifier): ?ScopeEntityInterface
    {
        return $this->getScopeByIdentifier($identifier);
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
        ClientEntityInterface $client,
        ?string $userIdentifier = null,
        ?string $authCodeId = null
    ): array {
        $user = null;
        if ($userIdentifier !== null) {
            $parts = explode(':', $userIdentifier, 2);
            if ($parts[0] !== 'be_users' || ($parts[1] ?? null) === null) {
                throw new \LogicException('Only backend users are supported for the API yet.', 1772203586);
            }
            $id = (int)$parts[1];
            if (($GLOBALS['BE_USER']->user['uid'] ?? null) === $id) {
                $beuser = $GLOBALS['BE_USER'];
            } else {
                $beuser = GeneralUtility::makeInstance(AppUserAuthentication::class, null, $id);
                $beuser->doStart();
            }
            $user = new ScopeUser($beuser);
        }

        $requestedScopes = [];
        foreach ($scopes as $scope) {
            $requestedScopes[$scope->getIdentifier()] = true;
        }

        $clientScopes = array_fill_keys($client instanceof Client ? $client->getScopes() : [], true);

        $scopes = [];
        // Create a new array based on the input to ensure that ordering reflects
        // the priority defined in scope priorities.
        foreach ($this->scopeRegistry as $identifier => $scope) {
            if (!isset($requestedScopes[$identifier])) {
                continue;
            }

            if ($user !== null && !$scope->allowedForUser($user)) {
                continue;
            }

            if (!isset($clientScopes[$identifier])) {
                // @todo respond with an error since the client requested invalid scopes?
                continue;
            }

            // @todo fetch sys_app and compare with allowed scopes for
            // that client
            // @todo actually add scope support to sys_app

            $scopes[] = Scope::create($identifier, $scope);
        }

        return $scopes;
    }
}
