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

use Composer\Autoload\ClassLoader;
use Composer\Composer;
use Composer\IO\IOInterface;
use Composer\Script\Event;
use Composer\Util\Filesystem;
use Psr\Container\ContainerInterface;
use TYPO3\CMS\Composer\Plugin\Config;
use TYPO3\CMS\Composer\Plugin\Core\InstallerScript;
use TYPO3\CMS\Core\Core\Bootstrap;
use TYPO3\CMS\Core\Core\SystemEnvironmentBuilder;
use TYPO3\CMS\Core\DependencyInjection\ContainerBuilder;
use TYPO3\CMS\Core\Package\PackageManager;

class CompileContainer implements InstallerScript
{
    /**
     * @var IOInterface
     */
    private $io;

    /**
     * @var ClassLoader
     */
    private $classLoader;

    public function __construct(IOInterface $io, ClassLoader $classLoader)
    {
        $this->io = $io;
        $this->classLoader = $classLoader;
    }

    /**
     * Initialize \TYPO3\CMS\Core\Core\Environment
     */
    protected function initializeCoreEnvironmentClass(Composer $composer): void
    {
        $pluginConfig = Config::load($composer);
        $filesystem = new Filesystem;

        // 'root-dir' may contain '/.' at the end – therefore we normalize both paths
        // in order for the TYPO3_PATH_ROOT != TYPO3_PATH_APP check in SystemEnvironmentBuilder
        // to work properly
        putenv('TYPO3_PATH_ROOT=' . $filesystem->normalizePath($pluginConfig->get('root-dir')));
        putenv('TYPO3_PATH_APP=' . $filesystem->normalizePath($pluginConfig->get('app-dir')));

        $backupArgv = $_SERVER['argv'] ?? null;
        $_SERVER['argv'][0] = getenv('TYPO3_PATH_ROOT') . '/typo3/sysext/core/bin/typo3';

        SystemEnvironmentBuilder::run(4, SystemEnvironmentBuilder::REQUESTTYPE_CLI);

        if ($backupArgv !== null) {
            $_SERVER['argv'] = $backupArgv;
        }
    }

    protected function bootFailsafe(Composer $composer): ContainerInterface
    {
        $failsafe = true;
        var_dump($this->classLoader);
        $this->initializeCoreEnvironmentClass($composer);
        return Bootstrap::init($this->classLoader, $failsafe);
    }

    public function run(Event $event): bool
    {
        $this->io->writeError(''); // Create a newline after composers "Generating autoload files"
        $this->io->writeError('<info>Compiling dependency injection container</info>', false);

        $container = $this->bootFailsafe($event->getComposer());
        $containerBuilder = $container->get(ContainerBuilder::class);

        $containerBuilder->warmupCache(
            $container->get(PackageManager::class),
            // create a writable 'core' cache instance
            // ('core.cache' container entry uses a NullBackend as we booted in failsafe mode)
            Bootstrap::createCache('core')
        );

        $this->io->overwriteError('<info>Generated dependency injection container</info>');

        return true;
    }
}
