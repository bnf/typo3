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

namespace TYPO3\CMS\Core\Tests\Functional\Action\Ai;

use PHPUnit\Framework\Attributes\Test;
use TYPO3\CMS\Core\Action\ActionInvoker;
use TYPO3\CMS\Core\Action\ActionRegistry;
use TYPO3\CMS\Core\Action\Ai\ToolProvider;
use TYPO3\CMS\Core\Context\Context;
use TYPO3\TestingFramework\Core\Functional\FunctionalTestCase;

final class ToolProviderTest extends FunctionalTestCase
{
    protected array $testExtensionsToLoad = [
        'typo3/sysext/core/Tests/Functional/Fixtures/Extensions/test_action',
    ];

    #[Test]
    public function toolsAreProvidedForActionsOfAiTargetOnly(): void
    {
        // Not retrieved from the container, which drops the service as long as it is unused
        $toolProvider = new ToolProvider(
            $this->get(ActionRegistry::class),
            $this->get(ActionInvoker::class),
            $this->get(Context::class),
        );
        $tools = $toolProvider->buildTools();

        self::assertArrayHasKey('fetch_test_simple_return', $tools);
        self::assertArrayNotHasKey('fetch_test_backend_only', $tools);
        self::assertArrayNotHasKey('fetch_test_http_only', $tools);
    }
}
