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

namespace TYPO3\CMS\Hub\Repository;

use League\OAuth2\Server\Entities\RefreshTokenEntityInterface;
use League\OAuth2\Server\Exception\UniqueTokenIdentifierConstraintViolationException;
use League\OAuth2\Server\Repositories\RefreshTokenRepositoryInterface;
use TYPO3\CMS\Core\Database\Connection;
use TYPO3\CMS\Core\Database\ConnectionPool;
use TYPO3\CMS\Hub\Model\RefreshToken;

class RefreshTokenRepository implements RefreshTokenRepositoryInterface
{
    private const TABLE_NAME = 'sys_oauth_refresh_token';

    public function __construct(
        private ConnectionPool $connectionPool,
    ) {}

    public function persistNewRefreshToken(RefreshTokenEntityInterface $refreshToken): void
    {
        $data = [
            'identifier' => $refreshToken->getIdentifier(),
            'expiry_date' => $refreshToken->getExpiryDateTime(),
            'access_token_identifier' => $refreshToken->getAccessToken()->getIdentifier(),
            'revoked' => false,
        ];

        $result = $this->connectionPool->getConnectionForTable(self::TABLE_NAME)->insert(
            self::TABLE_NAME,
            $data,
        );

        if ($result !== 1) {
            throw UniqueTokenIdentifierConstraintViolationException::create();
        }
    }

    public function revokeRefreshToken(string $tokenId): void
    {
        // @todo add error handling
        $this->connectionPool->getConnectionForTable(self::TABLE_NAME)->update(
            self::TABLE_NAME,
            ['revoked' => true],
            ['identifier' => $tokenId]
        );
    }

    public function isRefreshTokenRevoked(string $tokenId): bool
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

    /**
     * {@inheritdoc}
     */
    public function getNewRefreshToken(): ?RefreshTokenEntityInterface
    {
        return new RefreshToken();
    }
}
