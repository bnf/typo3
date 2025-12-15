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

namespace TYPO3Tests\TestAction\Action;

use TYPO3\CMS\Core\Action\ActionContext;
use TYPO3\CMS\Core\Attribute\AsAction;
use TYPO3\CMS\Lowlevel\Localization\Dto\DomainSearchResult;

final readonly class TestAction
{
    #[AsAction(
        name: 'test/simple/return',
    )]
    public function simpleReturn(): string
    {
        return 'simple';
    }

    /**
     * @return list<string>
     */
    #[AsAction(
        name: 'test/string/parameter',
    )]
    public function stringParameter(string $foo): array
    {
        return [$foo];
    }

    /**
     * @return list<string>
     */
    #[AsAction(
        name: 'test/argument/{foo}',
    )]
    public function argumentParameter(string $foo): array
    {
        return [$foo];
    }

    /**
     * @param list<string> $stringlist
     * @param list<int> $intlist
     * @param array<string,string> $stringmap
     * @param false $false
     * @param true $true
     * @param array{foo: string, ...<string, int>} $arrayWithAdditional
     * @return array{
     *   record: list<string>,
     *   foo?: string,
     *   string: string,
     *   int: int,
     *   float: float,
     *   stringlist: list<string>,
     *   intlist: list<int>,
     *   stringmap: array<string, string>,
     *   stringOrInt: string|int,
     * }
     */
    #[AsAction(
        name: 'test/complex',
    )]
    public function complex(
        string $string = '',
        int $int = 0,
        float $float = 0,
        array $stringlist = [],
        array $intlist = [],
        array $stringmap = [],
        string|int $stringOrInt = 0,
        bool $bool = false,
        bool $false = false,
        bool $true = true,
        array $arrayWithAdditional = ['foo' => 'bar'],
        ?DomainSearchResult $dsr = null,
    ): array {
        return [
            'record' => ['foo', 'bar'],
            'string' => $string,
            'int' => $int,
            'float' => $float,
            'stringlist' => $stringlist,
            'intlist' => $intlist,
            'stringmap' => $stringmap,
            'stringOrInt' => $stringOrInt,
        ];
    }

    #[AsAction(
        name: 'test/empty-response',
    )]
    public function testEmptyResponse(
        ActionContext $context,
    ): void {}
}
