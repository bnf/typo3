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
use TYPO3\CMS\Core\Action\Target;
use TYPO3\CMS\Core\Attribute\AsAction;
use TYPO3\CMS\Hub\Authorization\AppSecret;
use TYPO3\CMS\Hub\Scope\TokenScope;
use TYPO3\CMS\Hub\Type\AppType;

final readonly class GenerateAppSecret
{
    public function __construct(
        private AppSecret $appSecret,
    ) {}

    /**
     * @return array{secret: string, digest: string, token: ?string}
     */
    #[AsAction(
        route: 'app/secret/generate',
        type: ActionType::create,
        summary: 'Generate a new secret of an app',
        description: 'Returns a random secret, its digest to be stored in the app record and, for static apps, the token wrapping the secret. The secret and the token are not stored and can not be retrieved again.',
        scopes: [
            TokenScope::class,
        ],
        targets: [Target::backend],
    )]
    public function perform(
        string $appIdentifier,
        AppType $appType,
    ): array {
        $secret = $this->appSecret->generate();
        return [
            'secret' => $secret,
            'digest' => $this->appSecret->digest($secret),
            'token' => $appType === AppType::STATIC ? $this->appSecret->createStaticToken($appIdentifier, $secret) : null,
        ];
    }
}
