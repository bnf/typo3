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
 * Provide basic information about the provider, used in various views
 *
 * @see MfaProviderInterface::getManifest()
 */
interface MfaProviderManifestInterface
{
    /**
     * Unique provider identifier
     *
     * @return string
     */
    public function getIdentifier(): string;

    /**
     * Check if provider is active for the user by e.g. checking the user
     * record for some provider specific active state.
     *
     * @param MfaProviderPropertyManager $propertyManager
     * @return bool
     */
    public function isActive(MfaProviderPropertyManager $propertyManager): bool;

    public function getTitle(): string;

    public function getDescription(): string;

    public function getIconIdentifier(): string;

    public function isDefaultProviderAllowed(): bool;

    public function getInstance(): MfaProviderInterface;
}
