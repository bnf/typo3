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

namespace TYPO3\CMS\Core\Security\ContentSecurityPolicy;

enum PolicyDirective: string
{
    case DefaultSrc = 'default-src';
    case BaseUri = 'base-uri';
    case ChildSrc = 'child-src';
    case ConnectSrc = 'connect-src';
    case FontSrc = 'font-src';
    case FormAction = 'form-action';
    case FrameAncestors = 'frame-ancestors';
    case FrameSrc = 'frame-src';
    case ImgSrc = 'img-src';
    case ManifestSrc = 'manifest-src';
    case MediaSrc = 'media-src';
    case ObjectSrc = 'object-src';
    // @deprecated (see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/report-uri)
    case ReportUri = 'report-uri';
    case Sandbox = 'sandbox';
    case ScriptSrc = 'script-src';
    case ScriptScrAttr = 'script-src-attr';
    case ScriptScrElem = 'script-src-elem';
    case StrictDynamic = 'strict-dynamic';
    case StyleSrc = 'style-src';
    case StyleSrcAttr = 'style-src-attr';
    case StyleSrcElem = 'style-src-elem';
    case UnsafeHashes = 'unsafe-hashes';
    case UpgradeInsecureRequests = 'upgrade-insecure-requests';
    case WorkerSrc = 'worker-src';

    /**
     * @return list<self>
     */
    public function getAncestors(): array
    {
        $ancestors = self::ancestors()[$this] ?? [];
        if ($this !== self::DefaultSrc) {
            $ancestors[] = self::DefaultSrc;
        }
        return $ancestors;
    }

    /**
     * @return \WeakMap<self, list<self>>
     */
    protected static function ancestors(): \WeakMap
    {
        // @todo superfluous type declaration for PhpStan
        /** @var \WeakMap<self, list<self>> $map */
        $map = new \WeakMap();
        $map[self::ScriptScrAttr] = [self::ScriptSrc];
        $map[self::ScriptScrElem] = [self::ScriptSrc];
        $map[self::StyleSrcAttr] = [self::StyleSrc];
        $map[self::StyleSrcElem] = [self::StyleSrc];
        $map[self::FrameSrc] = [self::ChildSrc];
        $map[self::WorkerSrc] = [self::ChildSrc, self::ScriptSrc];
        return $map;
    }
}
