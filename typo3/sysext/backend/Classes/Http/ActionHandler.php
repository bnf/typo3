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

    public function dispatch(ServerRequestInterface $request): ResponseInterface
    {
        $routeResult = $request->getAttribute('routing');
        if (!($routeResult instanceof RouteResult)) {
            throw new \RuntimeException('ActionHandler route has no routing resolved', 1766131390);
        }
        $route = $routeResult->getRoute();
        $name = $route->getOption('actionName');
        return $this->actionRegistry->invokeRoute($name, $request);
    }

    #[AsEventListener('backend.routes.actions')]
    public function registerRoutesForActions(RouterConfigurationEvent $event): void
    {
        $router = $event->router;
        $context = 'backend';
        foreach ($this->actionRegistry->getRoutes($context) as $item) {
            $name = $item['name'];
            $path = $item['route'];
            $method = $item['method'];
            $alias = [];
            $routeOptions = [
                'access' => 'public',
                'target' => self::class . '::dispatch',
                'actionName' => $name,
                'actionContext' => $context,
            ];
            if ($item['ajaxAlias']) {
                $routeOptions['ajax'] = true;
                $routeOptions['ajaxAlias'] = $item['ajaxAlias'];
                $alias = ['ajax_' . $item['ajaxAlias']];
            }
            $route = new Route(self::API_PREFIX . $path, $routeOptions);
            if ($method !== null) {
                $route->setMethods(is_string($method) ? [$method] : $method);
            }
            $router->addRoute('action:' . $name, $route, $alias);
        }
    }
}
