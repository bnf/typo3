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

namespace TYPO3\CMS\Core\Tests\Functional\Settings;

use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\Attributes\Test;
use TYPO3\CMS\Core\Settings\SettingDefinition;
use TYPO3\CMS\Core\Settings\Settings;
use TYPO3\CMS\Core\Settings\SettingsComposer;
use TYPO3\CMS\Core\Settings\SettingsInterface;
use TYPO3\TestingFramework\Core\Functional\FunctionalTestCase;

final class SettingsComposerTest extends FunctionalTestCase
{
    public static function getComputeSettingsDiffDataProvider(): \Generator
    {
        $defaults = [
            'definitions' => [
                'name.space.key1' => new SettingDefinition(
                    key: 'name.space.key1',
                    type: 'string',
                    default: 'key1defaultValue',
                    label: 'Key 1',
                ),
                'name.space.key2' => new SettingDefinition(
                    key: 'name.space.key2',
                    type: 'string',
                    default: 'key2defaultValue',
                    label: 'Key 2',
                ),
                'other.space.key3' => new SettingDefinition(
                    key: 'other.space.key3',
                    type: 'bool',
                    default: true,
                    label: 'Key 3',
                ),
                'readonly.setting' => new SettingDefinition(
                    key: 'readonly.setting',
                    type: 'int',
                    default: 0,
                    readonly: true,
                    label: 'Readonly Setting',
                ),
            ],
            'systemDefaultSettings' => new Settings([
                'name.space.key1' => 'key1defaultValue',
                'name.space.key2' => 'key2defaultValueOverwriteBySystem',
                'other.space.key3' => true,
            ]),
            'localSettingsTree' => [
                'other' => [
                    'space' => [
                        'key3' => false,
                    ],
                ],
            ],
        ];

        yield 'Set value to existing values' => [
            ...$defaults,
            'incomingSettings' => [
                'name.space.key1' => 'key1defaultValue',
                'name.space.key2' => 'key2defaultValueOverwriteBySystem',
                'other.space.key3' => false,
            ],
            'result' => $defaults['localSettingsTree'],
        ];

        yield 'Remove values set to system default, omit equal values' => [
            ...$defaults,
            'incomingSettings' => [
                'name.space.key1' => 'foobar',
                'name.space.key2' => 'key2defaultValueOverwriteBySystem',
                'other.space.key3' => true,
            ],
            'result' => [
                'name' => [
                    'space' => [
                        'key1' => 'foobar',
                    ],
                ],
            ],
        ];

        yield 'Set value that equals definition default, but is overwritten in system defaults' => [
            ...$defaults,
            'incomingSettings' => [
                'name.space.key2' => 'key2defaultValue',
            ],
            'result' => [
                'name' => [
                    'space' => [
                        'key2' => 'key2defaultValue',
                    ],
                ],
                'other' => [
                    'space' => [
                        'key3' => false,
                    ],
                ],
            ],
        ];

        yield 'Set bool value as string to false' => [
            ...$defaults,
            'incomingSettings' => [
                'other.space.key3' => '0',
            ],
            'result' => [
                'other' => [
                    'space' => [
                        'key3' => false,
                    ],
                ],
            ],
        ];

        yield 'Set bool value as string to true' => [
            ...$defaults,
            'incomingSettings' => [
                'other.space.key3' => '1',
            ],
            // value removed from result, as name.space.key3 defaults to true
            'result' => [],
        ];

        yield 'Readonly value is not updated' => [
            ...$defaults,
            'localSettingsTree' => [],
            'incomingSettings' => [
                'readonly.setting' => '2',
            ],
            // value omitted, as setting is defined to be readonly
            'result' => [],
        ];
    }

    #[DataProvider('getComputeSettingsDiffDataProvider')]
    #[Test]
    public function computeSettingsDiff(
        array $definitions,
        SettingsInterface $systemDefaultSettings,
        array $localSettingsTree,
        array $incomingSettings,
        array $result
    ): void {
        $settingsComposer = $this->get(SettingsComposer::class);
        $changes = $settingsComposer->computeSettingsDiff(
            $definitions,
            $systemDefaultSettings,
            $localSettingsTree,
            $incomingSettings,
        );
        self::assertEquals($changes['settings'], $result);
    }
}
