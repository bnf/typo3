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

namespace TYPO3\CMS\Install\Factory;

use TYPO3\CMS\Core\Page\ImportMap;
use TYPO3\CMS\Core\Crypto\HashService;
use TYPO3\CMS\Core\Package\FailsafePackageManager;
use TYPO3\CMS\Core\EventDispatcher\EventDispatcher;
use TYPO3\CMS\Core\EventDispatcher\ListenerProvider;
use Psr\EventDispatcher\EventDispatcherInterface;
use Psr\Container\ContainerInterface;

final class ImportMapFactory
{
    public function __construct(
        private readonly FailsafePackageManager $packageManager,
        private readonly HashService $hashService,
        private readonly ContainerInterface $container,
    ) {}

    public function create(): ImportMap
    {
        $packages = [
            $this->packageManager->getPackage('core'),
            $this->packageManager->getPackage('backend'),
            $this->packageManager->getPackage('install'),
        ];
        return new ImportMap(
            hashService: $this->hashService,
            packages: $packages,
            eventDispatcher: $this->createEventDispatcher(),
        );
    }

    public function createEventDispatcher(): EventDispatcherInterface
    {
        return new EventDispatcher(
            new ListenerProvider($this->container)
        );
    }
}
