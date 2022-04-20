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

namespace TYPO3\CMS\Core\Routing;

use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\UriInterface;
use TYPO3\CMS\Core\Http\NormalizedParams;
use TYPO3\CMS\Core\Http\Uri;

/**
 * This class helps to resolve the virtual path to the main entry point of the TYPO3 Backend.
 */
class BackendEntryPointResolver
{
    protected string $path = 'typo3/';

    protected function getPathConfiguration(): string
    {
        return $GLOBALS['TYPO3_CONF_VARS']['BE']['backendUrl'] ?? $this->path;
    }

    /**
     * Returns a prefix such as /typo3/ or /mysubdir/typo3/ to the TYPO3 Backend.
     */
    public function getPathFromRequest(ServerRequestInterface $request): string
    {
        $path = $this->getPathConfiguration();
        if ($request->getAttribute('normalizedParams') instanceof NormalizedParams) {
            $normalizedParams = $request->getAttribute('normalizedParams');
        } else {
            $normalizedParams = NormalizedParams::createFromRequest($request);
        }
        return $normalizedParams->getSitePath() . $path;
    }

    /**
     * Returns a full URL to the main URL of the TYPO3 Backend.
     */
    public function getUriFromRequest(ServerRequestInterface $request, string $additionalPathPart = ''): UriInterface
    {
        $path = $this->getPathConfiguration();
        if ($request->getAttribute('normalizedParams') instanceof NormalizedParams) {
            $normalizedParams = $request->getAttribute('normalizedParams');
        } else {
            $normalizedParams = NormalizedParams::createFromRequest($request);
        }
        return new Uri($normalizedParams->getSiteUrl() . $path . ltrim($additionalPathPart, '/'));
    }
}
