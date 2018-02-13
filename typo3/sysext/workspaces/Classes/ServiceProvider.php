<?php
declare(strict_types = 1);
namespace TYPO3\CMS\Workspaces;

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
            Hook\BackendUtilityHook::class => [ static::class, 'getBackendUtilityHook' ],
            Hook\PreviewHook::class => [ static::class, 'getPreviewHook' ],
            Service\AdditionalColumnService::class => [ static::class, 'getAdditionalColumnService' ],
            Service\AdditionalResourceService::class => [ static::class, 'getAdditionalResourceService' ],
            Service\Dependency\CollectionService::class => [ static::class, 'getCollectionService' ],
            Service\HistoryService::class => [ static::class, 'getHistoryService' ],
            Service\RecordService::class => [ static::class, 'getRecordService' ],
            Service\StagesService::class => [ static::class, 'getStagesService' ],
            Service\WorkspaceService::class => [ static::class, 'getWorkspaceService' ],
        ];
    }

    public static function getBackendUtilityHook(ContainerInterface $container): Hook\BackendUtilityHook
    {
        return GeneralUtility::makeInstance(Hook\BackendUtilityHook::class);
    }

    public static function getPreviewHook(ContainerInterface $container): Hook\PreviewHook
    {
        return GeneralUtility::makeInstance(Hook\PreviewHook::class);
    }

    public static function getAdditionalColumnService(ContainerInterface $container): Service\AdditionalColumnService
    {
        return GeneralUtility::makeInstance(Service\AdditionalColumnService::class);
    }

    public static function getAdditionalResourceService(ContainerInterface $container): Service\AdditionalResourceService
    {
        return GeneralUtility::makeInstance(Service\AdditionalResourceService::class);
    }

    public static function getCollectionService(ContainerInterface $container): Service\Dependency\CollectionService
    {
        return GeneralUtility::makeInstance(Service\Dependency\CollectionService::class);
    }

    public static function getHistoryService(ContainerInterface $container): Service\HistoryService
    {
        return GeneralUtility::makeInstance(Service\HistoryService::class);
    }

    public static function getRecordService(ContainerInterface $container): Service\RecordService
    {
        return GeneralUtility::makeInstance(Service\RecordService::class);
    }

    public static function getStagesService(ContainerInterface $container): Service\StagesService
    {
        return GeneralUtility::makeInstance(Service\StagesService::class);
    }

    public static function getWorkspaceService(ContainerInterface $container): Service\WorkspaceService
    {
        return GeneralUtility::makeInstance(Service\WorkspaceService::class);
    }
}
