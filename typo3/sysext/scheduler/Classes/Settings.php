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

namespace TYPO3\CMS\Scheduler;

use TYPO3\CMS\Core\Attribute\AsSetting;
use TYPO3\CMS\Core\Attribute\AsSettings;
use TYPO3\CMS\Core\Settings\SettingsInterface;
use TYPO3\CMS\Core\Settings\TypedSettingsTrait;

#[AsSettings(type: 'extension', prefix: 'scheduler')]
final readonly class Settings implements SettingsInterface
{
    use TypedSettingsTrait;

    public function __construct(
        #[AsSetting(
            label: 'LLL:EXT:scheduler/Resources/Private/Language/locallang_em.xlf:scheduler.config.maxLifetime'
        )]
        public int $maxLifetime = 1440,
    ) {}
}
