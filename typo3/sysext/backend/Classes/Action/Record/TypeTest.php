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

namespace TYPO3\CMS\Backend\Action\Record;

use TYPO3\CMS\Backend\Dto\Tree\TreeItem;
use TYPO3\CMS\Core\Attribute\AsAction;
use TYPO3\CMS\Lowlevel\Localization\Dto\DomainSearchResult;

final readonly class TypeTest
{
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
        name: 'type/test',
        method: 'GET',
    )]
    public function perform(
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
        //?TreeItem $treeItem = null,
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
}
