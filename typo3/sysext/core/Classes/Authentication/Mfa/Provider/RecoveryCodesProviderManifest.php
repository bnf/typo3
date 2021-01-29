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

declare(strict_types=1);

namespace TYPO3\CMS\Core\Authentication\Mfa\Provider;

use TYPO3\CMS\Core\Authentication\Mfa\MfaProviderManifestInterface;

/**
 * MFA provider manifest for recovery codes authentication
 *
 * @internal should only be used by the TYPO3 Core
 */
class RecoveryCodesProviderManifest implements MfaProviderManifestInterface
{
    public function getTitle(): string
    {
        return 'Recovery codes';
    }

    public function getDescription(): string
    {
        return 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.';
    }

    public function getIconIdentifier(): string
    {
        return 'content-text-columns';
    }

    public function isDefaultProviderAllowed(): bool
    {
        return false;
    }
}
