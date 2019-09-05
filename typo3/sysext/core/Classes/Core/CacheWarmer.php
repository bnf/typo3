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

use Psr\EventDispatcher\EventDispatcherInterface;
use TYPO3\CMS\Core\Cache\Event\CacheWarmupEvent;
use TYPO3\CMS\Core\Cache\Frontend\FrontendInterface;
use TYPO3\CMS\Core\Localization\LocalizationFactory;
use TYPO3\CMS\Core\Package\PackageManager;
use TYPO3\CMS\Core\Utility\ExtensionManagementUtility;

/**
 * @internal
 */
class CacheWarmer
{
    protected FrontendInterface $coreCache;
    protected PackageManager $packageManager;
    protected EventDispatcherInterface $eventDispatcher;
    protected LocalizationFactory $localizationFactory;

    public function __construct(
        FrontendInterface $coreCache,
        PackageManager $packageManager,
        EventDispatcherInterface $eventDispatcher,
        LocalizationFactory $localizationFactory
    ) {
        $this->coreCache = $coreCache;
        $this->packageManager = $packageManager;
        $this->eventDispatcher = $eventDispatcher;
        $this->localizationFactory = $localizationFactory;
    }

    public function warmupCaches(CacheWarmupEvent $event): void
    {
        $group = $event->getGroup();
        if ($group === 'system' || $group === 'all') {
            $cache = $this->coreCache;
            ExtensionManagementUtility::setPackageManager($this->packageManager);
            ExtensionManagementUtility::setEventDispatcher($this->eventDispatcher);
            ExtensionManagementUtility::createExtLocalconfCacheEntry($cache);
            ExtensionManagementUtility::buildBaseTcaFromSingleFiles();
            ExtensionManagementUtility::createBaseTcaCacheFile($cache);
            ExtensionManagementUtility::createExtTablesCacheEntry($cache);

            $languages = array_merge(['default'], $GLOBALS['TYPO3_CONF_VARS']['EXTCONF']['lang']['availableLanguages'] ?? []);
            $packages = $this->packageManager->getActivePackages();
            foreach ($packages as $package) {
                $dir = $package->getPackagePath() . 'Resources/Private/Language';
                if (!is_dir($dir)) {
                    continue;
                }
                $recursiveIterator = new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($dir));
                // Search for all files with suffix *.xlf and  without a dot in the file basename
                $fileIterator = new \RegexIterator($recursiveIterator, '#^.+/[^.]+\.xlf$#', \RegexIterator::GET_MATCH);
                $shorthand = 'EXT:' . $package->getPackageKey() . '/Resources/Private/Language';
                foreach ($fileIterator as $match) {
                    $fileReference = str_replace($dir, $shorthand, $match[0]);
                    foreach ($languages as $language) {
                        // @todo: Force cache renewal
                        $this->localizationFactory->getParsedData($fileReference, $language);
                    }
                }
            }
        }
    }
}
