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

namespace TYPO3\CMS\Hub\Http;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Symfony\Component\DependencyInjection\Attribute\Autoconfigure;
use TYPO3\CMS\Backend\Http\ActionHandler;
use TYPO3\CMS\Core\Authentication\BackendUserAuthentication;
use TYPO3\CMS\Core\Localization\LanguageServiceFactory;
use TYPO3\CMS\Hub\Model\AppInstruction;

/**
 * @internal This is a specific controller implementation and is not considered part of the Public TYPO3 API.
 */
#[Autoconfigure(public: true)]
class AppHandler
{
    public function __construct(
        private readonly LanguageServiceFactory $languageServiceFactory,
        private readonly ActionHandler $actionHandler,
    ) {}

    public function dummyAction(
        ServerRequestInterface $request,
    ): ResponseInterface {
        throw new \RuntimeException('Not implemented', 1766263866);
    }

    public function handleApp(
        ServerRequestInterface $request,
        string $handlerName,
        ?AppInstruction $appInstruction,
        BackendUserAuthentication $user
    ): ResponseInterface {
        // Prepare the user and language object before calling the app execution process
        $GLOBALS['LANG'] = $this->languageServiceFactory->createFromUserPreferences($user);
        $GLOBALS['BE_USER'] = $user;

        return $this->actionHandler->dispatch($request);
    }
}
