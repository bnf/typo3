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

namespace TYPO3\CMS\Core\Http;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\RequestHandlerInterface;
use TYPO3\CMS\Core\Configuration\ConfigurationManager;
use TYPO3\CMS\Core\Core\Bootstrap;

/**
 * Entry point for the TYPO3 Frontend
 */
class Application extends AbstractApplication
{
    public function __construct(
        RequestHandlerInterface $requestHandler,
        protected readonly ConfigurationManager $configurationManager
    ) {
        $this->requestHandler = $requestHandler;
    }

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        if (!Bootstrap::checkIfEssentialConfigurationExists($this->configurationManager)) {
            return $this->installToolRedirect();
        }

        return parent::handle($request);
    }

    /**
     * Create a PSR-7 Response that redirects to the install tool
     *
     * @return ResponseInterface
     */
    protected function installToolRedirect(): ResponseInterface
    {
        $path = TYPO3_mainDir . 'install.php';
        return new RedirectResponse($path, 302);
    }
}
