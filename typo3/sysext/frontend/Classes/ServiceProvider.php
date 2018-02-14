<?php
declare(strict_types = 1);
namespace TYPO3\CMS\Frontend;

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
            Http\RequestHandler::class => [ static::class, 'getRequestHandler' ],
            'frontend.middlewares' => [ static::class, 'getFrontendMiddlewares' ],
        ];
    }

    public static function getApplication(ContainerInterface $container): Http\Application
    {
        $requestHandler = new \TYPO3\CMS\Core\Http\MiddlewareDispatcher(
            $container->get(Http\RequestHandler::class),
            $container->get('frontend.middlewares'),
            $container
        );
        return new Http\Application($requestHandler, $container->get(ConfigurationManager::class));
    }

    public static function getRequestHandler(ContainerInterface $container): Http\RequestHandler
    {
        return new Http\RequestHandler;
    }

    public static function getFrontendMiddlewares(ContainerInterface $container): array
    {
        return $container->get(\TYPO3\CMS\Core\Http\MiddlewareStackResolver::class)->resolve('frontend');
    }
}
