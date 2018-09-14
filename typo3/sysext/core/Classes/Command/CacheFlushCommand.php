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
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use TYPO3\CMS\Core\Configuration\ConfigurationManager;
use TYPO3\CMS\Core\Core\Bootstrap;
use TYPO3\CMS\Core\Cache\CacheManager;
use TYPO3\CMS\Core\Core\ClassLoadingInformation;
use TYPO3\CMS\Core\Core\Environment;
use TYPO3\CMS\Core\Package\PackageManager;
use TYPO3\CMS\Core\Utility\GeneralUtility;

/**
 * Command for flushing caches
 */
class CacheFlushCommand extends Command
{
    /**
     * Defines the allowed options for this command
     */
    protected function configure()
    {
        $this->setDescription('Flushes caches.');
        $this->setHelp('This command is used to flush caches.');
    }

    /**
     * This command is only useful in composer mode.
     *
     * @inheritdoc
     */
    public function isEnabled()
    {
        return true;
    }

    /**
     * Dump PackageStates.php
     *
     * @inheritdoc
     */
    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $io = new SymfonyStyle($input, $output);

        $packageManager = GeneralUtility::makeInstance(PackageManager::class);
        if ($packageManager instanceof \TYPO3\CMS\Core\Package\FailsafePackageManager) {

            GeneralUtility::makeInstance(\TYPO3\CMS\Install\Service\ClearCacheService::class)->clearAll();

            // Create CacheManager from default configuration without disabled caches
            /*
            $cacheManager = Bootstrap::createCacheManager(false);
            try {
                $cacheManager->flushCaches();
            } catch (\Throwable $e) {
            }
             */

            if (!$this->checkIfEssentialConfigurationExists()) {
                $io->success('Default file caches have been flushed.');
                // We are done here.
                return;
            }

            /*
            $io->note('About to load ext_localconf.php files to flush all configured caches.');
            try {
                Bootstrap::loadTypo3LoadedExtAndExtLocalconf(false);
            } catch (\Throwable $e) {
                //var_dump($e);
                $exceptionCodeNumber = $e->getCode() > 0 ? '#' . $e->getCode() . ': ' : '';

                $io->error([
                    'Caught ' . ($e instanceof \Error ? 'PHP error' : 'Exception') . ' while trying to load ext_localconf.php files:',
                    $exceptionCodeNumber . $e->getMessage(),
                    'thrown in file ' . $e->getFile() . ' in line ' . $e->getLine()
                ]);
            }

            Bootstrap::setFinalCachingFrameworkCacheConfiguration($cacheManager);
            $cacheManager->flushCaches();
             */

        } else {
            // retrieve existing cachemanager instance
            $cacheManager = GeneralUtility::makeInstance(CacheManager::class);
            $cacheManager->flushCaches();
        }
        $io->success('All caches have been flushed.');
    }

    /**
     * Check if LocalConfiguration.php and PackageStates.php exist
     *
     * @return bool TRUE when the essential configuration is available, otherwise FALSE
     */
    protected function checkIfEssentialConfigurationExists(): bool
    {
        $configurationManager = GeneralUtility::makeInstance(ConfigurationManager::class);
        return file_exists($configurationManager->getLocalConfigurationFileLocation());
            //&& file_exists(Environment::getLegacyConfigPath() . '/PackageStates.php');
    }

}
