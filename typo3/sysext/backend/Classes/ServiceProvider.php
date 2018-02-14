<?php
declare(strict_types = 1);
namespace TYPO3\CMS\Backend;

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
    public function getFactories(): array
    {
        return [
            Domain\Repository\Module\BackendModuleRepository::class => [ static::class, 'getBackendModuleRepository' ],
            Module\ModuleStorage::class => [ static::class, 'getModuleStorage' ],
            Routing\Router::class => [ static::class, 'getRouter' ],
            View\BackendLayout\DataProviderCollection::class => [ static::class, 'getDataProviderCollection' ],
            View\BackendLayout\DataProviderContext::class => [ static::class, 'getDataProviderContext' ],
            View\BackendLayoutView::class => [ static::class, 'getBackendLayoutView' ],
            Http\Application::class => [ static::class, 'getApplication' ],
            Http\RequestHandler::class => [ static::class, 'getRequestHandler' ],
            'backend.middlewares' => [ static::class, 'getBackendMiddlewares' ],
        ];
    }

    public static function getBackendModuleRepository(ContainerInterface $container): Domain\Repository\Module\BackendModuleRepository
    {
        return GeneralUtility::makeInstance(Domain\Repository\Module\BackendModuleRepository::class);
    }

    public static function getModuleStorage(ContainerInterface $container): Module\ModuleStorage
    {
        return GeneralUtility::makeInstance(Module\ModuleStorage::class);
    }

    public static function getRouter(ContainerInterface $container): Routing\Router
    {
        return GeneralUtility::makeInstance(Routing\Router::class);
    }

    public static function getDataProviderCollection(ContainerInterface $container): View\BackendLayout\DataProviderCollection
    {
        return GeneralUtility::makeInstance(View\BackendLayout\DataProviderCollection::class);
    }

    public static function getDataProviderContext(ContainerInterface $container): View\BackendLayout\DataProviderContext
    {
        return GeneralUtility::makeInstance(View\BackendLayout\DataProviderContext::class);
    }

    public static function getBackendLayoutView(ContainerInterface $container): View\BackendLayoutView
    {
        return GeneralUtility::makeInstance(View\BackendLayoutView::class);
    }

    public static function getApplication(ContainerInterface $container): Http\Application
    {
        // Load base TCA
        $GLOBALS['TCA'] = $container->get('TCA');

        return new Http\Application(
            $container->get(Http\RequestHandler::class),
            $container->get('backend.middlewares')
        );
    }

    public static function getRequestHandler(ContainerInterface $container): Http\RequestHandler
    {
        return new Http\RequestHandler(\TYPO3\CMS\Core\Core\Bootstrap::getInstance());
    }

    public static function getBackendMiddlewares(ContainerInterface $container): array
    {
        return \TYPO3\CMS\Core\ServiceProvider::getCachedMiddlewares($container, 'backend');
    }
}
