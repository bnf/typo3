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

namespace TYPO3\CMS\Core\Tests\Unit\Action;

use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\Attributes\Test;
use TYPO3\CMS\Core\Action\LinkResolver;
use TYPO3\TestingFramework\Core\Unit\UnitTestCase;

final class LinkResolverTest extends UnitTestCase
{
    public static function expressionsDataProvider(): \Generator
    {
        yield 'path parameter' => ['$request.path.uid', ['source' => 'route', 'name' => 'uid', 'pointer' => []]];
        yield 'query parameter' => ['$request.query.workspace', ['source' => 'query', 'name' => 'workspace', 'pointer' => []]];
        yield 'body parameter' => ['$request.body#/record/schema', ['source' => 'body', 'name' => 'record', 'pointer' => ['schema']]];
        yield 'result' => ['$response.body#', ['source' => 'result', 'name' => null, 'pointer' => []]];
        yield 'result with escaped pointer' => ['$response.body#/a~1b/c~0d', ['source' => 'result', 'name' => null, 'pointer' => ['a/b', 'c~d']]];
    }

    #[Test]
    #[DataProvider('expressionsDataProvider')]
    public function parseExpression(string $expression, array $expected): void
    {
        self::assertSame($expected, LinkResolver::parseExpression($expression));
    }

    #[Test]
    public function parseExpressionRejectsUnsupportedExpression(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionCode(1793709235);
        LinkResolver::parseExpression('$request.header.Accept');
    }
}
