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

namespace TYPO3\CMS\Core\Tests\Unit\Security\ContentSecurityPolicy;

use TYPO3\CMS\Core\Security\ContentSecurityPolicy\Policy;
use TYPO3\CMS\Core\Security\ContentSecurityPolicy\PolicyDirective;
use TYPO3\CMS\Core\Security\ContentSecurityPolicy\SourceKeyword;
use TYPO3\CMS\Core\Security\ContentSecurityPolicy\SourceScheme;
use TYPO3\CMS\Core\Security\Nonce;
use TYPO3\TestingFramework\Core\Unit\UnitTestCase;

class PolicyTest extends UnitTestCase
{
    /**
     * @test
     */
    public function constructorSetsdefaultDirective(): void
    {
        $policy = (new Policy(SourceKeyword::self));
        self::assertSame("default-src 'self'", (string)$policy);
    }

    /**
     * @test
     */
    public function defaultDirectiveIsModified(): void
    {
        $policy = (new Policy(SourceKeyword::self))
            ->default(SourceKeyword::none);
        self::assertSame("default-src 'none'", (string)$policy);
    }

    /**
     * @test
     */
    public function defaultDirectiveConsidersVeto(): void
    {
        $policy = (new Policy(SourceKeyword::self))
            ->default(SourceKeyword::unsafeEval, SourceKeyword::none);
        self::assertSame("default-src 'none'", (string)$policy);
    }

    /**
     * @test
     */
    public function newDirectiveExtendsDefault(): void
    {
        $policy = (new Policy(SourceKeyword::self))
            ->extend(PolicyDirective::ScriptSrc, SourceKeyword::unsafeInline);
        self::assertSame("default-src 'self'; script-src 'self' 'unsafe-inline'", (string)$policy);
    }

    /**
     * @test
     */
    public function newDirectiveDoesNotExtendDefault(): void
    {
        $policy = (new Policy(SourceKeyword::self))
            ->declare(PolicyDirective::ScriptSrc, SourceKeyword::unsafeInline);
        self::assertSame("default-src 'self'; script-src 'unsafe-inline'", (string)$policy);
    }

    /**
     * @test
     */
    public function sourceSchemeIsSerialized(): void
    {
        $policy = (new Policy(SourceKeyword::self, SourceScheme::blob));
        self::assertSame("default-src 'self' blob:", (string)$policy);
    }

    /**
     * @test
     */
    public function directiveIsRemoved(): void
    {
        $policy = (new Policy(SourceKeyword::self))
            ->remove(PolicyDirective::DefaultSrc);
        self::assertSame('', (string)$policy);
    }

    /**
     * @test
     */
    public function superfluousDirectivesArePurged(): void
    {
        $policy = (new Policy(SourceKeyword::self, SourceScheme::data))
            ->declare(PolicyDirective::ScriptSrc, SourceKeyword::self, SourceScheme::data);
        self::assertSame("default-src 'self' data:", (string)$policy);
    }

    /**
     * @test
     */
    public function backendPolicyIsSerialized(): void
    {
        $nonce = Nonce::create();
        $policy = (new Policy())
            ->default(SourceKeyword::self)
            ->extend(PolicyDirective::ScriptSrc, $nonce)
            ->extend(PolicyDirective::StyleSrc, SourceKeyword::unsafeInline)
            ->declare(PolicyDirective::StyleSrcAttr, SourceKeyword::unsafeInline)
            ->extend(PolicyDirective::ImgSrc, SourceScheme::data)
            ->declare(PolicyDirective::WorkerSrc, SourceKeyword::self, SourceScheme::blob)
            ->extend(PolicyDirective::FrameSrc, SourceScheme::blob);
        self::assertSame(
            "default-src 'self'; script-src 'self' 'nonce-{$nonce->b64}'; "
            . "style-src 'self' 'unsafe-inline'; style-src-attr 'unsafe-inline'; "
            . "img-src 'self' data:; worker-src 'self' blob:; frame-src 'self' blob:",
            (string)$policy
        );
    }
}
