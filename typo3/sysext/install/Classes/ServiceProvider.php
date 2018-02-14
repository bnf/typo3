<?php
declare(strict_types = 1);
namespace TYPO3\CMS\Install;

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

use Psr\Container\ContainerInterface;
use TYPO3\CMS\Core\Core\AbstractServiceProvider;
use TYPO3\CMS\Core\Utility\GeneralUtility;

class ServiceProvider extends AbstractServiceProvider
{
    const PATH = __DIR__ . '/../';

    public function getFactories(): array
    {
        return [
            Service\SessionService::class => [ static::class, 'getSessionService' ],
            Http\Application::class => [ static::class, 'getApplication' ],
            Http\RequestHandler::class => [ static::class, 'getRequestHandler' ],
            Http\InstallerRequestHandler::class => [ static::class, 'getInstallerRequestHandler' ],
        ];
    }

    public static function getSessionService(ContainerInterface $container): Service\SessionService
    {
        return GeneralUtility::makeInstance(Service\SessionService::class);
    }

    public static function getApplication(ContainerInterface $container): Http\Application
    {
        return new Http\Application(
            $container->get(Http\RequestHandler::class),
            $container->get(Http\InstallerRequestHandler::class)
        );
    }

    public static function getRequestHandler(ContainerInterface $container): Http\RequestHandler
    {
        return new Http\RequestHandler;
    }

    public static function getInstallerRequestHandler(ContainerInterface $container): Http\InstallerRequestHandler
    {
        return new Http\InstallerRequestHandler(\TYPO3\CMS\Core\Core\Bootstrap::getInstance());
    }
}
