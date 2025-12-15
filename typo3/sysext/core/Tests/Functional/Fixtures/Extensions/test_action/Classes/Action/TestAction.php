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
use TYPO3\CMS\Core\Action\ActionType;
use TYPO3\CMS\Core\Action\Error\NotFoundError;
use TYPO3\CMS\Core\Action\Link;
use TYPO3\CMS\Core\Action\ParameterSource;
use TYPO3\CMS\Core\Action\Target;
use TYPO3\CMS\Core\Attribute\ActionParameter;
use TYPO3\CMS\Core\Attribute\AsAction;
use TYPO3\CMS\Lowlevel\Localization\Dto\DomainSearchResult;

final readonly class TestAction
{
    #[AsAction(
        route: 'test/simple/return',
    )]
    public function simpleReturn(): string
    {
        return 'simple';
    }

    /**
     * @return list<string>
     */
    #[AsAction(
        route: 'test/string/parameter',
    )]
    public function stringParameter(string $foo): array
    {
        return [$foo];
    }

    /**
     * @return list<string>
     */
    #[AsAction(
        route: 'test/query-parameter',
        type: ActionType::create,
    )]
    public function queryParameter(string $foo, #[ActionParameter(source: ParameterSource::query)] string $bar = ''): array
    {
        return [$foo, $bar];
    }

    /**
     * @return array{item: array{id: int, name: string}}
     */
    #[AsAction(
        route: 'test/items/{collection}',
        type: ActionType::create,
        location: new Link([self::class, 'fetchItem'], [
            'collection' => '$request.path.collection',
            'id' => '$response.body#/item/id',
        ]),
    )]
    public function createItem(string $collection, string $name): array
    {
        return ['item' => ['id' => 42, 'name' => $name]];
    }

    /**
     * @return array{collection: string, id: int}
     */
    #[AsAction(
        route: 'test/items/{collection}/{id}',
    )]
    public function fetchItem(string $collection, int $id): array
    {
        return ['collection' => $collection, 'id' => $id];
    }

    /**
     * @return list<string>
     */
    #[AsAction(
        route: 'test/argument/{foo}',
    )]
    public function argumentParameter(string $foo): array
    {
        return [$foo];
    }

    /**
     * @param list<string> $stringlist
     * @param list<int> $intlist
     * @param list $mixedlist
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
        route: 'test/complex',
    )]
    public function complex(
        string $string = '',
        int $int = 0,
        float $float = 0,
        array $stringlist = [],
        array $intlist = [],
        array $mixedlist = [],
        array $stringmap = [],
        string|int $stringOrInt = 0,
        bool $bool = false,
        bool $false = false,
        bool $true = true,
        array $arrayWithAdditional = ['foo' => 'bar'],
        // @todo avoid misusing this class from EXT:lowlevel in this test
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
        route: 'test/versioned',
        description: 'Superseded by version 2',
        deprecated: 1793608038,
    )]
    public function versionedV1(): string
    {
        return 'v1';
    }

    #[AsAction(
        route: 'test/versioned',
        version: 2,
    )]
    public function versionedV2(): string
    {
        return 'v2';
    }

    #[AsAction(
        route: 'test/backend-only',
        targets: [Target::backend],
    )]
    public function backendOnly(): string
    {
        return 'backend';
    }

    #[AsAction(
        route: 'test/explicit-id',
        id: 'fetch_explicitly_identified',
    )]
    public function explicitId(): string
    {
        return 'explicit';
    }

    #[AsAction(
        route: 'test/http-only',
        targets: [Target::http],
    )]
    public function httpOnly(): string
    {
        return 'http';
    }

    #[AsAction(
        route: 'test/empty-response',
    )]
    public function testEmptyResponse(
        ActionContext $context,
    ): void {}

    /**
     * @return array{count: int}
     */
    #[AsAction(
        route: 'test/invalid-result',
    )]
    public function invalidResult(mixed $count = 'not an integer'): array
    {
        return ['count' => $count];
    }

    /**
     * @throws NotFoundError if the record does not exist
     */
    #[AsAction(
        route: 'test/not-found',
    )]
    public function notFound(): string
    {
        throw new NotFoundError('Record not found', 1791981204);
    }
}
