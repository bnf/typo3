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

namespace TYPO3\CMS\FluidStyledContent\DataProcessor;

use TYPO3\CMS\Frontend\ContentObject\ContentObjectRenderer;
use TYPO3\CMS\Frontend\ContentObject\DataProcessorInterface;

/**
 * This DataProcessor simply adds a flag to the fluid styled content elements,
 * which indicates whether to include optional stylesheets.
 *
 * @internal
 */
class StylesheetIncludedDataProcessor implements DataProcessorInterface
{
    public function process(ContentObjectRenderer $cObj, array $contentObjectConfiguration, array $processorConfiguration, array $processedData)
    {
        $processedData['includeStyles'] = false;
        $pluginConfig = $cObj->getTypoScriptFrontendController()->tmpl->setup['plugin.']['tx_frontend.'] ?? [];
        $controllerConfig = $cObj->getTypoScriptFrontendController()->config;
        if (
            (($pluginConfig['_CSS_DEFAULT_STYLE'] ?? false) || ($pluginConfig['_CSS_DEFAULT_STYLE.'] ?? false))
            && empty($controllerConfig['config']['removeDefaultCss'])
        ) {
            $processedData['includeStyles'] = true;
        }

        return $processedData;
    }
}
