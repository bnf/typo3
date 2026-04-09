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

use League\OAuth2\Server\Entities\ClientEntityInterface;
use League\OAuth2\Server\Entities\Traits\ClientTrait;
use League\OAuth2\Server\Entities\Traits\EntityTrait;
use TYPO3\CMS\Core\Resource\FileInterface;

final class Client implements ClientEntityInterface
{
    use ClientTrait;
    use EntityTrait;

    /**
     * @var bool
     */
    private $allowPlainTextPkce = false;

    private ?FileInterface $logo = null;

    private ?string $secret = null;

    private ?int $impersonateUser = null;

    private string $type = 'oauth';

    /**
     * @var list<string>
     */
    private array $scopes = [];

    public function setName(string $name): void
    {
        $this->name = $name;
    }

    /**
     * @param string $redirectUri
     */
    public function setRedirectUri(string $redirectUri): void
    {
        $this->redirectUri = $redirectUri;
    }

    public function setConfidential(bool $isConfidential): void
    {
        $this->isConfidential = $isConfidential;
    }

    public function isPlainTextPkceAllowed(): bool
    {
        return $this->allowPlainTextPkce;
    }

    public function setAllowPlainTextPkce(bool $allowPlainTextPkce): void
    {
        $this->allowPlainTextPkce = $allowPlainTextPkce;
    }

    public function getLogo(): ?FileInterface
    {
        return $this->logo;
    }

    public function setLogo(FileInterface $logo): void
    {
        $this->logo = $logo;
    }

    public function getSecret(): string
    {
        return $this->secret;
    }

    public function setSecret(string $secret): void
    {
        $this->secret = $secret;
    }

    /**
     * @return list<string>
     */
    public function getScopes(): array
    {
        return $this->scopes;
    }

    /**
     * @param list<string> $scopes
     */
    public function setScopes(array $scopes): void
    {
        $this->scopes = $scopes;
    }

    public function getImpersonateUser(): ?int
    {
        return $this->impersonateUser;
    }

    public function setImpersonateUser(?int $impersonateUser): void
    {
        $this->impersonateUser = $impersonateUser;
    }

    public function getType(): string
    {
        return $this->type;
    }

    public function setType(string $type): void
    {
        $this->type = $type;
    }

    public function supportsGrantType(string $grantType): bool
    {
        return $this->type === 'oauth';
    }
}
