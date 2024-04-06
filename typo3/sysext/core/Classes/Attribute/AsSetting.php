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

namespace TYPO3\CMS\Core\Attribute;

use TYPO3\CMS\Core\Settings\SettingDefinition;

#[\Attribute(\Attribute::TARGET_PARAMETER)]
class AsSetting
{
    public function __construct(
        public ?string $key = null,
        public ?string $label = null,
        public ?string $type = null,
        public readonly ?array $enum = [],
        public readonly ?array $validators = [],
        public readonly ?string $description = null,
    ) {}

    public function createDefinition(
        string $propertyName,
        string $type,
        string $label,
        string|int|bool|array|null $default,
    ): SettingDefinition {
        return new SettingDefinition(
            key: $this->key ?? $propertyName,
            // upper case and split default label (or auto-link to some key from a locallang file – or both?)
            label: $this->label ?? $label,
            default: $default,
            type: $this->type ?? $type,
            enum: $this->enum,
            validators: $this->validators,
            description: $this->description,
        );
    }
}
