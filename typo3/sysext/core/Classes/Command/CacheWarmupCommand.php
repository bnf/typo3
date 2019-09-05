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

namespace TYPO3\CMS\Core\Command;

use Psr\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use TYPO3\CMS\Core\Cache\Event\CacheWarmupEvent;
use TYPO3\CMS\Core\Cache\Frontend\FrontendInterface;
use TYPO3\CMS\Core\Core\BootService;
use TYPO3\CMS\Core\DependencyInjection\ContainerBuilder;
use TYPO3\CMS\Core\Package\PackageManager;

class CacheWarmupCommand extends Command
{
    protected ContainerBuilder $containerBuilder;
    protected BootService $bootService;
    protected PackageManager $packageManager;
    protected FrontendInterface $dependencyInjectionCache;

    public function __construct(
        ContainerBuilder $containerBuilder,
        PackageManager $packageManager,
        FrontendInterface $dependencyInjectionCache,
        BootService $bootService
    ) {
        $this->containerBuilder = $containerBuilder;
        $this->packageManager = $packageManager;
        $this->dependencyInjectionCache = $dependencyInjectionCache;
        $this->bootService = $bootService;
        parent::__construct('cache:warmup');
    }

    /**
     * Defines the allowed options for this command
     */
    protected function configure()
    {
        $this->setDescription('Cache warmup for all, system or frontend caches.');
        $this->setHelp('This command is useful during deployment to warmup caches before in preparatory steps.');
        $this->setDefinition([
            new InputArgument('group', InputArgument::OPTIONAL, 'The cache group to warmup (system, frontend, di, all)', 'all'),
        ]);
    }

    /**
     * {@inheritdoc}
     */
    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $group = $input->getArgument('group') ?? 'all';

        if ($group === 'all' || $group === 'system' || $group === 'di') {
            $this->containerBuilder->warmupCache($this->packageManager, $this->dependencyInjectionCache);
        }

        $container = $this->bootService->getContainer();

        $eventDispatcher = $container->get(EventDispatcherInterface::class);
        $event = new CacheWarmupEvent($group);
        $eventDispatcher->dispatch($event);

        if (count($event->getErrors()) > 0) {
            return 1;
        }

        return 0;
    }
}
