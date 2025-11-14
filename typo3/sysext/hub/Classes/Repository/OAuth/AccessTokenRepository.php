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

use League\OAuth2\Server\Entities\AccessTokenEntityInterface;
use League\OAuth2\Server\Entities\ClientEntityInterface;
use League\OAuth2\Server\Entities\ScopeEntityInterface;
use League\OAuth2\Server\Exception\UniqueTokenIdentifierConstraintViolationException;
use League\OAuth2\Server\Repositories\AccessTokenRepositoryInterface;
use TYPO3\CMS\Core\Database\Connection;
use TYPO3\CMS\Core\Database\ConnectionPool;
use TYPO3\CMS\Hub\Model\AccessToken;

final readonly class AccessTokenRepository implements AccessTokenRepositoryInterface
{
    private const TABLE_NAME = 'sys_oauth_access_token';

    public function __construct(
        private ConnectionPool $connectionPool,
    ) {}

    /**
     * @param list<ScopeEntityInterface> $scopes
     */
    public function getNewToken(
        ClientEntityInterface $client,
        array $scopes,
        ?string $userIdentifier = null
    ): AccessTokenEntityInterface {
        $token = new AccessToken();
        $token->setClient($client);
        foreach ($scopes as $scope) {
            $token->addScope($scope);
        }
        $token->setUserIdentifier($userIdentifier === null ? '' : $userIdentifier);
        return $token;
    }

    public function persistNewAccessToken(AccessTokenEntityInterface $accessToken): void
    {
        $data = [
            'identifier' => $accessToken->getIdentifier(),
            'expiry_date' => $accessToken->getExpiryDateTime(),
            'client_identifier' => $accessToken->getClient()->getIdentifier(),
            'user_identifier' => $accessToken->getUserIdentifier(),
            'revoked' => false,
            'scopes' => json_encode(array_values($accessToken->getScopes())),
        ];

        $result = $this->connectionPool->getConnectionForTable(self::TABLE_NAME)->insert(
            self::TABLE_NAME,
            $data,
        );

        if ($result !== 1) {
            throw UniqueTokenIdentifierConstraintViolationException::create();
        }
    }

    public function isAccessTokenRevoked(string $tokenId): bool
    {
        $queryBuilder = $this->connectionPool->getQueryBuilderForTable(self::TABLE_NAME);
        $queryBuilder->getRestrictions()->removeAll();

        $count = (int)$queryBuilder
            ->count('*')
            ->from(self::TABLE_NAME)
            ->where(
                $queryBuilder->expr()->eq(
                    'identifier',
                    $queryBuilder->createNamedParameter($tokenId, Connection::PARAM_STR)
                ),
                $queryBuilder->expr()->eq('revoked', 1),
            )
            ->executeQuery()
            ->fetchOne();

        return $count === 1;
    }

    public function revokeAccessToken(string $tokenId): void
    {
        // @todo add error handling
        $this->connectionPool->getConnectionForTable(self::TABLE_NAME)->update(
            self::TABLE_NAME,
            ['revoked' => true],
            ['identifier' => $tokenId]
        );
    }
}
