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

namespace TYPO3\CMS\Core\Settings;

/**
 * @internal
 */
final readonly class TestSettings implements SettingsInterface
{
    public function __construct(
        private readonly SettingsInterface $settings,
        private readonly array $overrides,
    ) {}

    public function has(string $identifier): bool
    {
        return array_key_exists($identifier, $this->overrides) || $this->settings->has($identifier);
    }

    public function get(string $identifier): mixed
    {
        if (array_key_exists($identifier, $this->overrides)) {
            return $this->overrides[$identifier];
        }
        return $this->settings->get($identifier);
    }

    public function getIdentifiers(): array
    {
        return [
            ...$this->settings->getIdentifiers(),
            ...array_keys($this->overrides),
        ];
    }

    public static function __set_state(array $state): static
    {
        return new static(...$state);
    }
}
