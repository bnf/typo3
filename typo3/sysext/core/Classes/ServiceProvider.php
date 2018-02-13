<?php
declare(strict_types = 1);
namespace TYPO3\CMS\Core;

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
            Cache\CacheManager::class => [ static::class, 'getCacheManager' ],
            Category\CategoryRegistry::class => [ static::class, 'getCategoryRegistry' ],
            Charset\CharsetConverter::class => [ static::class, 'getCharsetConverter' ],
            Console\CommandRegistry::class => [ static::class, 'getCommandRegistry' ],
            Encoder\JavaScriptEncoder::class => [ static::class, 'getJavaScriptEncoder' ],
            Imaging\IconRegistry::class => [ static::class, 'getIconRegistry' ],
            LinkHandling\LinkService::class => [ static::class, 'getLinkService' ],
            Localization\LanguageStore::class => [ static::class, 'getLanguageStore' ],
            Localization\Locales::class => [ static::class, 'getLocales' ],
            Localization\LocalizationFactory::class => [ static::class, 'getLocalizationFactory' ],
            Locking\LockFactory::class => [ static::class, 'getLockFactory' ],
            Log\LogManager::class => [ static::class, 'getLogManager' ],
            Mail\MemorySpool::class => [ static::class, 'getMemorySpool' ],
            Mail\TransportFactory::class => [ static::class, 'getTransportFactory' ],
            Messaging\FlashMessageService::class => [ static::class, 'getFlashMessageService' ],
            Package\PackageManager::class => [ static::class, 'getPackageManager' ],
            Page\PageRenderer::class => [ static::class, 'getPageRenderer' ],
            Registry::class => [ static::class, 'getRegistry' ],
            Resource\Collection\FileCollectionRegistry::class => [ static::class, 'getFileCollectionRegistry' ],
            Resource\Driver\DriverRegistry::class => [ static::class, 'getDriverRegistry' ],
            Resource\Index\ExtractorRegistry::class => [ static::class, 'getExtractorRegistry' ],
            Resource\Index\FileIndexRepository::class => [ static::class, 'getFileIndexRepository' ],
            Resource\Index\MetaDataRepository::class => [ static::class, 'getMetaDataRepository' ],
            Resource\OnlineMedia\Helpers\OnlineMediaHelperRegistry::class => [ static::class, 'getOnlineMediaHelperRegistry' ],
            Resource\Processing\TaskTypeRegistry::class => [ static::class, 'getTaskTypeRegistry' ],
            Resource\Rendering\RendererRegistry::class => [ static::class, 'getRendererRegistry' ],
            Resource\ResourceFactory::class => [ static::class, 'getResourceFactory' ],
            Resource\Security\FileMetadataPermissionsAspect::class => [ static::class, 'getFileMetadataPermissionsAspect' ],
            Resource\TextExtraction\TextExtractorRegistry::class => [ static::class, 'getTextExtractorRegistry' ],
            Session\SessionManager::class => [ static::class, 'getSessionManager' ],
            TimeTracker\TimeTracker::class => [ static::class, 'getTimeTracker' ],
        ];
    }

    public static function getCacheManager(ContainerInterface $container): Cache\CacheManager
    {
        return GeneralUtility::makeInstance(Cache\CacheManager::class);
    }

    public static function getCategoryRegistry(ContainerInterface $container): Category\CategoryRegistry
    {
        return GeneralUtility::makeInstance(Category\CategoryRegistry::class);
    }

    public static function getCharsetConverter(ContainerInterface $container): Charset\CharsetConverter
    {
        return GeneralUtility::makeInstance(Charset\CharsetConverter::class);
    }

    public static function getCommandRegistry(ContainerInterface $container): Console\CommandRegistry
    {
        return GeneralUtility::makeInstance(Console\CommandRegistry::class);
    }

    public static function getJavaScriptEncoder(ContainerInterface $container): Encoder\JavaScriptEncoder
    {
        return GeneralUtility::makeInstance(Encoder\JavaScriptEncoder::class);
    }

    public static function getIconRegistry(ContainerInterface $container): Imaging\IconRegistry
    {
        return GeneralUtility::makeInstance(Imaging\IconRegistry::class);
    }

    public static function getLinkService(ContainerInterface $container): LinkHandling\LinkService
    {
        return GeneralUtility::makeInstance(LinkHandling\LinkService::class);
    }

    public static function getLanguageStore(ContainerInterface $container): Localization\LanguageStore
    {
        return GeneralUtility::makeInstance(Localization\LanguageStore::class);
    }

    public static function getLocales(ContainerInterface $container): Localization\Locales
    {
        return GeneralUtility::makeInstance(Localization\Locales::class);
    }

    public static function getLocalizationFactory(ContainerInterface $container): Localization\LocalizationFactory
    {
        return GeneralUtility::makeInstance(Localization\LocalizationFactory::class);
    }

    public static function getLockFactory(ContainerInterface $container): Locking\LockFactory
    {
        return GeneralUtility::makeInstance(Locking\LockFactory::class);
    }

    public static function getLogManager(ContainerInterface $container): Log\LogManager
    {
        return GeneralUtility::makeInstance(Log\LogManager::class);
    }

    public static function getMemorySpool(ContainerInterface $container): Mail\MemorySpool
    {
        return GeneralUtility::makeInstance(Mail\MemorySpool::class);
    }

    public static function getTransportFactory(ContainerInterface $container): Mail\TransportFactory
    {
        return GeneralUtility::makeInstance(Mail\TransportFactory::class);
    }

    public static function getFlashMessageService(ContainerInterface $container): Messaging\FlashMessageService
    {
        return GeneralUtility::makeInstance(Messaging\FlashMessageService::class);
    }

    public static function getPackageManager(ContainerInterface $container): Package\PackageManager
    {
        return GeneralUtility::makeInstance(Package\PackageManager::class);
    }

    public static function getPageRenderer(ContainerInterface $container): Page\PageRenderer
    {
        return GeneralUtility::makeInstance(Page\PageRenderer::class);
    }

    public static function getRegistry(ContainerInterface $container): Registry
    {
        return GeneralUtility::makeInstance(Registry::class);
    }

    public static function getFileCollectionRegistry(ContainerInterface $container): Resource\Collection\FileCollectionRegistry
    {
        return GeneralUtility::makeInstance(Resource\Collection\FileCollectionRegistry::class);
    }

    public static function getDriverRegistry(ContainerInterface $container): Resource\Driver\DriverRegistry
    {
        return GeneralUtility::makeInstance(Resource\Driver\DriverRegistry::class);
    }

    public static function getExtractorRegistry(ContainerInterface $container): Resource\Index\ExtractorRegistry
    {
        return GeneralUtility::makeInstance(Resource\Index\ExtractorRegistry::class);
    }

    public static function getFileIndexRepository(ContainerInterface $container): Resource\Index\FileIndexRepository
    {
        return GeneralUtility::makeInstance(Resource\Index\FileIndexRepository::class);
    }

    public static function getMetaDataRepository(ContainerInterface $container): Resource\Index\MetaDataRepository
    {
        return GeneralUtility::makeInstance(Resource\Index\MetaDataRepository::class);
    }

    public static function getOnlineMediaHelperRegistry(ContainerInterface $container): Resource\OnlineMedia\Helpers\OnlineMediaHelperRegistry
    {
        return GeneralUtility::makeInstance(Resource\OnlineMedia\Helpers\OnlineMediaHelperRegistry::class);
    }

    public static function getTaskTypeRegistry(ContainerInterface $container): Resource\Processing\TaskTypeRegistry
    {
        return GeneralUtility::makeInstance(Resource\Processing\TaskTypeRegistry::class);
    }

    public static function getRendererRegistry(ContainerInterface $container): Resource\Rendering\RendererRegistry
    {
        return GeneralUtility::makeInstance(Resource\Rendering\RendererRegistry::class);
    }

    public static function getResourceFactory(ContainerInterface $container): Resource\ResourceFactory
    {
        return GeneralUtility::makeInstance(Resource\ResourceFactory::class);
    }

    public static function getFileMetadataPermissionsAspect(ContainerInterface $container): Resource\Security\FileMetadataPermissionsAspect
    {
        return GeneralUtility::makeInstance(Resource\Security\FileMetadataPermissionsAspect::class);
    }

    public static function getTextExtractorRegistry(ContainerInterface $container): Resource\TextExtraction\TextExtractorRegistry
    {
        return GeneralUtility::makeInstance(Resource\TextExtraction\TextExtractorRegistry::class);
    }

    public static function getSessionManager(ContainerInterface $container): Session\SessionManager
    {
        return GeneralUtility::makeInstance(Session\SessionManager::class);
    }

    public static function getTimeTracker(ContainerInterface $container): TimeTracker\TimeTracker
    {
        return GeneralUtility::makeInstance(TimeTracker\TimeTracker::class);
    }
}
