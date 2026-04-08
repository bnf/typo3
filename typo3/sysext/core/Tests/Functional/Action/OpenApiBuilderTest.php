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

namespace TYPO3\CMS\Core\Tests\Functional\Action;

use PHPUnit\Framework\Attributes\Test;
use TYPO3\CMS\Core\Action\ActionDescriptor;
use TYPO3\CMS\Core\Action\ActionRegistry;
use TYPO3\CMS\Core\Action\OpenApiBuilder;
use TYPO3\TestingFramework\Core\Functional\FunctionalTestCase;

final class OpenApiBuilderTest extends FunctionalTestCase
{
    protected array $testExtensionsToLoad = [
        'typo3/sysext/core/Tests/Functional/Fixtures/Extensions/test_action',
    ];

    #[Test]
    public function queryParameterOfRequestWithBodyIsDescribedAsQueryParameter(): void
    {
        $action = $this->get(ActionRegistry::class)->getAction('create_test_query_parameter');
        $operation = json_decode(json_encode(
            $this->get(OpenApiBuilder::class)->actionToPathItem($action)->getSerializableData()
        ), true)['post'];

        self::assertSame([
            'query parameters' => ['bar'],
            'body properties' => ['foo'],
        ], [
            'query parameters' => array_column(array_filter($operation['parameters'] ?? [], static fn(array $parameter): bool => $parameter['in'] === 'query'), 'name'),
            'body properties' => array_keys($operation['requestBody']['content']['application/json']['schema']['properties'] ?? []),
        ]);
    }

    #[Test]
    public function deprecatedActionIsMarkedAsDeprecated(): void
    {
        $registry = $this->get(ActionRegistry::class);
        $deprecated = $this->buildOperation($registry->getAction('fetch_test_versioned'), 'get');
        $current = $this->buildOperation($registry->getAction('fetch_test_versioned_v2'), 'get');

        self::assertTrue($deprecated['deprecated']);
        self::assertArrayHasKey('Deprecation', $deprecated['responses']['200']['headers']);
        self::assertFalse($current['deprecated'] ?? false);
        self::assertArrayNotHasKey('headers', $current['responses']['200']);
    }

    #[Test]
    public function createActionIsDescribedWithLocationOfCreatedResource(): void
    {
        $operation = $this->buildOperation($this->get(ActionRegistry::class)->getAction('create_test_items_by_collection'), 'post');

        self::assertSame('create_test_items_by_collection', $operation['operationId']);
        self::assertSame([201, 'default'], array_keys($operation['responses']));
        self::assertArrayHasKey('Location', $operation['responses']['201']['headers']);
        self::assertSame([
            'location' => [
                'operationId' => 'fetch_test_items_by_collection_by_id',
                'parameters' => [
                    'collection' => '$request.path.collection',
                    'id' => '$response.body#/item/id',
                ],
                'description' => 'The created resource, as announced in the `Location` header',
            ],
        ], $operation['responses']['201']['links']);
    }

    #[Test]
    public function createActionWithoutLocationIsDescribedWithOk(): void
    {
        $operation = $this->buildOperation($this->get(ActionRegistry::class)->getAction('create_test_query_parameter'), 'post');

        self::assertSame([200, 'default'], array_keys($operation['responses']));
        self::assertArrayNotHasKey('links', $operation['responses']['200']);
    }

    #[Test]
    public function errorsAreDescribedAsProblemDetails(): void
    {
        $operation = $this->buildOperation($this->get(ActionRegistry::class)->getAction('fetch_test_not_found'), 'get');
        $problem = [
            'application/problem+json' => [
                'schema' => ['$ref' => '#/components/schemas/' . OpenApiBuilder::PROBLEM_SCHEMA],
            ],
        ];

        self::assertSame([200, 404, 'default'], array_keys($operation['responses']));
        self::assertSame($problem, $operation['responses']['404']['content']);
        self::assertSame($problem, $operation['responses']['default']['content']);
    }

    private function buildOperation(ActionDescriptor $action, string $method): array
    {
        return json_decode(json_encode(
            $this->get(OpenApiBuilder::class)->actionToPathItem($action)->getSerializableData()
        ), true)[$method];
    }
}
