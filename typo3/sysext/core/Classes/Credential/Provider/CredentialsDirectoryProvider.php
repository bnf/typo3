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

namespace TYPO3\CMS\Core\Credential\Provider;

use TYPO3\CMS\Core\Core\Environment;

class CredentialsDirectoryProvider implements ProviderInterface
{
    private function getCredentialsPath(): ?string
    {
        if (getenv('CREDENTIALS_DIRECTORY')) {
            return getenv('CREDENTIALS_DIRECTORY');
        }

        /* No secure location possible in classic mode */
        if (Environment::getPublicPath() === Environment::getProjectPath()) {
            return null;
        }

        return Environment::getPublicPath() . '/credentials';
    }

    public function getCredential(string $id): ?string
    {
        $credentialsPath = $this->getCredentialsPath();
        if ($credentialsPath === null) {
            return null;
        }

        $fileName = $credentialsPath . '/' . $id;

        $credential = @file_get_contents($fileName);
        if ($credential === false) {
            return null;
        }

        return trim($credential, "\n\r");
    }
}
