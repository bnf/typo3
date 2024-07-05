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
class Category
{
    public function __construct(
        public string $key,
        public string $label,
        public ?string $description = null,
        public ?string $icon = null,
        public array $settings = [],
        public array $categories = [],
    ) {}

    public function toArray(): array
    {
        return array_filter(get_object_vars($this), fn(mixed $value) => $value !== null && $value !== []);
    }

    public static function __set_state(array $state): self
    {
        return new self(...$state);
    }

    public function withSettings(array $settings): self
    {
        $obj = clone $this;
        $obj->settings = $settings;
        return $obj;
    }

    public function withCategories(array $categories): self
    {
        $obj = clone $this;
        $obj->categories = $categories;
        return $obj;
    }
}
