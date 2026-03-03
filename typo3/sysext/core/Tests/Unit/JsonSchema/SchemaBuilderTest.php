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
use TYPO3\CMS\Core\Http\ApplicationType;
use TYPO3\CMS\Core\JsonSchema\Schema;
use TYPO3\CMS\Core\JsonSchema\SchemaBuilder;
use TYPO3\CMS\Core\Tests\Unit\JsonSchema\Fixtures\Schema\CircularObjectFixture;
use TYPO3\CMS\Core\Tests\Unit\JsonSchema\Fixtures\Schema\GenericObjectFixture;
use TYPO3\CMS\Core\Tests\Unit\JsonSchema\Fixtures\Schema\SimpleObjectFixture;
use TYPO3\CMS\Core\Utility\DiffGranularity;
use TYPO3\CMS\Core\Versioning\VersionState;
use TYPO3\TestingFramework\Core\Unit\UnitTestCase;

final class SchemaBuilderTest extends UnitTestCase
{
    #[DataProvider('types')]
    #[Test]
    public function buildsCorrectSchema(Type $type, object $expected): void
    {
        $schemaMapper = new SchemaBuilder();
        $schema = $schemaMapper->build($type);
        $res = $schema->toPlainObject();
        self::assertEquals($expected, $res);
    }

    #[DataProvider('types')]
    #[Test]
    public function jsonSerializeProducesCorrectSchema(Type $type, object $expected): void
    {
        $schemaMapper = new SchemaBuilder();
        $schema = $schemaMapper->build($type);
        $res = json_decode(json_encode($schema));
        self::assertEquals($expected, $res);
    }

    #[DataProvider('types')]
    #[Test]
    public function encodeDecodeFromPlainReconstructsCorrectSchema(Type $type, object $expected): void
    {
        $schemaMapper = new SchemaBuilder();
        $expected = $schemaMapper->build($type);
        $encoded = json_encode($expected);
        $decodedObject = json_decode($encoded, false);
        $decodedArray = json_decode($encoded, true);

        self::assertEquals($expected, Schema::fromPlainData($decodedObject));
        self::assertEquals($expected, Schema::fromPlainData($decodedArray));
    }

    public static function types(): \Generator
    {
        // int
        yield 'int' => [
            Type::int(),
            (object)['type' => 'integer'],
        ];
        yield 'int nullable' => [
            Type::nullable(Type::int()),
            (object)['type' => ['integer', 'null']],
        ];

        // float
        yield 'float' => [
            Type::float(),
            (object)['type' => 'number'],
        ];
        yield 'float nullable' => [
            Type::nullable(Type::float()),
            (object)['type' => ['number', 'null']],
        ];

        // string
        yield 'string' => [
            Type::string(),
            (object)['type' => 'string'],
        ];
        yield 'string nullable' => [
            Type::nullable(Type::string()),
            (object)['type' => ['string', 'null']],
        ];

        // bool
        yield 'bool' => [
            Type::bool(),
            (object)['type' => 'boolean'],
        ];
        yield 'bool nullable' => [
            Type::nullable(Type::bool()),
            (object)['type' => ['boolean', 'null']],
        ];
        yield 'false' => [
            Type::false(),
            (object)['type' => 'boolean', 'const' => false],
        ];
        yield 'true' => [
            Type::true(),
            (object)['type' => 'boolean', 'const' => true],
        ];

        // mixed
        yield 'mixed' => [
            Type::mixed(),
            (object)[],
        ];

        // null
        yield 'null' => [
            Type::null(),
            (object)['type' => 'null'],
        ];

        // @todo more collections
        yield 'object storage' => [
            Type::collection(Type::object(\SplObjectStorage::class), Type::object(\DateTimeInterface::class)),
            (object)[
                // @todo This should ideally be an array?
                'type' => 'object',
                'x-typo3-type' => 'array',
                'additionalProperties' => (object)[
                    'type' => 'string',
                    'format' => 'date-time',
                    'x-typo3-type' => 'DateTimeImmutable',
                ],
            ],
        ];

        // dict
        yield 'stringmap' => [
            Type::dict(Type::string()),
            (object)[
                'type' => 'object',
                'x-typo3-type' => 'array',
                'additionalProperties' => (object)[
                    'type' => 'string',
                ],
            ],
        ];

        // list
        yield 'stringlist' => [
            Type::list(Type::string()),
            (object)[
                'type' => 'array',
                'items' => (object)[
                    'type' => 'string',
                ],
            ],
        ];
        yield 'intlist' => [
            Type::list(Type::int()),
            (object)[
                'type' => 'array',
                'items' => (object)[
                    'type' => 'integer',
                ],
            ],
        ];

        // arrayShape
        yield 'array shape' => [
            Type::arrayShape([
                'propertyA' => [ 'type' => Type::string() ],
                'propertyB' => [ 'type' => Type::bool() ],
                'propertyC' => [ 'type' => Type::int() ],
                'propertyD' => [ 'type' => Type::float(), 'optional' => true ],
            ]),
            (object)[
                'type' => 'object',
                'properties' => (object)[
                    'propertyA' => (object)['type' => 'string'],
                    'propertyB' => (object)['type' => 'boolean'],
                    'propertyC' => (object)['type' => 'integer'],
                    'propertyD' => (object)['type' => 'number'],
                ],
                'required' => ['propertyA', 'propertyB', 'propertyC'],
                'additionalProperties' => false,
                'x-typo3-type' => 'array',
            ],
        ];

        // object
        yield 'simple object' => [
            Type::object(SimpleObjectFixture::class),
            (object)[
                'description' => '`TYPO3\CMS\Core\Tests\Unit\JsonSchema\Fixtures\Schema\SimpleObjectFixture`',
                '$ref' => '#/$defs/TYPO3.CMS.Core.Tests.Unit.JsonSchema.Fixtures.Schema.SimpleObjectFixture',
                '$defs' => (object)[
                    'TYPO3.CMS.Core.Tests.Unit.JsonSchema.Fixtures.Schema.SimpleObjectFixture' => (object)[
                        'type' => 'object',
                        'properties' => (object)[
                            'propertyA' => (object)['type' => 'string'],
                            'propertyB' => (object)['type' => 'boolean'],
                            'propertyC' => (object)['type' => 'integer'],
                            'propertyD' => (object)['type' => 'number'],
                        ],
                        'required' => ['propertyA', 'propertyB', 'propertyC'],
                        'additionalProperties' => false,
                        'title' => SimpleObjectFixture::class,
                        'x-typo3-type' => SimpleObjectFixture::class,
                    ],
                ],
            ],
        ];

        yield 'circular object' => [
            Type::object(CircularObjectFixture::class),
            (object)[
                'description' => '`TYPO3\CMS\Core\Tests\Unit\JsonSchema\Fixtures\Schema\CircularObjectFixture`',
                '$ref' => '#/$defs/TYPO3.CMS.Core.Tests.Unit.JsonSchema.Fixtures.Schema.CircularObjectFixture',
                '$defs' => (object)[
                    'TYPO3.CMS.Core.Tests.Unit.JsonSchema.Fixtures.Schema.CircularObjectFixture' => (object)[
                        'type' => 'object',
                        'properties' => (object)[
                            'children' => (object)[
                                'type' => 'array',
                                'items' => (object)[
                                    '$ref' => '#/$defs/TYPO3.CMS.Core.Tests.Unit.JsonSchema.Fixtures.Schema.CircularObjectFixture',
                                    'description' => '`' . CircularObjectFixture::class . '`',
                                ],
                            ],
                        ],
                        'required' => ['children'],
                        'additionalProperties' => false,
                        'title' => CircularObjectFixture::class,
                        'x-typo3-type' => CircularObjectFixture::class,
                    ],
                ],
            ],
        ];

        // enum
        yield 'enum string backed' => [
            Type::enum(ApplicationType::class),
            (object)[
                'type' => 'string',
                'enum' => ['backend', 'frontend', 'install'],
                'x-typo3-type' => ApplicationType::class,
            ],
        ];
        yield 'enum int backed' => [
            Type::enum(VersionState::class),
            (object)[
                'type' => 'integer',
                'enum' => [0, 1, 2, 4],
                'x-typo3-type' => VersionState::class,
            ],
        ];
        yield 'basic enum' => [
            Type::enum(DiffGranularity::class),
            (object)[
                'type' => 'string',
                'enum' => ['WORD', 'CHARACTER'],
                'x-typo3-type' => DiffGranularity::class,
            ],
        ];

        // generic
        yield 'generic object with string binding' => [
            Type::generic(Type::object(GenericObjectFixture::class), Type::string()),
            (object)[
                'description' => '`TYPO3\CMS\Core\Tests\Unit\JsonSchema\Fixtures\Schema\GenericObjectFixture<string>`',
                '$ref' => '#/$defs/TYPO3.CMS.Core.Tests.Unit.JsonSchema.Fixtures.Schema.GenericObjectFixture_string_',
                '$defs' => (object)[
                    'TYPO3.CMS.Core.Tests.Unit.JsonSchema.Fixtures.Schema.GenericObjectFixture_string_' => (object)[
                        'type' => 'object',
                        'properties' => (object)[
                            'propertyA' => (object)['type' => 'string'],
                            'genericProperty' => (object)['type' => 'string'],
                        ],
                        'required' => ['propertyA', 'genericProperty'],
                        'additionalProperties' => false,
                        'title' => GenericObjectFixture::class . '<string>',
                        'x-typo3-type' => GenericObjectFixture::class,
                    ],
                ],
            ],
        ];
        yield 'generic object with int binding' => [
            Type::generic(Type::object(GenericObjectFixture::class), Type::int()),
            (object)[
                'description' => '`TYPO3\CMS\Core\Tests\Unit\JsonSchema\Fixtures\Schema\GenericObjectFixture<int>`',
                '$ref' => '#/$defs/TYPO3.CMS.Core.Tests.Unit.JsonSchema.Fixtures.Schema.GenericObjectFixture_int_',
                '$defs' => (object)[
                    'TYPO3.CMS.Core.Tests.Unit.JsonSchema.Fixtures.Schema.GenericObjectFixture_int_' => (object)[
                        'type' => 'object',
                        'properties' => (object)[
                            'propertyA' => (object)['type' => 'string'],
                            'genericProperty' => (object)['type' => 'integer'],
                        ],
                        'required' => ['propertyA', 'genericProperty'],
                        'additionalProperties' => false,
                        'title' => GenericObjectFixture::class . '<int>',
                        'x-typo3-type' => GenericObjectFixture::class,
                    ],
                ],
            ],
        ];
        yield 'generic object without binding' => [
            Type::object(GenericObjectFixture::class),
            (object)[
                'description' => '`TYPO3\CMS\Core\Tests\Unit\JsonSchema\Fixtures\Schema\GenericObjectFixture`',
                '$ref' => '#/$defs/TYPO3.CMS.Core.Tests.Unit.JsonSchema.Fixtures.Schema.GenericObjectFixture',
                '$defs' => (object)[
                    'TYPO3.CMS.Core.Tests.Unit.JsonSchema.Fixtures.Schema.GenericObjectFixture' => (object)[
                        'type' => 'object',
                        'properties' => (object)[
                            'propertyA' => (object)['type' => 'string'],
                            'genericProperty' => (object)[
                                'anyOf' => [
                                    (object)['type' => 'integer'],
                                    (object)['type' => 'string'],
                                ],
                            ],
                        ],
                        'required' => ['propertyA', 'genericProperty'],
                        'additionalProperties' => false,
                        'title' => GenericObjectFixture::class,
                        'x-typo3-type' => GenericObjectFixture::class,
                    ],
                ],
            ],
        ];

        // @todo template (probably not needed, they are primarly transparent containers and are tested via generic assertions)

        // union
        yield 'union string int' => [
            Type::union(Type::string(), Type::int()),
            (object)[
                'anyOf' => [
                    (object)['type' => 'integer'],
                    (object)['type' => 'string'],
                ],
            ],
        ];
        yield 'union string int nullable' => [
            Type::nullable(Type::union(Type::string(), Type::int())),
            (object)[
                'anyOf' => [
                    (object)['type' => 'integer'],
                    (object)['type' => 'null'],
                    (object)['type' => 'string'],
                ],
            ],
        ];

        /*
        yield 'union of objects nullable' => [
            Type::nullable(Type::union(Type::object(\TYPO3\CMS\Core\Mcp\Response::class), Type::object(\TYPO3\CMS\Core\Mcp\Error::class))),
            (object)[
                'anyOf' => [
                    (object)[
                        'description' => '`TYPO3\CMS\Core\Mcp\Error`',
                        '$ref' => '#/$defs/TYPO3.CMS.Core.Mcp.Error',
                    ],
                    (object)[
                        'description' => '`TYPO3\CMS\Core\Mcp\Response`',
                        '$ref' => '#/$defs/TYPO3.CMS.Core.Mcp.Response',
                    ],
                    (object)['type' => 'null'],
                ],
                '$defs' => (object)[
                    'TYPO3.CMS.Core.Mcp.Error' => (object)[
                        'type' => 'object',
                        'properties' => (object)[
                            'id' => (object)[
                                'anyOf' => [
                                    (object)['type' => 'integer'],
                                    (object)['type' => 'string'],
                                ],
                            ],
                            'error' => (object)[
                                'type' => 'object',
                                'properties' => (object)[
                                    'code' => (object)['type' => 'integer'],
                                    'message' => (object)['type' => 'string'],
                                    'data' => (object)[],
                                ],
                                'required' => ['code', 'message'],
                                'additionalProperties' => false,
                                'x-typo3-type' => 'array',
                            ],
                            'jsonrpc' => (object)[
                                'type' => 'string',
                                'enum' => ['2.0'],
                                'x-typo3-type' => 'TYPO3\CMS\Core\Mcp\Enum\JsonRpc',
                            ],
                        ],
                        'required' => ['id', 'error'],
                        'additionalProperties' => false,
                        'title' => 'TYPO3\CMS\Core\Mcp\Error',
                        'x-typo3-type' => 'TYPO3\CMS\Core\Mcp\Error',
                    ],
                    'TYPO3.CMS.Core.Mcp.Response' => (object)[
                        'type' => 'object',
                        'properties' => (object)[
                            'id' => (object)[
                                'anyOf' => [
                                    (object)['type' => 'integer'],
                                    (object)['type' => 'string'],
                                ],
                            ],
                            'jsonrpc' => (object)[
                                'type' => 'string',
                                'enum' => ['2.0'],
                                'x-typo3-type' => 'TYPO3\CMS\Core\Mcp\Enum\JsonRpc',
                            ],
                            'result' => (object)[
                                'type' => 'object',
                                'additionalProperties' => (object)[],
                                'x-typo3-type' => 'array',
                            ],
                        ],
                        'required' => ['id', 'result'],
                        'additionalProperties' => false,
                        'title' => 'TYPO3\CMS\Core\Mcp\Response',
                        'x-typo3-type' => 'TYPO3\CMS\Core\Mcp\Response',
                    ],
                ],
            ],
        ];
        //*/

        // @todo intersection
    }
}
