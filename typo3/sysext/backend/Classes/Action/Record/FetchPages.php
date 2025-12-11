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
use TYPO3\CMS\Core\Scope\ContentReadScope;

final readonly class FetchPages
{
    public function __construct(
        private ConnectionPool $connectionPool,
    ) {}

    /**
     * @return list<array{uid: number, title: string}>
     */
    #[AsAction(
        name: 'pages',
        tag: 'record',
        method: 'GET',
        scopes: [
            ContentReadScope::class,
        ],
    )]
    public function perform(
        ActionContext $context,
        string $search = '',
    ): array {
        $queryBuilder = $this->connectionPool->getQueryBuilderForTable('pages');
        $queryBuilder
            ->select('uid', 'title')
            ->from('pages')
            ->where(
                $queryBuilder->expr()->eq(
                    'sys_language_uid',
                    $queryBuilder->createNamedParameter(0, Connection::PARAM_INT)
                ),
                $queryBuilder->expr()->like(
                    'title',
                    $queryBuilder->createNamedParameter('%' . $queryBuilder->escapeLikeWildcards($search) . '%')
                )
            )
            ->setMaxResults(1000);
        return $queryBuilder->fetchAllAssociative();
    }
}
