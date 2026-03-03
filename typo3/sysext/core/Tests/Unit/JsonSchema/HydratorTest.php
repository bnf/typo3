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

use PHPUnit\Framework\Attributes\Test;
use Symfony\Component\TypeInfo\Type;
use TYPO3\CMS\Core\Http\ApplicationType;
use TYPO3\CMS\Core\JsonSchema\Hydrator;
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
    public function hydratesSimpleObject(): void
    {
        $schemaMapper = new SchemaBuilder();
        $hydrator = new Hydrator();

        $schema = $schemaMapper->build(Type::object(SimpleObjectFixture::class));

        $expected = new SimpleObjectFixture('a', true, 3, 4.3);
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
}
