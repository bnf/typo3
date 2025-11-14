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

namespace TYPO3\CMS\Hub;

use League\OAuth2\Server\CryptKeyInterface;

final readonly class CryptKey implements CryptKeyInterface
{
    public function getKeyPath(): string
    {
        throw new \RuntimeException('Not implemented', 1772305766);
    }

    public function getPassPhrase(): ?string
    {
        throw new \RuntimeException('Not implemented', 1772305767);
    }

    public function getKeyContents(): string
    {
        throw new \RuntimeException('Not implemented', 1772305768);
    }
}
