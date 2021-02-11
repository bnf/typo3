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

use Psr\Container\ContainerInterface;

/**
 * @internal
 */
final class MfaProviderManifest implements MfaProviderManifestInterface
{
    private string $identifier;
    private string $title;
    private string $description;
    private string $iconIdentifier;
    private bool $isDefaultProviderAllowed;
    private string $serviceName;
    private ContainerInterface $container;

    public function __construct(
        string $identifier,
        string $title,
        string $description,
        string $iconIdentifier,
        bool $isDefaultProviderAllowed,
        string $serviceName,
        ContainerInterface $container
    ) {
        $this->identifier = $identifier;
        $this->title = $title;
        $this->description = $description;
        $this->iconIdentifier = $iconIdentifier;
        $this->isDefaultProviderAllowed = $isDefaultProviderAllowed;
        $this->serviceName = $servieName;
        $this->container = $container;
    }

    public function getIdentifier(): string
    {
        return $this->identifier;
    }

    public function getTitle(): string
    {
        return $this->title;
    }

    public function getDescription(): string
    {
        return $this->description;
    }

    public function getIconIdentifier(): string
    {
        return $this->iconIdentifier;
    }

    public function isDefaultProviderAllowed(): bool
    {
        return $this->isDefaultProviderAllowed();
    }

    public function getInstance(): MfaProviderInterface
    {
        return $this->container->get($this->serviceName);
    }

    public function isActive(MfaProviderPropertyManager $propertyManager): bool
    {
        return (bool)$propertyManager->getProperty('active');
    }
}
