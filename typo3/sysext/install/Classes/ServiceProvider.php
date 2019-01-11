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
use TYPO3\CMS\Core\Configuration\ConfigurationManager;
use TYPO3\CMS\Core\Http\MiddlewareDispatcher;
use TYPO3\CMS\Core\Package\AbstractServiceProvider;

/**
 * @internal
 */
class ServiceProvider extends AbstractServiceProvider
{
    const PATH = __DIR__ . '/../';

    public function getFactories(): array
    {
        return [
            Http\Application::class => [ static::class, 'getApplication' ],
            Http\NotFoundRequestHandler::class => [ static::class, 'getNotFoundRequestHandler' ],
        ];
    }

    public static function getApplication(ContainerInterface $container): Http\Application
    {
        $requestHandler = $container->get(Http\NotFoundRequestHandler::class);
        $dispatcher = new MiddlewareDispatcher($requestHandler);

        // Stack of middlewares, executed LIFO
        $dispatcher->lazy(Middleware\Installer::class);
        $dispatcher->add(new Middleware\Maintenance($container->get(ConfigurationManager::class)));

        return new Http\Application($dispatcher);
    }

    public static function getNotFoundRequestHandler(ContainerInterface $container): Http\NotFoundRequestHandler
    {
        return new Http\NotFoundRequestHandler;
    }
}
