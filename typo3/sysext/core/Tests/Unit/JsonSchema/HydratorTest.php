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
use TYPO3\CMS\Core\JsonSchema\Hydrator;
use TYPO3\CMS\Core\JsonSchema\SchemaBuilder;
use TYPO3\CMS\Core\Tests\Unit\JsonSchema\Fixtures\Schema\CircularObjectFixture;
use TYPO3\CMS\Core\Tests\Unit\JsonSchema\Fixtures\Schema\GenericObjectFixture;
use TYPO3\CMS\Core\Tests\Unit\JsonSchema\Fixtures\Schema\SimpleObjectFixture;
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
}
