<?php

declare(strict_types=1);

namespace TYPO3\CMS\Frontend\ContentObject;

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
use TYPO3\CMS\Core\Page\PageRenderer;

interface ContentObjectInterface
{
    /**
     * Renders the content object.
     *
     * @param array Array of TypoScript properties
     * @param ContentObjectRenderer $contentObjectRenderer
     * @param PageRenderer $pageRenderer
     */
    public function render(
        array $config = [],
        ContentObjectRenderer $contentObjectRenderer,
        PageRenderer $pageRenderer
    ): string;
}
