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
use TYPO3\CMS\Core\Cache\Event\CacheClearEvent;
use TYPO3\CMS\Core\Cache\Frontend\FrontendInterface;
use TYPO3\CMS\Core\Core\BootService;
use TYPO3\CMS\Core\DependencyInjection\ContainerBuilder;
use TYPO3\CMS\Core\Package\PackageManager;

class CacheClearCommand extends Command
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
        parent::__construct('cache:clear');
    }

    /**
     * Defines the allowed options for this command
     */
    protected function configure()
    {
        $this->setDescription('Cache clear for all, system, lowlevel or pages caches.');
        $this->setHelp('This command is useful during deployment to flush caches after a symlink switch.');
        $this->setDefinition([
            new InputArgument('group', InputArgument::OPTIONAL, 'The cache group to flush (system, frontend, di, all)', 'all'),
        ]);
    }

    /**
     * {@inheritdoc}
     */
    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $group = $input->getArgument('group') ?? 'all';

        $container = $this->bootService->getContainer();

        if ($group === 'all' || $group === 'system' || $group === 'di') {
            // @todo adapt to avoid overwriting flush
            $this->dependencyInjectionCache->flush();
        }

        $tags = [];

        $eventDispatcher = $container->get(EventDispatcherInterface::class);
        $event = new CacheClearEvent($group, $tags);
        $eventDispatcher->dispatch($event);

        if (count($event->getErrors()) > 0) {
            return 1;
        }

        return 0;
    }
}
