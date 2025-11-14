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

namespace TYPO3\CMS\Hub;

use League\OAuth2\Server\AuthorizationServer;
use League\OAuth2\Server\Grant\AuthCodeGrant;
//use League\OAuth2\Server\Grant\ClientCredentialsGrant;
use TYPO3\CMS\Hub\Repository\OAuth\AccessTokenRepository;
use TYPO3\CMS\Hub\Repository\OAuth\AuthCodeRepository;
use TYPO3\CMS\Hub\Repository\OAuth\ClientRepository;
use TYPO3\CMS\Hub\Repository\OAuth\RefreshTokenRepository;
use TYPO3\CMS\Hub\Repository\OAuth\ScopeRepository;

final readonly class AuthorizationServerFactory
{
    public function __construct(
        private AccessTokenRepository $accessTokenRepository,
        private ClientRepository $clientRepository,
        private ScopeRepository $scopeRepository,
        private AuthCodeRepository $authCodeRepository,
        private RefreshTokenRepository $refreshTokenRepository,
    ) {}

    public function createAuthorizationServer(): AuthorizationServer
    {
        $server = new AuthorizationServer(
            $this->clientRepository,
            $this->accessTokenRepository,
            $this->scopeRepository,
            // Dummy crypt key instance, since we use symmetric JWT for now
            // (handled in TYPO3\CMS\Hub\Model\AccessToken)
            new CryptKey(),
            $GLOBALS['TYPO3_CONF_VARS']['SYS']['encryptionKey'],
        );

        /*
        $server->enableGrantType(
            new ClientCredentialsGrant(),
            new \DateInterval('PT1H') // access tokens will expire after 1 hour
        );
         */

        $server->enableGrantType(
            new AuthCodeGrant(
                $this->authCodeRepository,
                $this->refreshTokenRepository,
                new \DateInterval('PT10M')
            ),
            new \DateInterval('PT1H')
        );

        return $server;
    }
}
