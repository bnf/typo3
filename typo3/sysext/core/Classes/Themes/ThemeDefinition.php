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

namespace TYPO3\CMS\Core\Themes;

use TYPO3\CMS\Core\Settings\SettingDefinition;

class ThemeDefinition
{
    /**
     * @param SettingDefinition[] $settings
     */
    public function __construct(
        public readonly string $name,
        public readonly string $basePath,
        public readonly array $settings = [],
        public readonly ?string $author = null,
    ) {}

    public function toArray(): array
    {
        return array_filter(get_object_vars($this), fn(mixed $value) => $value !== null && $value !== []);
    }
}
