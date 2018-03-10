<?php
namespace TYPO3\CMS\Frontend;

use Psr\Container\ContainerInterface;
use TYPO3\CMS\Core\Http\MiddlewareDispatcher;
use TYPO3\CMS\Core\Http\MiddlewareStackResolver;
use function DI\autowire;
use function DI\create;
use function DI\get;

return [
    Http\Application::class => autowire()->constructorParameter('requestHandler', get('frontend.request-handler')),
    'frontend.request-handler' => create(MiddlewareDispatcher::class)->constructor(get(Http\RequestHandler::class), get('frontend.middlewares'), get(ContainerInterface::class)),
    'frontend.middlewares' => function (ContainerInterface $container) {
        $resolver = new MiddlewareStackResolver(
            $container->get(\TYPO3\CMS\Core\Package\PackageManager::class),
            $container->get(\TYPO3\CMS\Core\Service\DependencyOrderingService::class),
            $container->get(\TYPO3\CMS\Core\Cache\CacheManager::class)->getCache('cache_core')
        );
        return $resolver->resolve('frontend');
    },
];
