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

trait TypedSettingsTrait
{
    public function has(string $identifier): bool
    {
        return property_exists($this, $identifier);
    }

    public function get(string $identifier): mixed
    {
        return $this->{$identifier};
    }

    public function getIdentifiers(): array
    {
        return array_keys(get_object_vars($this));
    }

    public static function __set_state(array $state): self
    {
        $allowedProperties = get_class_vars(static::class);
        $properties = array_filter($state, static fn($key) => array_key_exists($key, $allowedProperties), ARRAY_FILTER_USE_KEY);
        return new self(...$properties);
    }
}
