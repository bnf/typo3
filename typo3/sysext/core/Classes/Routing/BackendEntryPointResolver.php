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
    protected string $entryPoint = 'typo3';

    /**
     * Returns a prefix such as /typo3/ or /mysubdir/typo3/ to the TYPO3 Backend with trailing slash.
     */
    public function getPathFromRequest(ServerRequestInterface $request): string
    {
        return $this->getEntryPoint($request) . '/';
    }

    /**
     * Returns a full URL to the main URL of the TYPO3 Backend.
     */
    public function getUriFromRequest(ServerRequestInterface $request, string $additionalPathPart = ''): UriInterface
    {
        $entryPoint = $this->getEntryPointConfiguration();
        if ($request->getAttribute('normalizedParams') instanceof NormalizedParams) {
            $normalizedParams = $request->getAttribute('normalizedParams');
        } else {
            $normalizedParams = NormalizedParams::createFromRequest($request);
        }
        return new Uri($normalizedParams->getSiteUrl() . $entryPoint . '/' . ltrim($additionalPathPart, '/'));
    }

    /**
     * @todo write tests configs like ['BE']['entryPoint']:
     * //example.com
     * //example.com/
     * //example.com/foo
     * //example.com/foo/
     * @todo merge logic with getBackendRoutePath()
     */
    public function isBackendRoute(ServerRequestInterface $request): bool
    {
        $uri = $request->getUri();
        $path = $uri->getPath();
        $entryPoint = $this->getEntryPoint($request);

        if (str_contains($entryPoint, '//')) {
            $entryPointParts = parse_url($entryPoint);
            if ($uri->getHost() !== $entryPointParts['host']) {
                return false;
            }
            /* Remove trailing slash unless, the string is '/' itself, @todo: this code looks awful */
            $entryPoint = rtrim('/' . trim($entryPointParts['path'] ?? '', '/'), '/');
        }

        return $path === $entryPoint || str_starts_with($path, $entryPoint . '/');
    }

    /**
     * @todo drop and rather use absolute, always? (getUriFromRequest)
     *       …in order to avoid possible invalid relative links, but reverse proxies may not like that
     */
    public function getBackendRoutePath(ServerRequestInterface $request): ?string
    {
        $uri = $request->getUri();
        $path = $uri->getPath();
        $entryPoint = $this->getEntryPoint($request);

        if (str_contains($entryPoint, '//')) {
            $entryPointParts = parse_url($entryPoint);
            if ($uri->getHost() !== $entryPointParts['host']) {
                return null;
            }
            /* Remove trailing slash unless, the string is '/' itself, @todo: this code looks awful */
            $entryPoint = rtrim('/' . trim($entryPointParts['path'] ?? '', '/'), '/');
        }

        if ($path === $entryPoint) {
            return '';
        }
        if (str_starts_with($path, $entryPoint . '/')) {
            return substr($path, strlen($entryPoint));
        }
        return null;
    }

    /**
     * Returns a prefix such as /typo3 or /mysubdir/typo3 to the TYPO3 Backend *without* trailing slash.
     */
    protected function getEntryPoint(ServerRequestInterface $request): string
    {
        $entryPoint = $this->getEntryPointConfiguration();
        if (str_contains($entryPoint, '//')) {
            return $entryPoint;
        }
        if ($request->getAttribute('normalizedParams') instanceof NormalizedParams) {
            $normalizedParams = $request->getAttribute('normalizedParams');
        } else {
            $normalizedParams = NormalizedParams::createFromRequest($request);
        }
        return $normalizedParams->getSitePath() . $entryPoint;
    }

    protected function getEntryPointConfiguration(): string
    {
        $entryPoint = $GLOBALS['TYPO3_CONF_VARS']['BE']['entryPoint'] ?? $this->entryPoint;
        if (str_contains($entryPoint, '//')) {
            return rtrim($entryPoint, '/');
        }
        return trim($entryPoint, '/');
    }
}
