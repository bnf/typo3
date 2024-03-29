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

namespace TYPO3\CMS\Core\Profile;

use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autoconfigure;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use TYPO3\CMS\Core\Attribute\AsEventListener;
use TYPO3\CMS\Core\Cache\Event\CacheWarmupEvent;
use TYPO3\CMS\Core\Cache\Frontend\PhpFrontend;
use TYPO3\CMS\Core\Service\DependencyOrderingService;

#[Autoconfigure(public: true)]
class ProfileRegistry
{
    /** @var list<ProfileDefinition>|null */
    protected ?array $orderedProfiles = null;

    public function __construct(
        protected DependencyOrderingService $dependencyOrderingService,
        #[Autowire(expression: 'service("package-dependent-cache-identifier").withPrefix("Profiles").toString()')]
        protected readonly string $cacheIdentifier,
        #[Autowire(service: 'cache.core')]
        protected readonly PhpFrontend $cache,
        #[Autowire(lazy: true)]
        protected ProfileCollector $profileCollector,
        protected LoggerInterface $logger,
    ) {}

    /**
     * Retrieve list of ordered profiles, matched by
     * $profileNames, including their dependencies (recursive)
     *
     * @return list<ProfileDefinition>
     */
    public function getProfiles(string ...$profileNames): array
    {
        return array_values(array_filter(
            $this->getOrderedProfiles(),
            fn(ProfileDefinition $profile): bool =>
                in_array($profile->name, $profileNames, true) ||
                $this->hasDependency($profileNames, $profile->name)
        ));
    }

    public function hasProfile(string $profileName): bool
    {
        return isset($this->getOrderedProfiles()[$profileName]);
    }

    public function getProfile(string $profileName): ?ProfileDefinition
    {
        return $this->getOrderedProfiles()[$profileName] ?? null;
    }

    /**
     * @return array<string, ProfileDefinition>
     */
    protected function getOrderedProfiles(): array
    {
        return $this->orderedProfiles ?? $this->getFromCache() ?? $this->computeOrderedProfiles();
    }

    /**
     * @return array<string, ProfileDefinition>
     */
    protected function getFromCache(): ?array
    {
        if (!$this->cache->has($this->cacheIdentifier)) {
            return null;
        }
        $this->orderedProfiles = $this->cache->require($this->cacheIdentifier);
        return $this->orderedProfiles;
    }

    /**
     * @return array<string, ProfileDefinition>
     */
    protected function computeOrderedProfiles(): array
    {
        $tmp = [];
        $profiles = $this->profileCollector->getProfileDefinitions();
        foreach ($profiles as $profile) {
            foreach ($profile->dependencies as $dependencyName) {
                if (isset($profiles[$dependencyName])) {
                    continue;
                }
                $this->logger->error('Invalid profile "{name}": Missing dependency "{dependency}"', [
                    'name' => $profile->name,
                    'dependency' => $dependencyName,
                ]);
                continue 2;
            }
            $tmp[$profile->name] = [
                'profile' => $profile,
                'after' => $profile->dependencies,
            ];
        }

        $this->orderedProfiles = array_map(
            static fn(array $data): ProfileDefinition => $data['profile'],
            $this->dependencyOrderingService->orderByDependencies($tmp)
        );
        $this->cache->set($this->cacheIdentifier, 'return ' . var_export($this->orderedProfiles, true) . ';');
        return $this->orderedProfiles;
    }

    protected function hasDependency(array $profileNames, string $dependency): bool
    {
        foreach ($profileNames as $profileName) {
            $profile = $this->getProfile($profileName);
            if ($profile === null) {
                continue;
            }

            if (in_array($dependency, $profile->dependencies, true)) {
                return true;
            }

            if ($this->hasDependency($profile->dependencies, $dependency)) {
                return true;
            }
        }
        return false;
    }

    #[AsEventListener('typo3-core/profile-registtry')]
    public function warmupCaches(CacheWarmupEvent $event): void
    {
        if ($event->hasGroup('system')) {
            $this->computeOrderedProfiles();
        }
    }
}
