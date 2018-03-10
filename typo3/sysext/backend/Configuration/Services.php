<?php
namespace TYPO3\CMS\Backend;

use Psr\Container\ContainerInterface;
use TYPO3\CMS\Core\Http\MiddlewareDispatcher;
use TYPO3\CMS\Core\Http\MiddlewareStackResolver;
use function DI\autowire;
use function DI\create;
use function DI\get;

return [
    Http\Application::class => autowire()->constructorParameter('requestHandler', get('backend.request-handler')),
    'backend.request-handler' => create(MiddlewareDispatcher::class)->constructor(get(Http\RequestHandler::class), get('backend.middlewares'), get(ContainerInterface::class)),
    'backend.middlewares' => function (ContainerInterface $container) {
        $resolver = new MiddlewareStackResolver(
            $container->get(\TYPO3\CMS\Core\Package\PackageManager::class),
            $container->get(\TYPO3\CMS\Core\Service\DependencyOrderingService::class),
            $container->get(\TYPO3\CMS\Core\Cache\CacheManager::class)->getCache('cache_core')
        );
        return $resolver->resolve('backend');
    },
    Http\RequestHandler::class => autowire(),
    Http\RouteDispatcher::class => autowire(),
    Routing\Router::class => autowire(),
];
