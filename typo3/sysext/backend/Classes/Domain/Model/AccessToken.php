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

namespace TYPO3\CMS\Backend\Domain\Model;

use TYPO3\CMS\Core\Security\JwtTrait;

final readonly class AccessToken
{
    use JwtTrait;

    public function __construct(
        public string $username,
    ) {}

    public function toString(): string
    {
        return self::encodeHashSignedJwt(
            [
                'aud' => 'typo3-backend',
                'jti' => 'TODO',
                'iat' => new \DateTimeImmutable()->format('U.u'),
                'nbf' => new \DateTimeImmutable()->format('U.u'),
                //'exp' => $this->getExpiryDateTime()->format('U.u'),
                'sub' => $this->username,
                //'scopes' => $this->getScopes(),
                //'mode' => $this->mode->value,
            ],
            self::createSigningKeyFromEncryptionKey(self::class)
        );
    }
}
