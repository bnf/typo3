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

namespace TYPO3\CMS\Core\Tests\Unit\JsonSchema;

use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\Attributes\Test;
use Symfony\Component\TypeInfo\Type;
use TYPO3\CMS\Core\JsonSchema\Normalizer;
use TYPO3\CMS\Core\JsonSchema\SchemaBuilder;
use TYPO3\CMS\Core\Tests\Unit\JsonSchema\Fixtures\Schema\CircularObjectFixture;
use TYPO3\TestingFramework\Core\Unit\UnitTestCase;

final class NormalizerTest extends UnitTestCase
{
    public static function normalizeDataProvider(): \Generator
    {
        yield 'empty map becomes object' => [
            'type' => Type::dict(Type::string()),
            'data' => [],
            'expected' => new \stdClass(),
        ];
        yield 'empty list stays array' => [
            'type' => Type::list(Type::string()),
            'data' => [],
            'expected' => [],
        ];
        yield 'empty nullable map becomes object' => [
            'type' => Type::nullable(Type::dict(Type::string())),
            'data' => [],
            'expected' => new \stdClass(),
        ];
        yield 'empty map in array shape becomes object' => [
            'type' => Type::arrayShape(['map' => Type::dict(Type::int()), 'list' => Type::list(Type::int())]),
            'data' => (object)['map' => [], 'list' => []],
            'expected' => (object)['map' => new \stdClass(), 'list' => []],
        ];
        yield 'empty maps in list become objects' => [
            'type' => Type::list(Type::dict(Type::string())),
            'data' => [[], (object)['foo' => 'bar']],
            'expected' => [new \stdClass(), (object)['foo' => 'bar']],
        ];
        yield 'empty map in additional properties becomes object' => [
            'type' => Type::dict(Type::dict(Type::string())),
            'data' => (object)['foo' => []],
            'expected' => (object)['foo' => new \stdClass()],
        ];
        yield 'scalars are kept' => [
            'type' => Type::string(),
            'data' => 'foo',
            'expected' => 'foo',
        ];
        yield 'mixed is kept' => [
            'type' => Type::mixed(),
            'data' => [],
            'expected' => [],
        ];
    }

    #[DataProvider('normalizeDataProvider')]
    #[Test]
    public function normalize(Type $type, mixed $data, mixed $expected): void
    {
        $schema = new SchemaBuilder()->build($type);

        self::assertEquals($expected, new Normalizer()->normalize($data, $schema));
    }

    #[Test]
    public function normalizesEmptyMapsOfReferencedSchemas(): void
    {
        $schema = new SchemaBuilder()->build(Type::object(CircularObjectFixture::class));
        $data = json_decode(json_encode(new CircularObjectFixture(children: [new CircularObjectFixture(children: [])])));

        self::assertEquals($data, new Normalizer()->normalize($data, $schema));
    }
}
