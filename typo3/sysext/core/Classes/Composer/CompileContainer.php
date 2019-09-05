<?php
declare(strict_types = 1);
namespace TYPO3\CMS\Core\Composer;

/*
 * This file is part of the TYPO3 project.
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

use Composer\IO\IOInterface;
use Composer\Script\Event;
use Composer\Util\Filesystem;
use TYPO3\CMS\Composer\Plugin\Config;
use TYPO3\CMS\Composer\Plugin\Core\InstallerScript;
use TYPO3\CMS\Core\Cache\Frontend\NullFrontend;
use TYPO3\CMS\Core\Core\Bootstrap;
use TYPO3\CMS\Core\Core\SystemEnvironmentBuilder;
use TYPO3\CMS\Core\Package\FailsafePackageManager;

class CompileContainer implements InstallerScript
{
    /**
     * @var IOInterface
     */
    private $io;

    public function __construct(IOInterface $io)
    {
        $this->io = $io;
    }

    /**
     * Initialize \TYPO3\CMS\Core\Core\Environemt
     */
    protected function initializeCoreEnvironmentClass(Event $event): void
    {
        $pluginConfig = Config::load($event->getComposer());
        $filesystem = new Filesystem;
        // 'root-dir' may contain '/.' at the end – therefore we normalize both paths
        // in order for the TYPO3_PATH_ROOT != TYPO3_PATH_APP check in SystemEnvironmentBuilder
        // to work properly
        putenv('TYPO3_PATH_ROOT=' . $filesystem->normalizePath($pluginConfig->get('root-dir')));
        putenv('TYPO3_PATH_APP=' . $filesystem->normalizePath($pluginConfig->get('app-dir')));

        SystemEnvironmentBuilder::run(0, SystemEnvironmentBuilder::REQUESTTYPE_CLI);
    }

    protected function loadConfiguration(): void
    {
        Bootstrap::createConfigurationManager()->exportConfiguration();
    }

    protected function compileContainer(): void
    {
        Bootstrap::createContainerBuilder()->warmupCache(
            Bootstrap::createPackageManager(FailsafePackageManager::class, new NullFrontend('core')),
            Bootstrap::createCache('core')
        );
    }

    public function run(Event $event): bool
    {
        $this->io->writeError(''); // Create a newline after composers "Generating autoload files"
        $this->io->writeError('<info>Compiling dependency injection container</info>', false);

        $this->initializeCoreEnvironmentClass($event);
        $this->loadConfiguration();
        $this->compileContainer();

        $this->io->overwriteError('<info>Generated dependency injection container</info>');

        return true;
    }
}
