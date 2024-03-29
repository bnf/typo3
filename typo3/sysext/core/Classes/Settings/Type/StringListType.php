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

use Symfony\Component\DependencyInjection\Attribute\AsTaggedItem;
use TYPO3\CMS\Core\Settings\SettingDefinition;
use TYPO3\CMS\Core\Settings\SettingsTypeInterface;

#[AsTaggedItem(index: 'stringlist')]
class StringListType implements SettingsTypeInterface
{
    public function validate(mixed $value, SettingDefinition $definition): bool
    {
        if (!is_array($value)) {
            return false;
        }
        if (!array_is_list($value)) {
            return false;
        }
        foreach ($value as $v) {
            if (!is_string($v)) {
                return false;
            }
        }
        return true;
    }

    public function transformValue(mixed $value, SettingDefinition $definition): mixed
    {
        if (!$this->validate($value, $definition)) {
            // @todo log
            return $definition->default;
        }
        return $value;
    }
}
