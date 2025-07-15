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
use TYPO3\CMS\Core\Settings\SettingsTypeOption;
use TYPO3\CMS\Core\Settings\SettingsTypeOptionAwareInterface;

#[AsTaggedItem(index: 'complex')]
readonly class ComplexType implements SettingsTypeInterface, SettingsTypeOptionAwareInterface
{
    public function __construct(
        protected LoggerInterface $logger,
    ) {}

    public function validate(mixed $value, SettingDefinition $definition): bool
    {
        if ($value === null || $value === '') {
            return true;
        }
        if (is_string($value) && json_validate($value)) {
            $value = json_decode($value, false, 512, JSON_THROW_ON_ERROR);
        }
        if (!is_array($value) && !is_object($value)) {
            return false;
        }

        // @todo validate against schema from $definition->options['schema']

        return true;
    }

    public function transformValue(mixed $value, SettingDefinition $definition): object
    {
        if (!$this->validate($value, $definition)) {
            $this->logger->warning('Invalid URL, reverting to default: {key}', ['key' => $definition->key]);
            return (string)$definition->default;
        }
        if (is_string($value)) {
            $value = json_decode($value, false, 512, JSON_THROW_ON_ERROR);
        }
        return (object)$value;
    }

    public function getSupportedOptions(): array
    {
        return [
            'schema' => new SettingsTypeOption(
                type: 'string',
                description: 'JSON schema',
                required: true,
            ),
        ];
    }

    public function validateOptions(SettingDefinition $definition): bool
    {
        // @todo validate if json-schema is a valid json schema

        return true;
    }

    public function getJavaScriptModule(): string
    {
        return '@typo3/backend/settings/type/complex.js';
    }
}
