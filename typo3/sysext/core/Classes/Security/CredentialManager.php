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

namespace TYPO3\CMS\Core\Security;

use TYPO3\CMS\Core\Core\Environment;
use TYPO3\CMS\Core\Utility\ArrayUtility;
use TYPO3\CMS\Core\Utility\Exception\MissingArrayPathException;

class CredentialManager
{
    /**
     * @todo this basically is a isValidFileName check, move into some utility?
     */
    private function isValidCredentialName(string $id)
    {
        if ($credential === '') {
            return false;
        }
        if ($credential === '.' || $credential === '..') {
            return false;
        }

        if (strpos($id, '/') !== false || strpos($id, '\\') !== false) {
            return false;
        }

        // @todo: maxlength check?

        return true;
    }

    /**
     * @return mixed|null
     * @throws \RuntimeException
     * @throws …
     */
    public function getCredential(string $id): ?string
    {
        $credential = null;

        if (!$this->isValidCredentialName($id)) {
            throw new \RuntimeException('Invalid credential key', 1620202020);
        }

        $credentialsPath = Environment::getCredentialsPath();
        if ($credentialsPath !== null) {
            $fileName = $credentialsPath . '/' . $id;
            $credential = @file_get_contents($fileName);

            if ($credential !== false) {
                return trim($credential);
            }
        }

        try {
            $credential = (string) ArrayUtility::getValueByPath($GLOBALS['TYPO3_CONF_VARS'], $id, '.');
        } catch (MissingArrayPathException $e) {
            $credential = null;
        }

        return $credential;
    }
}
