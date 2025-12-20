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

namespace TYPO3\CMS\Hub\ConfigurationModuleProvider;

use TYPO3\CMS\Lowlevel\ConfigurationModuleProvider\AbstractProvider;
use TYPO3\CMS\Hub\AppRegistry;

class AppsProvider extends AbstractProvider
{
    public function __construct(
        private readonly AppRegistry $appRegistry
    ) {}

    public function getConfiguration(): array
    {
        $configuration = [];
        $languageService = $this->getLanguageService();
        foreach ($this->appRegistry->getAvailableAppTypes() as $type => $app) {
            $description = $languageService->sL($app::getDescription());
            if ($description !== $app::getDescription()) {
                $description .= ' [' . $app::getDescription() . ']';
            }
            $configuration[$type] = [
                'description' => $description,
                'iconIdentifier' => $app::getIconIdentifier(),
            ];
        }
        return $configuration;
    }
}
