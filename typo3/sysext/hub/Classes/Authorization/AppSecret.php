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

namespace TYPO3\CMS\Hub\Authorization;

use TYPO3\CMS\Core\Crypto\Random;
use TYPO3\CMS\Core\Security\JwtTrait;
use TYPO3\CMS\Hub\Model\AccessToken;

/**
 * Secrets of apps are generated randomly with 160 bits of entropy, so a fast
 * hash is sufficient to store them: only their SHA-256 digest is persisted and
 * verifying a secret does not need a slow password hash on every request.
 *
 * @internal
 */
final readonly class AppSecret
{
    use JwtTrait;

    private const string DIGEST_PREFIX = 'sha256:';

    public function __construct(
        private Random $random,
    ) {}

    public function generate(): string
    {
        return $this->random->generateRandomHexString(40);
    }

    public function digest(string $secret): string
    {
        return self::DIGEST_PREFIX . hash('sha256', $secret);
    }

    public function isValid(string $secret, string $digest): bool
    {
        return $secret !== ''
            && str_starts_with($digest, self::DIGEST_PREFIX)
            && hash_equals($digest, $this->digest($secret));
    }

    /**
     * Token of a static app, which wraps the secret
     */
    public function createStaticToken(string $appIdentifier, string $secret): string
    {
        return self::encodeHashSignedJwt(
            // No 'exp'(iry) entry on purpose.
            // static app token expire when the respective sys_app
            // is disabled or the embedded secret is changed.
            [
                'jti' => 'static',
                'aud' => $appIdentifier,
                'iat' => new \DateTimeImmutable()->format('U.u'),
                'nbf' => new \DateTimeImmutable()->format('U.u'),
                'secret' => $secret,
                'sub' => '',
                'scopes' => [],
                'mode' => 'static',
            ],
            self::createSigningKeyFromEncryptionKey(AccessToken::class)
        );
    }
}
