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
class SettingDefinition
{
    public function __construct(
        public readonly string $key,
        public readonly string|int|bool|array|null $default,
        // @todo LLL? do implicit stuff?
        public readonly string $label,
        public readonly string $type,
        public readonly ?array $enum = [],
        public readonly ?array $validators = [],
        // @todo LLL? do implicit stuff?
        public readonly ?string $description = null,
    ) {}

    public function toArray(): array
    {
        return array_filter(get_object_vars($this), fn(mixed $value) => $value !== null && $value !== []);
    }

    public static function __set_state(array $state): self
    {
        return new self(...$state);
    }
}
