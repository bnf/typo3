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

namespace TYPO3\CMS\Hub\Authentication;

use Psr\Http\Message\ServerRequestInterface;
use TYPO3\CMS\Core\Authentication\BackendUserAuthentication;
use TYPO3\CMS\Hub\Model\AccessToken;

/**
 * TYPO3 backend user authentication for API Apps
 * Auto-logs in, only allowed in API context
 *
 * @internal not part of TYPO3 Core API as this part is experimental
 */
class AppUserAuthentication extends BackendUserAuthentication
{
    public $dontSetCookie = true;

    public function __construct(
        public AccessToken $accessToken,
    ) {
        if (is_numeric($accessToken->getUserIdentifier())) {
            $this->setBeUserByUid((int)$accessToken->getUserIdentifier());
        }
        parent::__construct();
    }

    public function start(ServerRequestInterface $request)
    {
        if (empty($this->user['uid'])) {
            return;
        }
        $this->unpack_uc();
        // The groups are fetched and ready for permission checking in this initialization.
        $this->fetchGroupData();
        $this->backendSetUC();
    }

    /**
     * Replacement for AbstractUserAuthentication::checkAuthentication()
     *
     * Not required in API mode if no user is impersonated, therefore empty.
     */
    public function checkAuthentication(ServerRequestInterface $request)
    {
        // do nothing
    }

    public function getOriginalUserIdWhenInSwitchUserMode(): ?int
    {
        return null;
    }

    public function backendCheckLogin(?ServerRequestInterface $request = null): void
    {
        // do nothing
    }

    /**
     * Determines whether a API backend user is allowed to access TYPO3.
     * Only when adminOnly is off (=0)
     *
     * @internal
     */
    public function isUserAllowedToLogin(): bool
    {
        return (int)$GLOBALS['TYPO3_CONF_VARS']['BE']['adminOnly'] === 0;
    }

    public function initializeBackendLogin(?ServerRequestInterface $request = null): void
    {
        throw new \RuntimeException('Login Error: No login possible for app.', 1766263782);
    }

    public function setAndSaveSessionData($key, $data)
    {
        $this->logger->debug('session update skipped in API request', ['key' => $key, 'data' => $data]);
    }
}
