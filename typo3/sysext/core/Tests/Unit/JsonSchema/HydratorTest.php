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
use TYPO3\CMS\Core\JsonSchema\Hydrator;
use TYPO3\CMS\Core\JsonSchema\Schema;
use TYPO3\CMS\Core\JsonSchema\SchemaBuilder;
use TYPO3\CMS\Core\Tests\Unit\JsonSchema\Fixtures\Schema\CircularObjectFixture;
use TYPO3\CMS\Core\Tests\Unit\JsonSchema\Fixtures\Schema\DateTimePropertyFixture;
use TYPO3\CMS\Core\Tests\Unit\JsonSchema\Fixtures\Schema\GenericObjectFixture;
use TYPO3\CMS\Core\Tests\Unit\JsonSchema\Fixtures\Schema\SimpleObjectFixture;
use TYPO3\CMS\Core\Utility\DiffGranularity;
use TYPO3\CMS\Core\Versioning\VersionState;
use TYPO3\TestingFramework\Core\Unit\UnitTestCase;

final class HydratorTest extends UnitTestCase
{
    #[Test]
    public function hydratesArrayShape(): void
    {
        $schemaMapper = new SchemaBuilder();
        $hydrator = new Hydrator();

        $schema = $schemaMapper->build(Type::arrayShape([
            'propertyA' => [ 'type' => Type::string() ],
            'propertyB' => [ 'type' => Type::bool() ],
            'propertyC' => [ 'type' => Type::int() ],
            'propertyD' => [ 'type' => Type::mixed() ],
            'propertyE' => [ 'type' => Type::float(), 'optional' => true ],
        ]));

        $expected = [
            'propertyA' => 'a',
            'propertyB' => true,
            'propertyC' => 3,
            'propertyD' => 'mixed',
            'propertyE' => 4.3,
        ];
        $rawData = json_decode(json_encode($expected), false);

        $result = $hydrator->hydrate($rawData, $schema);

        self::assertEquals($expected, $result);
    }

    #[Test]
    public function hydratesList(): void
    {
        $schemaMapper = new SchemaBuilder();
        $hydrator = new Hydrator();

        $schema = $schemaMapper->build(Type::list());

        $expected = ['a', true, 3, 'mixed', 4.3];
        $rawData = json_decode(json_encode($expected), false);

        $result = $hydrator->hydrate($rawData, $schema);

        self::assertEquals($expected, $result);
    }

    #[Test]
    public function hydratesSimpleObject(): void
    {
        $schemaMapper = new SchemaBuilder();
        $hydrator = new Hydrator();

        $schema = $schemaMapper->build(Type::object(SimpleObjectFixture::class));

        $expected = new SimpleObjectFixture('a', true, 3, 'mixed', 4.3);
        $rawData = json_decode(json_encode($expected), false);

        $result = $hydrator->hydrate($rawData, $schema);

        self::assertEquals($expected, $result);
    }

    #[Test]
    public function hydratesGenericObject(): void
    {
        $schemaMapper = new SchemaBuilder();
        $hydrator = new Hydrator();

        $schema = $schemaMapper->build(Type::generic(Type::object(GenericObjectFixture::class), Type::int()));

        $expected = new GenericObjectFixture('a', 3);
        $rawData = json_decode(json_encode($expected), false);

        $result = $hydrator->hydrate($rawData, $schema);

        self::assertEquals($expected, $result);
    }

    #[Test]
    public function hydratesCircularObject(): void
    {
        $schemaMapper = new SchemaBuilder();
        $hydrator = new Hydrator();

        $schema = $schemaMapper->build(Type::object(CircularObjectFixture::class));

        $expected = new CircularObjectFixture([
            new CircularObjectFixture([
                new CircularObjectFixture([]),
                new CircularObjectFixture([]),
            ]),
            new CircularObjectFixture([]),
        ]);
        $rawData = json_decode(json_encode($expected), false);

        $result = $hydrator->hydrate($rawData, $schema);

        self::assertEquals($expected, $result);
    }

    #[Test]
    public function hydratesDateTimeProperty(): void
    {
        $schemaMapper = new SchemaBuilder();
        $hydrator = new Hydrator();

        $schema = $schemaMapper->build(Type::object(DateTimePropertyFixture::class));

        $expected = new DateTimePropertyFixture('a', new \DateTimeImmutable('2026-04-09T03:40:30Z'));
        $rawData = json_decode(json_encode($expected), false);

        $result = $hydrator->hydrate($rawData, $schema);

        self::assertEquals($expected, $result);
    }

    #[Test]
    public function hydratesStringBackedEnum(): void
    {
        $schemaMapper = new SchemaBuilder();
        $hydrator = new Hydrator();

        $schema = $schemaMapper->build(Type::enum(ApplicationType::class));

        $expected = ApplicationType::BACKEND;
        $rawData = json_decode(json_encode($expected), false);

        $result = $hydrator->hydrate($rawData, $schema);

        self::assertEquals($expected, $result);
    }

    #[Test]
    public function hydratesIntBackedEnum(): void
    {
        $schemaMapper = new SchemaBuilder();
        $hydrator = new Hydrator();

        $schema = $schemaMapper->build(Type::enum(VersionState::class));

        $expected = VersionState::DELETE_PLACEHOLDER;
        $encoded = json_encode($expected);
        $rawData = json_decode($encoded, false);

        $result = $hydrator->hydrate($rawData, $schema);

        self::assertEquals('2', $encoded);
        self::assertEquals($expected, $result);
    }

    #[Test]
    public function hydratesBasicBackedEnum(): void
    {
        $schemaMapper = new SchemaBuilder();
        $hydrator = new Hydrator();

        $schema = $schemaMapper->build(Type::enum(DiffGranularity::class));

        $encoded = json_encode('CHARACTER');
        $rawData = json_decode($encoded, false, 512, JSON_THROW_ON_ERROR);
        $expected = DiffGranularity::CHARACTER;

        $result = $hydrator->hydrate($rawData, $schema);

        self::assertEquals($expected, $result);
    }

    #[Test]
    public function hydratesNull(): void
    {
        $schemaMapper = new SchemaBuilder();
        $hydrator = new Hydrator();

        $schema = $schemaMapper->build(Type::null());
        $expected = null;
        $rawData = json_decode(json_encode($expected), false);

        $result = $hydrator->hydrate($rawData, $schema);

        self::assertEquals($expected, $result);
    }

    #[Test]
    public function hydratesOneOfBranchMatchingConst(): void
    {
        $hydrator = new Hydrator();
        $branch = static fn(string $kind, ?string $xTypo3Type): Schema => new Schema(
            type: 'object',
            properties: [
                'kind' => new Schema(const: $kind),
                'value' => new Schema(type: 'string'),
            ],
            additionalProperties: false,
            xTypo3Type: $xTypo3Type,
        );
        $schema = new Schema(
            oneOf: [
                $branch('a', 'array'),
                $branch('b', null),
            ],
        );

        $result = $hydrator->hydrate(json_decode('{"kind":"b","value":"x"}', false), $schema);

        self::assertEquals((object)['kind' => 'b', 'value' => 'x'], $result);
    }

    #[Test]
    public function hydratesFirstSubschemaOfAllOf(): void
    {
        $schema = new Schema(
            allOf: [
                new Schema(
                    type: 'object',
                    properties: [
                        'value' => new Schema(type: 'string'),
                    ],
                    xTypo3Type: 'array',
                ),
                new Schema(required: ['value']),
            ],
        );

        $result = new Hydrator()->hydrate(json_decode('{"value":"x"}', false), $schema);

        self::assertSame(['value' => 'x'], $result);
    }

    #[Test]
    public function rejectsValueNotMatchingConst(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        new Hydrator()->hydrate('b', new Schema(type: 'string', const: 'a'));
    }

    public static function coercesScalarsDataProvider(): \Generator
    {
        yield 'integer 5' => [
            'type' => Type::int(),
            'value' => '5',
            'expected' => 5,
        ];
        yield 'integer 6 (for int|string)' => [
            'type' => Type::union(Type::string(), Type::int()),
            'value' => '6',
            'expected' => 6,
        ];
        yield 'float 5' => [
            'type' => Type::float(),
            'value' => '5',
            'expected' => 5,
        ];
        yield 'float 5.5' => [
            'type' => Type::float(),
            'value' => '5.5',
            'expected' => 5.5,
        ];
        yield 'bool false' => [
            'type' => Type::bool(),
            'value' => 'false',
            'expected' => false,
        ];
        yield 'bool no' => [
            'type' => Type::bool(),
            'value' => 'no',
            'expected' => false,
        ];
        yield 'bool true' => [
            'type' => Type::bool(),
            'value' => 'true',
            'expected' => true,
        ];
        yield 'bool yes' => [
            'type' => Type::bool(),
            'value' => 'yes',
            'expected' => true,
        ];
        yield 'enum string' => [
            'type' => Type::enum(ApplicationType::class),
            'value' => 'backend',
            // plain data value expected (this is "data" presentation, no object mapping yet)
            'expected' => 'backend',
        ];
        yield 'null' => [
            'type' => Type::union(Type::string(), Type::null()),
            'value' => 'null',
            'expected' => null,
        ];
    }

    #[DataProvider('coercesScalarsDataProvider')]
    #[Test]
    public function coercesScalars(Type $type, mixed $value, mixed $expected): void
    {
        $schema = new SchemaBuilder()->build($type);
        $result = new Hydrator()->coerceScalars($value, $schema);

        self::assertEquals($expected, $result);
    }
}
