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
use TYPO3\CMS\Core\JsonSchema\Schema;
use TYPO3\CMS\Core\JsonSchema\SchemaNarrower;
use TYPO3\CMS\Core\JsonSchema\SchemaStore;
use TYPO3\TestingFramework\Core\Unit\UnitTestCase;

final class SchemaNarrowerTest extends UnitTestCase
{
    private function createSchema(): Schema
    {
        $branch = static fn(string $kind): Schema => new Schema(
            type: 'object',
            properties: [
                'kind' => new Schema(const: $kind),
                'value' => new Schema(type: 'string'),
            ],
            required: ['kind'],
            additionalProperties: false,
        );
        return new Schema(
            type: 'object',
            properties: [
                'item' => new Schema(ref: '#/$defs/Item'),
            ],
            store: new SchemaStore([
                'Item' => new Schema(
                    oneOf: [
                        new Schema(ref: '#/$defs/Item_a'),
                        new Schema(ref: '#/$defs/Item_b'),
                    ],
                    discriminator: [
                        'propertyName' => 'kind',
                        'mapping' => ['a' => '#/$defs/Item_a', 'b' => '#/$defs/Item_b'],
                    ],
                ),
                'Item_a' => $branch('a'),
                'Item_b' => $branch('b'),
            ]),
        );
    }

    #[Test]
    public function narrowsDiscriminatedOneOfToSelectedSubschema(): void
    {
        $data = json_decode('{"item":{"kind":"b","value":"x"}}', false);

        $schema = new SchemaNarrower()->narrow($data, $this->createSchema())->toPlainObject();

        self::assertEquals((object)['const' => 'b'], $schema->properties->item->properties->kind);
        self::assertObjectNotHasProperty('oneOf', $schema->properties->item);
        self::assertObjectNotHasProperty('$defs', $schema);
    }

    #[Test]
    public function narrowsUnknownDiscriminatorValueToEnumOfKnownValues(): void
    {
        $data = json_decode('{"item":{"kind":"c"}}', false);

        $schema = new SchemaNarrower()->narrow($data, $this->createSchema())->toPlainObject();

        self::assertEquals(['a', 'b'], $schema->properties->item->properties->kind->enum);
        self::assertEquals(['kind'], $schema->properties->item->required);
    }

    #[Test]
    public function keepsSchemaForNonObjectData(): void
    {
        $schema = $this->createSchema();
        $data = json_decode('{"item":null}', false);

        $narrowed = new SchemaNarrower()->narrow($data, $schema);

        self::assertEquals('#/$defs/Item', $narrowed->properties['item']->ref);
    }

    #[Test]
    public function discriminatorSurvivesJsonRoundTripWithNumericValues(): void
    {
        $schema = new Schema(
            oneOf: [new Schema(ref: '#/$defs/A')],
            discriminator: ['propertyName' => 'type', 'mapping' => ['1' => '#/$defs/A', '254' => '#/$defs/B']],
        );

        $json = json_encode($schema, JSON_UNESCAPED_SLASHES);
        $restored = Schema::fromJSON($json);

        self::assertStringContainsString('"mapping":{"1":"#/$defs/A","254":"#/$defs/B"}', $json);
        self::assertSame(['propertyName' => 'type', 'mapping' => [1 => '#/$defs/A', 254 => '#/$defs/B']], $restored->discriminator);
    }
}
