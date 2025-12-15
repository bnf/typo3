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

namespace TYPO3\CMS\Backend\Http;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use TYPO3\CMS\Backend\Attribute\AsController;
use TYPO3\CMS\Backend\Routing\Route;
use TYPO3\CMS\Backend\Routing\RouterConfigurationEvent;
use TYPO3\CMS\Backend\Routing\RouteResult;
use TYPO3\CMS\Core\Action\ActionRegistry;
use TYPO3\CMS\Core\Attribute\AsEventListener;

/**
 * @internal
 */
#[AsController]
final readonly class ActionHandler
{
    private const API_PREFIX = '/api/';

    public function __construct(
        private ActionRegistry $actionRegistry,
    ) {}

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        $routeResult = $request->getAttribute('routing');
        if (!($routeResult instanceof RouteResult)) {
            throw new \RuntimeException('ActionHandler route has no routing resolved', 1766131390);
        }
        $route = $routeResult->getRoute();
        $id = $route->getOption('actionId');

        if ($request->getAttribute('api.access_token') === null) {
            throw new \RuntimeException('ActionHandler required an access_token to be resolved', 1784896745);
        }

        $handler = $this->actionRegistry->getRouteHandler($id);
        return $handler->handle($request);
    }

    #[AsEventListener('backend.routes.actions')]
    public function registerRoutesForActions(RouterConfigurationEvent $event): void
    {
        $router = $event->router;
        $context = 'backend';
        foreach ($this->actionRegistry->getRoutes($context) as $action) {
            $name = $action->name;
            $path = $action->route;
            $method = $action->method;
            $routeOptions = [
                'access' => 'public',
                'target' => self::class . '::handle',
                'actionId' => $action->id,
                'actionContext' => $context,
            ];
            $route = new Route(self::API_PREFIX . $path, $routeOptions);
            $route->setMethods([$action->method]);
            $router->addRoute('action:' . $action->id, $route);
        }
    }
}
