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

namespace TYPO3\CMS\Core\Middleware;

use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use TYPO3\CMS\Backend\Security\ContentSecurityPolicy\CspRepository;
use TYPO3\CMS\Core\Core\RequestId;
use TYPO3\CMS\Core\Database\ConnectionPool;
use TYPO3\CMS\Core\Utility\GeneralUtility;

/**
 * @internal
 */
abstract class AbstractContentSecurityPolicyReporter implements MiddlewareInterface
{
    public function __construct(protected RequestId $requestId)
    {
        // @todo inject CspRepository
    }

    protected function persistCspReport(string $scope, string $details): void
    {
        if (!$this->isJson($details)) {
            return;
        }
        // @todo strip tokens and other individual URI parts
        GeneralUtility::makeInstance(ConnectionPool::class)
            ->getConnectionForTable(CspRepository::REPORT_TABLE_NAME)
            ->insert(CspRepository::REPORT_TABLE_NAME, [
                'type' => 'csp-report',
                'scope' => $scope,
                'tstamp' => time(),
                'request_id' => (string)$this->requestId,
                'details' => $details,
            ]);
    }

    protected function isCspReport(ServerRequestInterface $request): bool
    {
        $queryParameters = $request->getQueryParams();
        $contentTypeHeader = $request->getHeaderLine('content-type');

        // @todo
        // + verify current session
        // + invoke rate limiter
        // + check additional scope (snippet enrichment)

        return $request->getMethod() === 'POST'
            && $contentTypeHeader === 'application/csp-report';
    }

    protected function isJson(string $value): bool
    {
        try {
            json_decode($value, false, 16, JSON_THROW_ON_ERROR);
            return true;
        } catch (\JsonException) {
            return false;
        }
    }
}
