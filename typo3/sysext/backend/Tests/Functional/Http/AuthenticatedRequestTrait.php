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

namespace TYPO3\CMS\Backend\Tests\Functional\Http;

use Psr\Http\Message\ServerRequestInterface;
use TYPO3\CMS\Backend\Domain\Model\AccessToken;
use TYPO3\CMS\Core\Authentication\BackendUserAuthentication;
use TYPO3\CMS\Core\Http\NormalizedParams;
use TYPO3\CMS\Core\Http\ServerRequest;
use TYPO3\CMS\Core\Utility\GeneralUtility;

/**
 * Requests authenticated as an existing backend user, via session cookie and API token
 */
trait AuthenticatedRequestTrait
{
    /**
     * Sets up Backend User which is already available in db
     * @todo move into testing framework
     */
    private function setUpAuthenticatedRequest(string $url, int $userUid, string $method = 'GET'): ServerRequestInterface
    {
        $userRow = $this->getBackendUserRecordFromDatabase($userUid);
        if (!is_array($userRow)) {
            throw new \RuntimeException(
                'The BE User with the UID ' . $userUid . ' does not exist in the database.',
                1791980412
            );
        }

        $backendUser = GeneralUtility::makeInstance(BackendUserAuthentication::class);
        $session = $backendUser->createUserSession($userRow);
        $token = new AccessToken($userRow['username'])->toString();
        return $this->createServerRequest($url, $method)
            ->withCookieParams(['be_typo_user' => $session->getJwt()])
            ->withHeader('Authorization', 'Bearer ' . $token);
    }

    /**
     * Temporary copy of TF function
     *
     * @todo remove when `setUpAuthenticatedRequest` is moved into TF
     */
    private function createServerRequest(string $url, string $method = 'GET'): ServerRequestInterface
    {
        $requestUrlParts = parse_url($url);
        $docRoot = $this->instancePath;

        $serverParams = [
            'DOCUMENT_ROOT' => $docRoot,
            'HTTP_USER_AGENT' => 'TYPO3 Functional Test Request',
            'HTTP_HOST' => $requestUrlParts['host'] ?? 'localhost',
            'SERVER_NAME' => $requestUrlParts['host'] ?? 'localhost',
            'SERVER_ADDR' => '127.0.0.1',
            'REMOTE_ADDR' => '127.0.0.1',
            'SCRIPT_NAME' => '/index.php',
            'PHP_SELF' => '/index.php',
            'SCRIPT_FILENAME' => $docRoot . '/index.php',
            'PATH_TRANSLATED' => $docRoot . '/index.php',
            'QUERY_STRING' => $requestUrlParts['query'] ?? '',
            'REQUEST_URI' => $requestUrlParts['path'] . (isset($requestUrlParts['query']) ? '?' . $requestUrlParts['query'] : ''),
            'REQUEST_METHOD' => $method,
        ];
        if (isset($requestUrlParts['scheme'])) {
            if ($requestUrlParts['scheme'] === 'https') {
                $serverParams['HTTPS'] = 'on';
                $serverParams['SERVER_PORT'] = '443';
            } else {
                $serverParams['SERVER_PORT'] = '80';
            }
        }
        if (isset($requestUrlParts['port'])) {
            $serverParams['SERVER_PORT'] = $requestUrlParts['port'];
        }
        $request = new ServerRequest($url, $method, null, [], $serverParams);
        return $request->withAttribute('normalizedParams', NormalizedParams::createFromRequest($request));
    }
}
