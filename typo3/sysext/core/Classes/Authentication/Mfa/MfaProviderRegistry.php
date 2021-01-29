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

namespace TYPO3\CMS\Core\Authentication\Mfa;

/**
 * Registry for configuration providers which is called by the ConfigurationProviderPass
 *
 * @internal
 */
final class MfaProviderRegistry
{
    /**
     * @var MfaProviderInterface[]
     */
    protected array $providers = [];

    public function registerProvider(MfaProviderInterface $provider): void
    {
        $this->providers[$provider->getIdentifier()] = $provider;
    }

    public function hasProvider(string $identifer): bool
    {
        return isset($this->providers[$identifer]);
    }

    public function hasProviders(): bool
    {
        return $this->providers !== [];
    }

    public function getProvider(string $identifier): MfaProviderInterface
    {
        if (!$this->hasProvider($identifier)) {
            throw new \InvalidArgumentException('No MFA provider for identifier ' . $identifier . 'found.', 1610994735);
        }

        return $this->providers[$identifier];
    }

    public function getProviders(): array
    {
        return $this->providers;
    }
}
