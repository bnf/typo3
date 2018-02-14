<?php
declare(strict_types = 1);
namespace TYPO3\CMS\Redirects;

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
use TYPO3\CMS\Core\Log\LogManager;

class ServiceProvider extends AbstractServiceProvider
{
    public function getFactories(): array
    {
        return [
            Http\Middleware\RedirectHandler::class => [ static::class, 'getRedirectHandler' ],
            Service\RedirectService::class => [ static::class, 'getRedirectService' ],
        ];
    }

    public static function getRedirectHandler(ContainerInterface $container): Http\Middleware\RedirectHandler
    {
        $handler = new Http\Middleware\RedirectHandler(
            $container->get(Service\RedirectService::class),
            new \TYPO3\CMS\Core\Configuration\Features,
            new \TYPO3\CMS\Core\Database\ConnectionPool
        );
        $handler->setLogger($container->get(LogManager::class)->getLogger(Http\Middleware\RedirectHandler::class));
        return $handler;
    }

    public static function getRedirectService(ContainerInterface $container): Service\RedirectService
    {
        $service = new Service\RedirectService;
        $service->setLogger($container->get(LogManager::class)->getLogger(Service\RedirectService::class));
        return $service;
    }
}
