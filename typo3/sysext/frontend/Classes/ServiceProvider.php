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
use TYPO3\CMS\Core\Core\AbstractServiceProvider;
use TYPO3\CMS\Core\Utility\GeneralUtility;

class ServiceProvider extends AbstractServiceProvider
{
    const PATH = __DIR__ . '/../';

    public function getFactories(): array
    {
        return [
            ContentObject\Menu\MenuContentObjectFactory::class => [ static::class, 'getMenuContentObjectFactory' ],
            Hooks\MediaItemHooks::class => [ static::class, 'getMediaItemHooks' ],
            Page\CacheHashCalculator::class => [ static::class, 'getCacheHashCalculator' ],
            Utility\CompressionUtility::class => [ static::class, 'getCompressionUtility' ],
            Http\Application::class => [ static::class, 'getApplication' ],
        ];
    }

    public static function getMenuContentObjectFactory(ContainerInterface $container): ContentObject\Menu\MenuContentObjectFactory
    {
        return GeneralUtility::makeInstance(ContentObject\Menu\MenuContentObjectFactory::class);
    }

    public static function getMediaItemHooks(ContainerInterface $container): Hooks\MediaItemHooks
    {
        return GeneralUtility::makeInstance(Hooks\MediaItemHooks::class);
    }

    public static function getCacheHashCalculator(ContainerInterface $container): Page\CacheHashCalculator
    {
        return GeneralUtility::makeInstance(Page\CacheHashCalculator::class);
    }

    public static function getCompressionUtility(ContainerInterface $container): Utility\CompressionUtility
    {
        return GeneralUtility::makeInstance(Utility\CompressionUtility::class);
    }

    public static function getApplication(ContainerInterface $container): Http\Application
    {
        // Load base TCA
        $GLOBALS['TCA'] = $container->get('TCA');

        return new Http\Application(
            $container->get(Http\RequestHandler::class),
            $container->get('frontend.middlewares')
        );
    }

    public static function getRequestHandler(ContainerInterface $container): Http\RequestHandler
    {
        return new Http\RequestHandler;
    }

    public static function getFrontendMiddlewares(ContainerInterface $container): array
    {
        return \TYPO3\CMS\Core\ServiceProvider::getCachedMiddlewares($container, 'frontend');
    }
}
