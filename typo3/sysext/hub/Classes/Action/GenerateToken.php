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

namespace TYPO3\CMS\Hub\Action;

use TYPO3\CMS\Core\Action\ActionType;
use TYPO3\CMS\Core\Attribute\AsAction;
use TYPO3\CMS\Core\Security\JwtTrait;
use TYPO3\CMS\Hub\Model\AccessToken;

final readonly class GenerateToken
{
    use JwtTrait;

    /**
     * @return array{token: string}
     */
    #[AsAction(
        name: 'token/generate',
        type: ActionType::create,
    )]
    public function perform(
        string $appIdentifier,
        string $secret,
    ): array {
        $token = self::encodeHashSignedJwt(
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
        return [
            'token' => $token,
        ];
    }
}
