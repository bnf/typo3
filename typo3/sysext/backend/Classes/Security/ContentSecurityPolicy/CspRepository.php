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

namespace TYPO3\CMS\Backend\Security\ContentSecurityPolicy;
use TYPO3\CMS\Core\Database\Connection;
use TYPO3\CMS\Core\Database\ConnectionPool;
use TYPO3\CMS\Core\Utility\GeneralUtility;

class CspRepository
{
    public const REPORT_TABLE_NAME = 'sys_http_report';

    /**
     * @return list<CspReport>
     */
    public function findAll(): array
    {
        // @todo inject connection
        $connection = GeneralUtility::makeInstance(ConnectionPool::class)
            ->getConnectionForTable(self::REPORT_TABLE_NAME);
        $result = $connection->select(['*'], self::REPORT_TABLE_NAME, ['type' => 'csp-report']);
        return array_map(
            static fn(array $row) => CspReport::fromArray($row),
            $result->fetchAllAssociative()
        );
    }
}
