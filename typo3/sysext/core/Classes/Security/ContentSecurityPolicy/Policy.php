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

use TYPO3\CMS\Core\Http\Uri;
use TYPO3\CMS\Core\Security\Nonce;

class Policy implements \Stringable
{
    /**
     * @var \WeakMap<PolicyDirective, array<int|string, SourceKeyword|SourceScheme|Nonce|Uri>>
     * @todo `array<int|string, T_UNION>` should be `list<T_UNION>`, but PhpStan fails to recognize it
     */
    protected \WeakMap $directives;

    public function __construct(SourceKeyword|SourceScheme|Nonce|Uri ...$sources)
    {
        $this->directives = new \WeakMap();
        $this->directives[PolicyDirective::DefaultSrc] = $sources;
    }

    public function __toString(): string
    {
        return $this->serialize();
    }

    public function default(SourceKeyword|SourceScheme|Nonce|Uri ...$sources): self
    {
        return $this->declare(PolicyDirective::DefaultSrc, ...$sources);
    }

    public function extend(PolicyDirective $directive, SourceKeyword|SourceScheme|Nonce|Uri ...$sources): self
    {
        if ($sources === []) {
            return $this;
        }
        foreach ($directive->getAncestors() as $ancestorDirective) {
            if (isset($this->directives[$ancestorDirective])) {
                $ancestorSources = $this->directives[$ancestorDirective];
                break;
            }
        }
        $currentSources = $this->directives[$directive] ?? [];
        return $this->declare($directive, ...array_merge($ancestorSources ?? [], $currentSources, $sources));
    }

    public function declare(PolicyDirective $directive, SourceKeyword|SourceScheme|Nonce|Uri ...$sources): self
    {
        if ($sources === []) {
            return $this;
        }
        $target = clone $this;
        $target->directives[$directive] = $sources;
        return $target;
    }

    public function remove(PolicyDirective $directive): self
    {
        if (!isset($this->directives[$directive])) {
            return $this;
        }
        $target = clone $this;
        unset($target->directives[$directive]);
        return $target;
    }

    public function report(Uri $reportUri): self
    {
        $target = $this->declare(PolicyDirective::ReportUri, $reportUri);
        $reportSample = SourceKeyword::reportSample;
        foreach ($target->directives as $directive => $sources) {
            if ($reportSample->isApplicable($directive) && !in_array($reportSample, $sources, true)) {
                $target->directives[$directive][] = $reportSample;
            }
        }
        return $target;
    }

    public function purge(): self
    {
        $purged = false;
        $directives = clone $this->directives;
        $comparator = [$this, 'compareSources'];
        foreach ($directives as $directive => $sources) {
            foreach ($directive->getAncestors() as $ancestorDirective) {
                $ancestorSources = $directives[$ancestorDirective] ?? [];
                if (array_udiff($sources, $ancestorSources, $comparator) === []
                    && array_udiff($ancestorSources, $sources, $comparator) === []
                ) {
                    $purged = true;
                    unset($directives[$directive]);
                    continue 2;
                }
            }
        }
        if (!$purged) {
            return $this;
        }
        $target = clone $this;
        $target->directives = $directives;
        return $target;
    }

    public function serialize(): string
    {
        $policyParts = [];
        $subject = $this->purge();
        foreach ($subject->directives as $directive => $sources) {
            $directiveParts = $subject->serializeSources(...$sources);
            if ($directiveParts !== []) {
                array_unshift($directiveParts, $directive->value);
                $policyParts[] = implode(' ', $directiveParts);
            }
        }
        return implode('; ', $policyParts);
    }

    protected function compareSources(SourceKeyword|SourceScheme|Nonce|Uri $a, SourceKeyword|SourceScheme|Nonce|Uri $b): int
    {
        return $this->serializeSource($a) <=> $this->serializeSource($b);
    }

    protected function serializeSources(SourceKeyword|SourceScheme|Nonce|Uri ...$sources): array
    {
        $serialized = [];
        foreach ($sources as $source) {
            if ($source instanceof SourceKeyword && $source->vetoes()) {
                $serialized = [];
            }
            $serialized[] = $this->serializeSource($source);
        }
        return $serialized;
    }

    protected function serializeSource(SourceKeyword|SourceScheme|Nonce|Uri $source): string
    {
        if ($source instanceof SourceKeyword) {
            return "'" . $source->value . "'";
        }
        if ($source instanceof SourceScheme) {
            return $source->value . ':';
        }
        if ($source instanceof Nonce) {
            return "'nonce-" . $source->b64 . "'";
        }
        return (string)$source;
    }
}
