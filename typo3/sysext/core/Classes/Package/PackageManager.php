<?php

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

namespace TYPO3\CMS\Core\Package;

use Symfony\Component\Finder\Finder;
use Symfony\Component\Finder\SplFileInfo;
use TYPO3\CMS\Core\Cache\Frontend\FrontendInterface;
use TYPO3\CMS\Core\Core\ClassLoadingInformation;
use TYPO3\CMS\Core\Core\Environment;
use TYPO3\CMS\Core\Information\Typo3Version;
use TYPO3\CMS\Core\Package\Event\PackagesMayHaveChangedEvent;
use TYPO3\CMS\Core\Package\Exception\InvalidPackageKeyException;
use TYPO3\CMS\Core\Package\Exception\InvalidPackageManifestException;
use TYPO3\CMS\Core\Package\Exception\InvalidPackagePathException;
use TYPO3\CMS\Core\Package\Exception\InvalidPackageStateException;
use TYPO3\CMS\Core\Package\Exception\MissingPackageManifestException;
use TYPO3\CMS\Core\Package\Exception\PackageManagerCacheUnavailableException;
use TYPO3\CMS\Core\Package\Exception\PackageStatesFileNotWritableException;
use TYPO3\CMS\Core\Package\Exception\PackageStatesUnavailableException;
use TYPO3\CMS\Core\Package\Exception\ProtectedPackageKeyException;
use TYPO3\CMS\Core\Package\Exception\UnknownPackageException;
use TYPO3\CMS\Core\Package\MetaData\PackageConstraint;
use TYPO3\CMS\Core\Service\DependencyOrderingService;
use TYPO3\CMS\Core\Service\OpcodeCacheService;
use TYPO3\CMS\Core\SingletonInterface;
use TYPO3\CMS\Core\Utility\ArrayUtility;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Core\Utility\PathUtility;

/**
 * The default TYPO3 Package Manager
 */
interface PackageManager
{
    /**
     * @internal
     * @return string|null
     */
    public function getCacheIdentifier(): ?string;

    /**
     * Scans all directories in the packages directories for available packages.
     * For each package a Package object is created and stored in $this->packages.
     * @internal
     */
    public function scanAvailablePackages(): void;

    /**
     * Event listener to retrigger scanning of available packages.
     *
     * @param PackagesMayHaveChangedEvent $event
     * @todo remove
     */
    public function packagesMayHaveChanged(PackagesMayHaveChangedEvent $event): void;

    /**
     * Register a native TYPO3 package
     *
     * @param PackageInterface $package The Package to be registered
     * @return PackageInterface
     * @throws Exception\InvalidPackageStateException
     * @internal
     */
    public function registerPackage(PackageInterface $package): void;

    /**
     * Resolves a TYPO3 package key from a composer package name.
     *
     * @param string $composerName
     * @return string
     * @internal
     * @todo remove
     */
    public function getPackageKeyFromComposerName(string $composerName): string;

    /**
     * Returns a PackageInterface object for the specified package.
     * A package is available, if the package directory contains valid MetaData information.
     *
     * @param string $packageKey
     * @return PackageInterface The requested package object
     * @throws Exception\UnknownPackageException if the specified package is not known
     */
    public function getPackage(string $packageKey): PackageInterface;

    /**
     * Returns TRUE if a package is available (the package's files exist in the packages directory)
     * or FALSE if it's not. If a package is available it doesn't mean necessarily that it's active!
     *
     * @param string $packageKey The key of the package to check
     * @return bool TRUE if the package is available, otherwise FALSE
     */
    public function isPackageAvailable(string $packageKey): bool;

    /**
     * Returns TRUE if a package is activated or FALSE if it's not.
     *
     * @param string $packageKey The key of the package to check
     * @return bool TRUE if package is active, otherwise FALSE
     */
    public function isPackageActive(string $packageKey): bool;

    /**
     * Deactivates a package and updates the packagestates configuration
     *
     * @param string $packageKey
     * @throws Exception\PackageStatesFileNotWritableException
     * @throws Exception\ProtectedPackageKeyException
     * @throws Exception\UnknownPackageException
     * @internal
     */
    public function deactivatePackage(string $packageKey): void;

    /**
     * @param string $packageKey
     * @internal
     */
    public function activatePackage(string $packageKey): void

    /**
     * Removes a package from the file system.
     *
     * @param string $packageKey
     * @throws Exception
     * @throws Exception\ProtectedPackageKeyException
     * @throws Exception\UnknownPackageException
     * @internal
     */
    public function deletePackage(string $packageKey): void;

    /**
     * Returns an array of \TYPO3\CMS\Core\Package objects of all active packages.
     * A package is active, if it is available and has been activated in the package
     * manager settings.
     *
     * @return array<string, PackageInterface>
     */
    public function getActivePackages(): array;

    /**
     * Check the conformance of the given package key
     *
     * @param string $packageKey The package key to validate
     * @return bool If the package key is valid, returns TRUE otherwise FALSE
     */
    public function isPackageKeyValid(string $packageKey): bool;

    /**
     * Returns an array of \TYPO3\CMS\Core\Package objects of all available packages.
     * A package is available, if the package directory contains valid meta information.
     *
     * @return PackageInterface[] Array of PackageInterface
     */
    public function getAvailablePackages(): array;

    /**
     * Unregisters a package from the list of available packages
     *
     * @param PackageInterface $package The package to be unregistered
     * @throws Exception\InvalidPackageStateException
     * @internal
     */
    public function unregisterPackage(PackageInterface $package): void;

    /**
     * Reloads a package and its information
     *
     * @param string $packageKey
     * @throws Exception\InvalidPackageStateException if the package isn't available
     * @internal
     */
    public function reloadPackageInformation(string $packageKey): void;
}
