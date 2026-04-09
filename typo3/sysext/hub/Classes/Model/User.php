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

namespace TYPO3\CMS\Hub\Model;

use League\OAuth2\Server\Entities\UserEntityInterface;

final class User implements UserEntityInterface
{
    /**
     * @param non-empty-string $identifier
     */
    public function __construct(
        public string $identifier
    ) {}

    /**
     * Getter method to satisfy `UserEntityInterface`
     *
     * @return non-empty-string
     * @internal
     */
    public function getIdentifier(): string
    {
        return $this->identifier;
    }
}
