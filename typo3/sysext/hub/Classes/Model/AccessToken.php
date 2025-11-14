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

namespace TYPO3\CMS\Hub\Model;

use League\OAuth2\Server\CryptKeyInterface;
use League\OAuth2\Server\Entities\AccessTokenEntityInterface;
use League\OAuth2\Server\Entities\Traits\AccessTokenTrait;
use League\OAuth2\Server\Entities\Traits\EntityTrait;
//use League\OAuth2\Server\Entities\ClientEntityInterface;
//use League\OAuth2\Server\Entities\ScopeEntityInterface;
use League\OAuth2\Server\Entities\Traits\TokenEntityTrait;
use TYPO3\CMS\Core\Security\JwtTrait;

final class AccessToken implements AccessTokenEntityInterface
{
    use JwtTrait;

    //use AccessTokenTrait;
    use EntityTrait;
    use TokenEntityTrait;

    public bool $revoked = false;

    /** @var 'static'|'oauth' */
    public string $mode = 'oauth';

    // Only for $mode=static
    public string $secret;

    public function setPrivateKey(
        #[\SensitiveParameter]
        CryptKeyInterface $privateKey
    ): void {}

    public function toString(): string
    {
        return self::encodeHashSignedJwt(
            [
                'aud' => $this->getClient()->getIdentifier(),
                'jti' => $this->getIdentifier(),
                'iat' => (new \DateTimeImmutable())->format('U.u'),
                'nbf' => (new \DateTimeImmutable())->format('U.u'),
                'exp' => $this->getExpiryDateTime()->format('U.u'),
                'sub' => $this->getSubjectIdentifier(),
                'scopes' => $this->getScopes(),
                'mode' => $this->mode,
            ],
            self::createSigningKeyFromEncryptionKey(self::class)
        );
    }

    /**
     * @return non-empty-string
     */
    private function getSubjectIdentifier(): string
    {
        return $this->getUserIdentifier() ?? $this->getClient()->getIdentifier();
    }
}
