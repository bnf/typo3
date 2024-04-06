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

namespace TYPO3\CMS\Core\Settings\Type;

use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\Attribute\AsTaggedItem;
use TYPO3\CMS\Core\Settings\SettingDefinition;
use TYPO3\CMS\Core\Settings\SettingsTypeInterface;

#[AsTaggedItem(index: 'mixed')]
readonly class MixedType implements SettingsTypeInterface
{
    public function __construct(
        protected LoggerInterface $logger,
    ) {}

    public function validate(mixed $value, SettingDefinition $definition): bool
    {
        return true;
    }

    public function transformValue(mixed $value, SettingDefinition $definition): mixed
    {
        if (is_string($value) && json_validate($value)) {
            $value = json_decode($value, false, 512, JSON_THROW_ON_ERROR);
        }

        return $value;
    }

    public function getJavaScriptModule(): string
    {
        return '@typo3/backend/settings/type/mixed.js';
    }
}
