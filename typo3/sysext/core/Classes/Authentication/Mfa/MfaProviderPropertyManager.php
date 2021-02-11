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

use TYPO3\CMS\Core\Authentication\AbstractUserAuthentication;
use TYPO3\CMS\Core\Context\Context;
use TYPO3\CMS\Core\Database\ConnectionPool;
use TYPO3\CMS\Core\Database\Query\Restriction\DeletedRestriction;
use TYPO3\CMS\Core\Utility\GeneralUtility;

/**
 * Basic manager for MFA providers to access and update their
 * properties (information) from the mfa column in the user array.
 */
class MfaProviderPropertyManager
{
    protected AbstractUserAuthentication $user;
    protected array $mfa;
    protected string $providerIdentifier;
    protected array $providerProperties;

    public function __construct(AbstractUserAuthentication $user, string $provider)
    {
        $this->user = $user;
        $this->mfa = json_decode($user->user['mfa'] ?? '', true) ?? [];
        $this->providerIdentifier = $provider;
        $this->providerProperties = $this->mfa[$provider] ?? [];
    }

    /**
     * Check if a provider entry exists for the current user
     *
     * @return bool
     */
    public function hasProviderEntry(): bool
    {
        return isset($this->mfa[$this->providerIdentifier]);
    }

    /**
     * Check if a provider property exists
     *
     * @param string $key
     * @return bool
     */
    public function hasProperty(string $key): bool
    {
        return isset($this->providerProperties[$key]);
    }

    /**
     * Get a provider specific property value or the defined
     * default value if the requested property was not found.
     *
     * @param string $key
     * @param null $default
     * @return mixed|null
     */
    public function getProperty(string $key, $default = null)
    {
        return $this->providerProperties[$key] ?? $default;
    }

    /**
     * Get provider specific properties
     *
     * @return array
     */
    public function getProperties(): array
    {
        return $this->providerProperties;
    }

    /**
     * Update the provider properties or create the provider entry if not yet present
     *
     * @param array $properties
     * @return bool
     */
    public function updateProperties(array $properties): bool
    {
        if (!isset($properties['updated'])) {
            $properties['updated'] = GeneralUtility::makeInstance(Context::class)->getPropertyFromAspect('date', 'timestamp');
        }

        $this->providerProperties = array_replace($this->providerProperties, $properties) ?? [];
        $this->mfa[$this->providerIdentifier] = $this->providerProperties;
        return $this->storeProperties();
    }

    /**
     * Create a new provider entry for the current user
     * Note: If a entry already exists, use updateProperties() instead.
     *       This can be checked with hasProviderEntry().
     *
     * @param array $properties
     * @return bool
     */
    public function createProviderEntry(array $properties): bool
    {
        // This is to prevent unintentional overwriting of provider entries
        if ($this->hasProviderEntry()) {
            throw new \InvalidArgumentException(
                'A entry for provider ' . $this->providerIdentifier . ' already exists. Use updateProperties() instead.',
                1612781782
            );
        }

        if (!isset($properties['created'])) {
            $properties['created'] = GeneralUtility::makeInstance(Context::class)->getPropertyFromAspect('date', 'timestamp');
        }

        if (!isset($properties['updated'])) {
            $properties['updated'] = GeneralUtility::makeInstance(Context::class)->getPropertyFromAspect('date', 'timestamp');
        }

        $this->providerProperties = $properties;
        $this->mfa[$this->providerIdentifier] = $this->providerProperties;
        return $this->storeProperties();
    }

    /**
     * Delete a provider entry for the current user
     *
     * @return bool
     * @throws \JsonException
     */
    public function deleteProviderEntry(): bool
    {
        $this->providerProperties = [];
        unset($this->mfa[$this->providerIdentifier]);
        return $this->storeProperties();
    }

    /**
     * Stores the updated properties in the user array and the database
     *
     * @return bool
     * @throws \JsonException
     */
    protected function storeProperties(): bool
    {
        // encode the mfa properties to store them in the database and the user array
        $mfa = json_encode($this->mfa, JSON_THROW_ON_ERROR) ?: '';

        // Write back the updated mfa properties to the user array
        $this->user->user['mfa'] = $mfa;

        // Store updated mfa properties in the database
        $queryBuilder = GeneralUtility::makeInstance(ConnectionPool::class)->getQueryBuilderForTable($this->user->user_table);
        $queryBuilder->getRestrictions()->removeAll()->add(GeneralUtility::makeInstance(DeletedRestriction::class));
        return (bool)$queryBuilder
            ->update($this->user->user_table)
            ->set('mfa', $mfa)
            ->where($queryBuilder->expr()->eq('uid', $queryBuilder->createNamedParameter((int)$this->user->user['uid'], \PDO::PARAM_INT)))
            ->execute();
    }

    public function getUser(): AbstractUserAuthentication
    {
        return $this->user;
    }

    public function getIdentifier(): string
    {
        return $this->providerIdentifier;
    }
}
