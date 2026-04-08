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
        $action = $this->get(ActionRegistry::class)->getAction('test/query-parameter:create');
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
}
