<?php
declare(strict_types = 1);
namespace TYPO3\CMS\Core\Command;

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

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use TYPO3\CMS\Core\Core\Bootstrap;

/**
 * Command for dumping the class-loading information.
 */
class CacheWarmupCommand extends Command
{
    /**
     * @var CacheWarmerRegistry
     */
    /*
    protected $cacheWarmer;

    public function __construct(CacheWarmerRegistry $cacheWarmer = null)
    {
        $this->cacheWarmer = $cacheWarmer ?? GeneralUtility::makeInstance($cacheWarmer);
    }
     */

    /**
     * Defines the allowed options for this command
     */
    protected function configure()
    {
        $this->setDescription('Initializes caches');
        $this->setHelp('This command initializes static caches, mostly cache_core related.');
    }

    /**
     * @inheritdoc
     */
    public function isEnabled()
    {
        return true;
    }

    /**
     * Dumps the class loading information
     *
     * @inheritdoc
     */
    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $io = new SymfonyStyle($input, $output);

        $cacheManager = Bootstrap::createCacheManager(false);
        $coreCache = $cacheManager->getCache('cache_core');

        $packageManager = Bootstrap::createPackageManager(\TYPO3\CMS\Core\Package\PackageManager::class, $coreCache);

        $containerBuilder = new \TYPO3\CMS\Core\DependencyInjection\ContainerBuilder($coreCache, $packageManager);

        $containerBuilder->warmupCache();
        /*
        foreach ($this->cacheWarmerRegistry as $cacheWarmer) {
            $cacheWarmer->warmUp($cacheManager);
        }
         */
        $io->success('Cache is warm.');
    }
}
