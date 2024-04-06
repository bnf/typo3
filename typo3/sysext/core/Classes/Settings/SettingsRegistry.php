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

namespace TYPO3\CMS\Core\Settings;

use Psr\Container\ContainerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autoconfigure;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\DependencyInjection\Attribute\AutowireLocator;
use TYPO3\CMS\Core\Attribute\AsEventListener;
use TYPO3\CMS\Core\Cache\Event\CacheWarmupEvent;
use TYPO3\CMS\Core\Cache\Frontend\PhpFrontend;

#[Autoconfigure(public: true)]
class SettingsRegistry
{
    private ?SettingsDefinitionsCollection $settingsDefinitionsCollection = null;

    public function __construct(
        #[Autowire(expression: 'service("package-dependent-cache-identifier").withPrefix("SettingsDefinitions").toString()')]
        protected readonly string $cacheIdentifier,
        #[Autowire(service: 'cache.core')]
        protected readonly PhpFrontend $cache,
        #[AutowireLocator([SettingsDefinitionsCollection::class])]
        protected readonly ContainerInterface $collectionFactory,
    ) {}

    public function getDefinitions(?string $groupName = null): array
    {
        return $this->getCollection()->getDefinitions($groupName);
    }

    public function getCategoryDefinitions(): array
    {
        return $this->getCollection()->getCategoryDefinitions();
    }

    protected function getCollection(): SettingsDefinitionsCollection
    {
        return $this->settingsDefinitionsCollection ?? $this->getFromCache() ?? $this->createCollection();
    }

    protected function getFromCache(): ?SettingsDefinitionsCollection
    {
        if (!$this->cache->has($this->cacheIdentifier)) {
            return null;
        }
        try {
            $this->settingsDefinitionsCollection = $this->cache->require($this->cacheIdentifier);
        } catch (\Error) {
            return null;
        }
        return $this->settingsDefinitionsCollection;
    }

    protected function createCollection(): SettingsDefinitionsCollection
    {
        $this->settingsDefinitionsCollection = $this->collectionFactory->get(SettingsDefinitionsCollection::class);
        $this->cache->set($this->cacheIdentifier, 'return ' . var_export($this->settingsDefinitionsCollection, true) . ';');
        return $this->settingsDefinitionsCollection;
    }

    #[AsEventListener('typo3-core/settings-registry')]
    public function warmupCaches(CacheWarmupEvent $event): void
    {
        if ($event->hasGroup('system')) {
            $this->createCollection();
        }
    }
}
