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

use League\OAuth2\Server\Repositories\ClientRepositoryInterface;
use Symfony\Component\Uid\Uuid;
use TYPO3\CMS\Core\Database\Connection;
use TYPO3\CMS\Core\Database\ConnectionPool;
use TYPO3\CMS\Core\Domain\RecordFactory;
use TYPO3\CMS\Core\Domain\RecordInterface;
use TYPO3\CMS\Hub\Model\Client;

final readonly class ClientRepository implements ClientRepositoryInterface
{
    private const TABLE_NAME = 'sys_app';

    public function __construct(
        private ConnectionPool $connectionPool,
        private RecordFactory $recordFactory,
    ) {}

    public function validateClient(
        string $clientIdentifier,
        ?string $clientSecret,
        ?string $grantType
    ): bool {
        $record = $this->getClientRecord($clientIdentifier);
        if ($record === null) {
            return false;
        }

        return password_verify($clientSecret, $record->get('secret'));
    }

    public function getClientEntity(string $clientIdentifier): ?Client
    {
        $record = $this->getClientRecord($clientIdentifier);
        if ($record === null) {
            return null;
        }

        $client = new Client();
        $client->setIdentifier($record->get('identifier'));
        $client->setName($record->get('name'));
        $client->setSecret($record->get('secret'));
        $client->setScopes($record->get('scopes'));
        $client->setImpersonateUser($record->has('impersonate_user') ? $record->get('impersonate_user')?->getUid() : null);
        // @todo Handle TYPO3\CMS\Core\LinkHandling\TypolinkParameter
        $client->setRedirectUri($record->getRawRecord()->get('redirect_uri'));
        $logo = $record->get('logo')[0] ?? null;
        if ($logo) {
            $client->setLogo($logo);
        }
        // @todo
        $client->setConfidential(true);

        return $client;
    }

    public function getClientRecord(string $clientIdentifier): ?RecordInterface
    {
        if (!Uuid::isValid($clientIdentifier)) {
            return null;
        }

        $queryBuilder = $this->connectionPool->getQueryBuilderForTable(self::TABLE_NAME);
        //$queryBuilder->getRestrictions()->removeAll();
        $record = $queryBuilder
            ->select('*')
            ->from(self::TABLE_NAME)
            ->where(
                $queryBuilder->expr()->eq(
                    'identifier',
                    $queryBuilder->createNamedParameter($clientIdentifier, Connection::PARAM_STR)
                ),
                //$queryBuilder->expr()->eq('app_type', $queryBuilder->createNamedParameter('oauth', Connection::PARAM_STR))
            )
            ->executeQuery()
            ->fetchAssociative();

        if ($record === false) {
            return null;
        }

        return $this->recordFactory->createResolvedRecordFromDatabaseRow(self::TABLE_NAME, $record);
    }
}
