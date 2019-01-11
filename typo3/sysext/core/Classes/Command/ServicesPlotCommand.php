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
use TYPO3\CMS\Core\Core\Bootstrap;
use TYPO3\CMS\Core\DependencyInjection\ContainerBuilder;
use TYPO3\CMS\Core\Package\PackageManager;

/**
 * Command for dumping a man:dot(1) plot of class dependencies.
 */
class ServicesPlotCommand extends Command
{
    /**
     * Defines the allowed options for this command
     */
    protected function configure()
    {
        $this->setDescription('Output dependency injection graph in man:dot(1) format');
        $this->setHelp('This command plots a dependency graph that can be converted into svg using `dot -Tsvg`');
    }

    /**
     * Dumps the class loading information
     *
     * @inheritdoc
     */
    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $coreCache = Bootstrap::createCache('cache_core', false);
        $packageManager = Bootstrap::createPackageManager(PackageManager::class, $coreCache);

        $containerBuilder = ContainerBuilder::getInstance();
        $output->write($containerBuilder->plotContainer($packageManager));
    }
}
