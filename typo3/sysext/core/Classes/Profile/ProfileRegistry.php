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

use TYPO3\CMS\Core\Service\DependencyOrderingService;
use TYPO3\CMS\Core\Settings\SettingDefinition;

class ProfileRegistry
{
    /** @var ProfileDefinition[] */
    protected array $profiles = [];

    public function __construct(
        protected DependencyOrderingService $dependencyOrderingService,
    ) {}

    public function addProfile(array $profile, string $basePath): void
    {
        $profile = $this->createDefinition($profile, $basePath);
        $this->profiles[$profile->name] = $profile;
    }

    public function getProfileDefinitions(): array
    {
        return $this->profiles;
    }

    /**
     * Retrieve list of ordered profiles, matched by
     * $profileNames, including their dependencies (recursive)
     *
     * @return list<ProfileDefinition>
     */
    public function getProfiles(string ...$profileNames): array
    {
        return array_filter(
            $this->orderedProfiles(),
            fn(ProfileDefinition $profile): bool =>
                in_array($profile->name, $profileNames, true) ||
                $this->hasDependency($profileNames, $profile->name)
        );
    }

    /**
     * @todo cache result
     * @return list<ProfileDefinition>
     */
    protected function orderedProfiles(): array
    {
        $tmp = [];
        foreach ($this->profiles as $profile) {
            $tmp[$profile->name] = [
                'profile' => $profile,
                'after' => $profile->dependencies,
            ];
            foreach ($profile->dependencies as $dependencyName) {
                if (isset($this->profiles[$dependencyName])) {
                    continue;
                }
                if (str_starts_with($dependencyName, 'TYPOSCRIPT:')) {
                    $this->profiles[$dependencyName] = new ProfileDefinition(
                        name: $dependencyName,
                        typoscript: substr($dependencyName, 11),
                    );
                    $tmp[$dependencyName] = [
                        'profile' => $this->profiles[$dependencyName],
                    ];
                    continue;
                }
                throw new \RuntimeException(sprintf(
                    'Missing profile dependency %s for profile %s',
                    $dependencyName,
                    $profile->name
                ), 1710404573);
            }
        }

        $orderedProfiles = $this->dependencyOrderingService->orderByDependencies($tmp);
        return array_column($orderedProfiles, 'profile');
        /*
        return array_map(
            static fn(array $data): ProfileDefinition => $data['profile'],
            $orderedProfiles
        );
         */
    }

    protected function hasDependency(array $profileNames, string $dependency): bool
    {
        foreach ($profileNames as $profileName) {
            $profile = $this->profiles[$profileName] ?? null;
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

    protected function createDefinition(array $profile, string $basePath): ProfileDefinition
    {
        try {

            $settings = [];
            foreach (($profile['settings'] ?? []) as $setting => $options) {
                try {
                    $definition = new SettingDefinition(...[...['key' => $setting], ...$options]);
                } catch (\Error $e) {
                    throw new \Exception('Invalid setting definition: ' . json_encode($options), 1702623312, $e);
                }
                $settings[] = $definition;
            }
            $profileData = [
                ...$profile,
                'settings' => $settings,
            ];
            $profileData['typoscript'] ??= $basePath;
            return new ProfileDefinition(...$profileData);
        } catch (\Error $e) {
            throw new \Exception('Invalid profile definition: ' . json_encode($profile), 1170859526, $e);
        }
    }
}
