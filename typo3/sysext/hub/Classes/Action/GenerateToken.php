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
use TYPO3\CMS\Core\Action\Error\PermissionDeniedError;
use TYPO3\CMS\Core\Action\Target;
use TYPO3\CMS\Core\Attribute\AsAction;
use TYPO3\CMS\Core\Scope\AdminScope;
use TYPO3\CMS\Hub\Authorization\AppSecret;
use TYPO3\CMS\Hub\Repository\ClientRepository;
use TYPO3\CMS\Hub\Type\AppType;

final readonly class GenerateToken
{
    public function __construct(
        private ClientRepository $clientRepository,
        private AppSecret $appSecret,
    ) {}

    /**
     * @return array{token: string}
     */
    #[AsAction(
        route: 'token/generate',
        type: ActionType::create,
        scopes: [
            AdminScope::class,
        ],
        targets: [Target::backend],
    )]
    public function perform(
        string $appIdentifier,
        string $secret,
    ): array {
        $client = $this->clientRepository->getClientEntity($appIdentifier);
        if ($client === null
            || $client->getType() !== AppType::STATIC->value
            || !$this->appSecret->isValid($secret, $client->getSecret())
        ) {
            throw new PermissionDeniedError('No static app with the given identifier and secret available', 1793777619);
        }
        return [
            'token' => $this->appSecret->createStaticToken($appIdentifier, $secret),
        ];
    }
}
