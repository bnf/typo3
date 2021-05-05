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

use TYPO3\CMS\Core\Utility\ArrayUtility;
use TYPO3\CMS\Core\Utility\Exception\MissingArrayPathException;

class ConfVarsProvider implements ProviderInterface
{
    public function getCredential(string $id): ?string
    {
        try {
            return (string) ArrayUtility::getValueByPath($GLOBALS['TYPO3_CONF_VARS'], $id, '.');
        } catch (MissingArrayPathException $e) {
            return null;
        }
    }
}
