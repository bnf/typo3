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

namespace TYPO3\CMS\Backend\Action\Record;

use TYPO3\CMS\Core\Action\ActionContext;
use TYPO3\CMS\Core\Attribute\AsAction;
use TYPO3\CMS\Core\Database\Connection;
use TYPO3\CMS\Core\Database\ConnectionPool;
use TYPO3\CMS\Core\Schema\Capability\LabelCapability;
use TYPO3\CMS\Core\Schema\Capability\TcaSchemaCapability;
use TYPO3\CMS\Core\Schema\TcaSchemaFactory;

final readonly class FetchRecords
{
    public function __construct(
        private ConnectionPool $connectionPool,
        private TcaSchemaFactory $tcaSchemaFactory,
    ) {}

    /**
     * @return list<array{uid: number, label: string}>
     */
    #[AsAction(
        name: 'records/{schema}',
        method: 'GET',
    )]
    public function perform(
        ActionContext $context,
        string $schema,
        string $search = '',
    ): array {
        $schemaInstance = $this->tcaSchemaFactory->get($schema);
        /** @var LabelCapability $labelCapability */
        $labelCapability = $schemaInstance->getCapability(TcaSchemaCapability::Label);
        $labelField = $labelCapability->getPrimaryFieldName();
        $queryBuilder = $this->connectionPool->getQueryBuilderForTable($schema);
        $queryBuilder
            ->select('uid', $labelField . ' AS label')
            ->from($schema)
            ->where(
                $queryBuilder->expr()->eq(
                    'sys_language_uid',
                    $queryBuilder->createNamedParameter(0, Connection::PARAM_INT)
                ),
                $queryBuilder->expr()->like(
                    $labelField,
                    $queryBuilder->createNamedParameter('%' . $queryBuilder->escapeLikeWildcards($search) . '%')
                )
            )
            ->setMaxResults(100);
        return $queryBuilder->fetchAllAssociative();
    }
}
