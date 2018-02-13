<?php
declare(strict_types = 1);
namespace TYPO3\CMS\Extbase;

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
            Mvc\Cli\CommandManager::class => [ static::class, 'getCommandManager' ],
            Mvc\Cli\RequestBuilder::class => [ static::class, 'getRequestBuilder' ],
            Mvc\Controller\MvcPropertyMappingConfigurationService::class => [ static::class, 'getMvcPropertyMappingConfigurationService' ],
            Mvc\Dispatcher::class => [ static::class, 'getDispatcher' ],
            Mvc\Web\CacheHashEnforcer::class => [ static::class, 'getCacheHashEnforcer' ],
            Mvc\Web\RequestBuilder::class => [ static::class, 'getRequestBuilder' ],
            Object\Container\Container::class => [ static::class, 'getContainer' ],
            Persistence\Generic\Backend::class => [ static::class, 'getBackend' ],
            Persistence\Generic\Mapper\DataMapFactory::class => [ static::class, 'getDataMapFactory' ],
            Persistence\Generic\Mapper\DataMapper::class => [ static::class, 'getDataMapper' ],
            Persistence\Generic\PersistenceManager::class => [ static::class, 'getPersistenceManager' ],
            Persistence\Generic\Qom\QueryObjectModelFactory::class => [ static::class, 'getQueryObjectModelFactory' ],
            Persistence\Generic\QueryFactory::class => [ static::class, 'getQueryFactory' ],
            Persistence\Generic\Session::class => [ static::class, 'getSession' ],
            Persistence\Generic\Storage\Typo3DbBackend::class => [ static::class, 'getTypo3DbBackend' ],
            Persistence\Repository::class => [ static::class, 'getRepository' ],
            Property\PropertyMapper::class => [ static::class, 'getPropertyMapper' ],
            Property\PropertyMappingConfigurationBuilder::class => [ static::class, 'getPropertyMappingConfigurationBuilder' ],
            Property\TypeConverter\FileConverter::class => [ static::class, 'getFileConverter' ],
            Property\TypeConverter\FileReferenceConverter::class => [ static::class, 'getFileReferenceConverter' ],
            Property\TypeConverter\FolderBasedFileCollectionConverter::class => [ static::class, 'getFolderBasedFileCollectionConverter' ],
            Property\TypeConverter\FolderConverter::class => [ static::class, 'getFolderConverter' ],
            Property\TypeConverter\IntegerConverter::class => [ static::class, 'getIntegerConverter' ],
            Property\TypeConverter\ObjectConverter::class => [ static::class, 'getObjectConverter' ],
            Property\TypeConverter\StaticFileCollectionConverter::class => [ static::class, 'getStaticFileCollectionConverter' ],
            Property\TypeConverter\StringConverter::class => [ static::class, 'getStringConverter' ],
            Reflection\ReflectionService::class => [ static::class, 'getReflectionService' ],
            Scheduler\TaskExecutor::class => [ static::class, 'getTaskExecutor' ],
            Security\Cryptography\HashService::class => [ static::class, 'getHashService' ],
            Service\CacheService::class => [ static::class, 'getCacheService' ],
            Service\EnvironmentService::class => [ static::class, 'getEnvironmentService' ],
            Service\ExtensionService::class => [ static::class, 'getExtensionService' ],
            Service\FlexFormService::class => [ static::class, 'getFlexFormService' ],
            Service\ImageService::class => [ static::class, 'getImageService' ],
            SignalSlot\Dispatcher::class => [ static::class, 'getDispatcher' ],
            Validation\ValidatorResolver::class => [ static::class, 'getValidatorResolver' ],
        ];
    }

    public static function getCommandManager(ContainerInterface $container): Mvc\Cli\CommandManager
    {
        return GeneralUtility::makeInstance(Mvc\Cli\CommandManager::class);
    }

    public static function getRequestBuilder(ContainerInterface $container): Mvc\Cli\RequestBuilder
    {
        return GeneralUtility::makeInstance(Mvc\Cli\RequestBuilder::class);
    }

    public static function getMvcPropertyMappingConfigurationService(ContainerInterface $container): Mvc\Controller\MvcPropertyMappingConfigurationService
    {
        return GeneralUtility::makeInstance(Mvc\Controller\MvcPropertyMappingConfigurationService::class);
    }

    public static function getDispatcher(ContainerInterface $container): Mvc\Dispatcher
    {
        return GeneralUtility::makeInstance(Mvc\Dispatcher::class);
    }

    public static function getCacheHashEnforcer(ContainerInterface $container): Mvc\Web\CacheHashEnforcer
    {
        return GeneralUtility::makeInstance(Mvc\Web\CacheHashEnforcer::class);
    }

    public static function getRequestBuilder(ContainerInterface $container): Mvc\Web\RequestBuilder
    {
        return GeneralUtility::makeInstance(Mvc\Web\RequestBuilder::class);
    }

    public static function getContainer(ContainerInterface $container): Object\Container\Container
    {
        return GeneralUtility::makeInstance(Object\Container\Container::class);
    }

    public static function getBackend(ContainerInterface $container): Persistence\Generic\Backend
    {
        return GeneralUtility::makeInstance(Persistence\Generic\Backend::class);
    }

    public static function getDataMapFactory(ContainerInterface $container): Persistence\Generic\Mapper\DataMapFactory
    {
        return GeneralUtility::makeInstance(Persistence\Generic\Mapper\DataMapFactory::class);
    }

    public static function getDataMapper(ContainerInterface $container): Persistence\Generic\Mapper\DataMapper
    {
        return GeneralUtility::makeInstance(Persistence\Generic\Mapper\DataMapper::class);
    }

    public static function getPersistenceManager(ContainerInterface $container): Persistence\Generic\PersistenceManager
    {
        return GeneralUtility::makeInstance(Persistence\Generic\PersistenceManager::class);
    }

    public static function getQueryObjectModelFactory(ContainerInterface $container): Persistence\Generic\Qom\QueryObjectModelFactory
    {
        return GeneralUtility::makeInstance(Persistence\Generic\Qom\QueryObjectModelFactory::class);
    }

    public static function getQueryFactory(ContainerInterface $container): Persistence\Generic\QueryFactory
    {
        return GeneralUtility::makeInstance(Persistence\Generic\QueryFactory::class);
    }

    public static function getSession(ContainerInterface $container): Persistence\Generic\Session
    {
        return GeneralUtility::makeInstance(Persistence\Generic\Session::class);
    }

    public static function getTypo3DbBackend(ContainerInterface $container): Persistence\Generic\Storage\Typo3DbBackend
    {
        return GeneralUtility::makeInstance(Persistence\Generic\Storage\Typo3DbBackend::class);
    }

    public static function getRepository(ContainerInterface $container): Persistence\Repository
    {
        return GeneralUtility::makeInstance(Persistence\Repository::class);
    }

    public static function getPropertyMapper(ContainerInterface $container): Property\PropertyMapper
    {
        return GeneralUtility::makeInstance(Property\PropertyMapper::class);
    }

    public static function getPropertyMappingConfigurationBuilder(ContainerInterface $container): Property\PropertyMappingConfigurationBuilder
    {
        return GeneralUtility::makeInstance(Property\PropertyMappingConfigurationBuilder::class);
    }

    public static function getFileConverter(ContainerInterface $container): Property\TypeConverter\FileConverter
    {
        return GeneralUtility::makeInstance(Property\TypeConverter\FileConverter::class);
    }

    public static function getFileReferenceConverter(ContainerInterface $container): Property\TypeConverter\FileReferenceConverter
    {
        return GeneralUtility::makeInstance(Property\TypeConverter\FileReferenceConverter::class);
    }

    public static function getFolderBasedFileCollectionConverter(ContainerInterface $container): Property\TypeConverter\FolderBasedFileCollectionConverter
    {
        return GeneralUtility::makeInstance(Property\TypeConverter\FolderBasedFileCollectionConverter::class);
    }

    public static function getFolderConverter(ContainerInterface $container): Property\TypeConverter\FolderConverter
    {
        return GeneralUtility::makeInstance(Property\TypeConverter\FolderConverter::class);
    }

    public static function getIntegerConverter(ContainerInterface $container): Property\TypeConverter\IntegerConverter
    {
        return GeneralUtility::makeInstance(Property\TypeConverter\IntegerConverter::class);
    }

    public static function getObjectConverter(ContainerInterface $container): Property\TypeConverter\ObjectConverter
    {
        return GeneralUtility::makeInstance(Property\TypeConverter\ObjectConverter::class);
    }

    public static function getStaticFileCollectionConverter(ContainerInterface $container): Property\TypeConverter\StaticFileCollectionConverter
    {
        return GeneralUtility::makeInstance(Property\TypeConverter\StaticFileCollectionConverter::class);
    }

    public static function getStringConverter(ContainerInterface $container): Property\TypeConverter\StringConverter
    {
        return GeneralUtility::makeInstance(Property\TypeConverter\StringConverter::class);
    }

    public static function getReflectionService(ContainerInterface $container): Reflection\ReflectionService
    {
        return GeneralUtility::makeInstance(Reflection\ReflectionService::class);
    }

    public static function getTaskExecutor(ContainerInterface $container): Scheduler\TaskExecutor
    {
        return GeneralUtility::makeInstance(Scheduler\TaskExecutor::class);
    }

    public static function getHashService(ContainerInterface $container): Security\Cryptography\HashService
    {
        return GeneralUtility::makeInstance(Security\Cryptography\HashService::class);
    }

    public static function getCacheService(ContainerInterface $container): Service\CacheService
    {
        return GeneralUtility::makeInstance(Service\CacheService::class);
    }

    public static function getEnvironmentService(ContainerInterface $container): Service\EnvironmentService
    {
        return GeneralUtility::makeInstance(Service\EnvironmentService::class);
    }

    public static function getExtensionService(ContainerInterface $container): Service\ExtensionService
    {
        return GeneralUtility::makeInstance(Service\ExtensionService::class);
    }

    public static function getFlexFormService(ContainerInterface $container): Service\FlexFormService
    {
        return GeneralUtility::makeInstance(Service\FlexFormService::class);
    }

    public static function getImageService(ContainerInterface $container): Service\ImageService
    {
        return GeneralUtility::makeInstance(Service\ImageService::class);
    }

    public static function getDispatcher(ContainerInterface $container): SignalSlot\Dispatcher
    {
        return GeneralUtility::makeInstance(SignalSlot\Dispatcher::class);
    }

    public static function getValidatorResolver(ContainerInterface $container): Validation\ValidatorResolver
    {
        return GeneralUtility::makeInstance(Validation\ValidatorResolver::class);
    }
}
