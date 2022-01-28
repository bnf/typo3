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

use Psr\Http\Message\ServerRequestInterface;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Frontend\ContentObject\Exception\ContentRenderingException;
use TYPO3\CMS\Frontend\DependencyInjection\ContentObjectCompilerPass;

/**
 * Factory to build cObjects (e.g. TEXT)
 * @internal
 */
class LegacyContentObjectFactory
{
    protected array $contentObjects = [];

    /**
     * Used by the compiler pass
     * @see ContentObjectCompilerPass
     */
    public function registerContentObject($contentObject, $name): void
    {
        $this->contentObjects[$name] = $contentObject;
    }

    public function getContentObject(string $name, ServerRequestInterface $request, ContentObjectRenderer $contentObjectRenderer): ?AbstractContentObject
    {
        if (!isset($this->contentObjects[$name])) {
            return null;
        }

        $className = $this->contentObjects[$name];
        return new class($className) implements ContentObjectInterface
        {
            public function __contstruct(private $className)
            {
            }

            public function render(array $config = [], ContentObjectRenderer $cObj, PageRenderer $pageRenderer): string
            {
                $contentObject = GeneralUtility::makeInstance($this->contentObjects[$name], $contentObjectRenderer);
                if (!($contentObject instanceof AbstractContentObject)) {
                    throw new ContentRenderingException(sprintf('Registered content object class name "%s" must be an instance of AbstractContentObject, but is not!', $this->contentObjects[$name]), 1422564295);
                }
                $contentObject->setRequest($cObj->getRequest());

            }
        }

        return $contentObject;
    }
}
