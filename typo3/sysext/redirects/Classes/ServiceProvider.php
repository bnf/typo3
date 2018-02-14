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
    const PATH = __DIR__ . '/../';

    public function getFactories(): array
    {
        return [
            Http\Middleware\RedirectHandler::class => [ static::class, 'getRedirectHandler' ],
            Service\RedirectService::class => [ static::class, 'getRedirectService' ],
        ];
    }

    public static function getRedirectHandler(ContainerInterface $container): Http\Middleware\RedirectHandler
    {
        return static::new(
            $container,
            Http\Middleware\RedirectHandler::class,
            [
                $container->get(Service\RedirectService::class),
                new \TYPO3\CMS\Core\Configuration\Features,
                new \TYPO3\CMS\Core\Database\ConnectionPool
            ]
        );
    }

    public static function getRedirectService(ContainerInterface $container): Service\RedirectService
    {
        return static::new($container, Service\RedirectService::class);
    }
}
