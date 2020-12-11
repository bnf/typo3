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

namespace TYPO3\CMS\Core\Hooks;

use Psr\Http\Message\ServerRequestInterface;
use TYPO3\CMS\Core\Http\ApplicationType;
use TYPO3\CMS\Core\Page\PageRenderer;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Core\Utility\PathUtility;

/**
 * PageRenderer hook to add require js configuration for backend calls
 *
 * @internal This is a specific hook implementation and is not considered part of the Public TYPO3 API.
 */
final class PageRendererRenderPreProcess
{
    public function addRequireJsConfiguration(array $params, PageRenderer $pageRenderer): void
    {
        if (($GLOBALS['TYPO3_REQUEST'] ?? null) instanceof ServerRequestInterface
            && ApplicationType::fromRequest($GLOBALS['TYPO3_REQUEST'])->isBackend()
        ) {
            /* This configuration is currently required to avoid third party extensions from overwriting
             * the public lit-html and lit-element packages configuration */
            $pageRenderer->addRequireJsConfiguration([
                'packages' => [
                    [
                        'name' => 'lit-html',
                        'location' => PathUtility::getAbsoluteWebPath(
                            GeneralUtility::getFileAbsFileName('EXT:core/Resources/Public/JavaScript/Contrib/lit-html')
                        ),
                        'main' => 'lit-html',
                    ],
                    [
                        'name' => 'lit-element',
                        'location' => PathUtility::getAbsoluteWebPath(
                            GeneralUtility::getFileAbsFileName('EXT:core/Resources/Public/JavaScript/Contrib/lit-element')
                        ),
                        'main' => 'lit-element',
                    ]
                ]
            ]);
        }
    }
}
