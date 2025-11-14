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

use TYPO3\CMS\Hub\Model\AccessToken;
use TYPO3\CMS\Core\Database\Connection;
use TYPO3\CMS\Core\Database\ConnectionPool;
use TYPO3\CMS\Core\Database\Query\QueryBuilder;
use Illuminate\Database\Eloquent\Builder;
use League\OAuth2\Server\Entities\AccessTokenEntityInterface;
use League\OAuth2\Server\Entities\ClientEntityInterface;
use League\OAuth2\Server\Entities\ScopeEntityInterface;
use League\OAuth2\Server\Repositories\AccessTokenRepositoryInterface;
use League\OAuth2\Server\Exception\UniqueTokenIdentifierConstraintViolationException;

readonly final class OAuthAccessTokenRepository implements AccessTokenRepositoryInterface
{
    private const TABLE_NAME = 'sys_oauth_access_token';

    public function __construct(
        private readonly ConnectionPool $pool,
    ) {}

    /**
     * @param ScopeEntityInterface[] $scopes
     */
    public function getNewToken(
        ClientEntityInterface $clientEntity,
        array $scopes,
        string|null $userIdentifier = null
    ): AccessTokenEntityInterface {
        $token = new AccessToken();
        $token->setClientEntity($clientEntity);
        foreach ($scopes as $scope) {
            $token->addScope($scopes);
        }
        $token->setUserIdentifier($userIdentifier === '' ? null : $userIdentifier);
        return $token;
    }

    public function persistNewAccessToken(AccessTokenEntityInterface $accessToken): void
    {
        $data = [
            'identifier' => $accessToken->getIdentifier(),
            'expirty_date' => $accessToken->getExpiryDateTime(),
            'client_identifier' => $accessToken->getClient()->getIdentifier(),
            'user_identifier' => $accessToken->getUserIdentifier(),
            'revoked' => false,
            'scopes' => array_values($accessTokenEntity->getScopes()),
        ];

        $result = $this->pool->getQueryBuilderForTable(self::TABLE_NAME)->insert(
            self::TABLE_NAME,
            $data,
        );

        if ($result !== 1) {
            throw UniqueTokenIdentifierConstraintViolationException::create();
        }
    }

    public function isAccessTokenRevoked(string $tokenId): bool
    {
        $queryBuilder = $this->pool->getQueryBuilderForTable(self::TABLE_NAME);
        $queryBuilder->getRestrictions()->removeAll();

        $count = (int)$queryBuilder
            ->count('*')
            ->from(self::TABLE_NAME)
            ->where(
                $queryBuilder->expr()->eq(
                    'access_token',
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
