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

namespace TYPO3\CMS\Core\Core;

use Psr\Container\ContainerInterface;
use Psr\EventDispatcher\EventDispatcherInterface;
use TYPO3\CMS\Core\Configuration\Extension\ExtLocalconfFactory;
use TYPO3\CMS\Core\Configuration\Extension\ExtTablesFactory;
use TYPO3\CMS\Core\Configuration\Tca\TcaFactory;
use TYPO3\CMS\Core\Core\Event\BootCompletedEvent;
use TYPO3\CMS\Core\DependencyInjection\ContainerBuilder;
use TYPO3\CMS\Core\Package\PackageManager;
use TYPO3\CMS\Core\Schema\TcaSchemaFactory;
use TYPO3\CMS\Core\Utility\ExtensionManagementUtility;
use TYPO3\CMS\Core\Utility\GeneralUtility;

/**
 * @internal This is NOT an API class, it is for internal use in TYPO3 core only.
 */
class BootService
{
    private ContainerBuilder $containerBuilder;

    private ContainerInterface $failsafeContainer;

    private ?ContainerInterface $container = null;

    public function __construct(ContainerBuilder $containerBuilder, ContainerInterface $failsafeContainer)
    {
        $this->containerBuilder = $containerBuilder;
        $this->failsafeContainer = $failsafeContainer;
    }

    public function getContainer(bool $allowCaching = true): ContainerInterface
    {
        return $this->container ?? $this->prepareContainer($allowCaching);
    }

    private function prepareContainer(bool $allowCaching = true): ContainerInterface
    {
        $packageManager = $this->failsafeContainer->get(PackageManager::class);
        $dependencyInjectionContainerCache = $this->failsafeContainer->get('cache.di');

        $failsafe = false;

        // Build a non-failsafe container which is required for loading ext_localconf
        $this->container = $this->containerBuilder->createDependencyInjectionContainer($packageManager, $dependencyInjectionContainerCache, $failsafe);
        $this->container->set('_early.boot-service', $this);
        if ($allowCaching) {
            $this->container->get('boot.state')->cacheDisabled = false;
            $coreCache = Bootstrap::createCache('core');
            // Core cache is initialized with a NullBackend in failsafe mode.
            // Replace it with a new cache that uses the real backend.
            $this->container->set('_early.cache.core', $coreCache);
            if (!Environment::isComposerMode()) {
                $this->container->get(PackageManager::class)->setPackageCache(Bootstrap::createPackageCache($coreCache));
            }
        }

        return $this->container;
    }

    /**
     * Switch global context to a new context, or revert
     * to the original booting container if no container
     * is specified
     */
    public function makeCurrent(?ContainerInterface $container = null, array $backup = []): array
    {
        $container = $container ?? $backup['container'] ?? $this->failsafeContainer;

        $newBackup = [
            'singletonInstances' => GeneralUtility::getSingletonInstances(),
            'container' => GeneralUtility::getContainer(),
        ];

        GeneralUtility::purgeInstances();

        // Set global state to the non-failsafe container and it's instances
        GeneralUtility::setContainer($container);
        ExtensionManagementUtility::setPackageManager($container->get(PackageManager::class));

        $backupSingletonInstances = $backup['singletonInstances'] ?? [];
        foreach ($backupSingletonInstances as $className => $instance) {
            GeneralUtility::setSingletonInstance($className, $instance);
        }

        return $newBackup;
    }

    /**
     * Bootstrap a non-failsafe container and load ext_localconf
     *
     * Use by actions like the database analyzer and the upgrade wizards which
     * need additional bootstrap actions performed.
     *
     * Those actions can potentially fatal if some old extension is loaded that triggers
     * a fatal in ext_localconf or ext_tables code! Use only if really needed.
     *
     * @param bool $resetContainer
     * @param bool $allowCaching
     */
    public function loadExtLocalconfDatabaseAndExtTables(bool $resetContainer = false, bool $allowCaching = true, bool $loadExtTables = true): ContainerInterface
    {
        $container = $this->getContainer($allowCaching);

        $backup = $this->makeCurrent($container);
        $beUserBackup = $GLOBALS['BE_USER'] ?? null;

        $container->get('boot.state')->complete = false;

        // @todo load default settings from definitions here.
        // (once we remove defaults from DefaultConfiguration.php)

        $eventDispatcher = $container->get(EventDispatcherInterface::class);
        $tcaFactory = $container->get(TcaFactory::class);
        if ($allowCaching) {
            $container->get(ExtLocalconfFactory::class)->load();
        } else {
            $container->get(ExtLocalconfFactory::class)->loadUncached();
        }
        Bootstrap::populateSettings($container->get('settings'));
        Bootstrap::unsetReservedGlobalVariables();
        $GLOBALS['BE_USER'] = $beUserBackup;
        if ($allowCaching) {
            $GLOBALS['TCA'] = $tcaFactory->get();
        } else {
            $GLOBALS['TCA'] = $tcaFactory->create();
        }
        $container->get('boot.state')->complete = true;
        if ($allowCaching) {
            $container->get(TcaSchemaFactory::class)->load($GLOBALS['TCA']);
        } else {
            $container->get(TcaSchemaFactory::class)->rebuild($GLOBALS['TCA']);
        }
        $eventDispatcher->dispatch(new BootCompletedEvent($allowCaching));
        if ($loadExtTables) {
            if ($allowCaching) {
                $container->get(ExtTablesFactory::class)->load();
            } else {
                $container->get(ExtTablesFactory::class)->loadUncached();
            }
        }

        if ($resetContainer) {
            $this->makeCurrent(null, $backup);
        }

        return $container;
    }

    public function resetGlobalContainer(): void
    {
        $this->makeCurrent(null, []);
    }

    public function getFailsafeContainer(): ContainerInterface
    {
        return $this->failsafeContainer;
    }
}
