<?php
namespace TYPO3\CMS\Install;

use Psr\Container\ContainerInterface;
use TYPO3\CMS\Core\Configuration\ConfigurationManager;
use TYPO3\CMS\Core\Http\MiddlewareDispatcher;
use function DI\create;
use function DI\get;

return [
    Http\Application::class => create()->constructor(get('installtool.request-handler'), get(ConfigurationManager::class)),
    Middleware\Maintenance::class => create()->constructor(get(ConfigurationManager::class)),
    'installtool.request-handler' => function (ContainerInterface $container) {
        $requestHandler = new Http\NotFoundRequestHandler;
        $dispatcher = new MiddlewareDispatcher($requestHandler, [], $container);
        $dispatcher->lazy(Middleware\Installer::class);
        $dispatcher->add($container->get(Middleware\Maintenance::class));
        return $dispatcher;
    },
];
