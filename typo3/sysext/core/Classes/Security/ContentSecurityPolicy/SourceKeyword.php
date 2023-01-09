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

enum SourceKeyword: string
{
    case none = 'none';
    case self = 'self';
    case unsafeInline = 'unsafe-inline';
    case unsafeEval = 'unsafe-eval';
    case wasmUnsafeEval = 'wasm-unsafe-eval';
    case reportSample = 'report-sample';

    public function vetoes(): bool
    {
        return $this === self::none;
    }

    public function isApplicable(PolicyDirective $directive): bool
    {
        $onlyApplicableTo = new \WeakMap();
        $onlyApplicableTo[self::reportSample] = [
            PolicyDirective::ScriptSrc, PolicyDirective::ScriptScrAttr, PolicyDirective::ScriptScrElem,
            PolicyDirective::StyleSrc, PolicyDirective::StyleSrcAttr, PolicyDirective::StyleSrcElem,
        ];
        return !isset($onlyApplicableTo[$this]) || in_array($directive, $onlyApplicableTo[$this], true);
    }
}
