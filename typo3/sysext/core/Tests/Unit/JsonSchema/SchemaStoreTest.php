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
use Symfony\Component\DependencyInjection\ServiceLocator;
use TYPO3\CMS\Core\JsonSchema\DynamicSchemaProviderInterface;
use TYPO3\CMS\Core\JsonSchema\DynamicSchemaProviderRegistry;
use TYPO3\CMS\Core\JsonSchema\Schema;
use TYPO3\CMS\Core\JsonSchema\SchemaStore;
use TYPO3\TestingFramework\Core\Unit\UnitTestCase;

final class SchemaStoreTest extends UnitTestCase
{
    #[Test]
    public function storeWithDynamicSchemasOnlyIsNotEmpty(): void
    {
        $store = new SchemaStore();
        $store->defineDynamic('Foo', \stdClass::class, 'Foo', []);

        self::assertFalse($store->isEmpty());
    }

    #[Test]
    public function definitionsOfStoreWithDynamicSchemaProviderOnlyAreProvided(): void
    {
        $provider = new class implements DynamicSchemaProviderInterface {
            public function getSchema(SchemaStore $store): Schema
            {
                return new Schema(type: 'string');
            }

            public function getProvidedSchemas(): array
            {
                return ['Foo'];
            }
        };
        $store = new SchemaStore(
            dynamicSchemaProviderRegistry: new DynamicSchemaProviderRegistry(new ServiceLocator(['Foo' => static fn() => $provider])),
        );

        $schema = (new Schema(ref: '#/$defs/Foo'))->with(['store' => $store])->toPlainObject();

        self::assertSame('string', $schema->{'$defs'}->Foo->type ?? null);
    }
}
