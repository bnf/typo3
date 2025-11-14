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

use League\OAuth2\Server\Entities\AccessTokenEntityInterface;
use League\OAuth2\Server\Entities\Traits\AccessTokenTrait;
use League\OAuth2\Server\Entities\Traits\EntityTrait;
use League\OAuth2\Server\Entities\Traits\TokenEntityTrait;
//use League\OAuth2\Server\Entities\ClientEntityInterface;
//use League\OAuth2\Server\Entities\ScopeEntityInterface;

final class AccessToken implements AccessTokenEntityInterface
{
    use AccessTokenTrait;
    use EntityTrait;
    use TokenEntityTrait;

    public bool $revoked = false;

    /**
     * @param ScopeEntityInterface[] $scopes
     */
    /*
    public function __construct(
        protected ClientEntity $clientEntity,
        protected array $scopes,
        protected ?string $userIdentifier,
    ) {}
    */
}
