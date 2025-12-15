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
use TYPO3\TestingFramework\Core\Functional\FunctionalTestCase;
use TYPO3Tests\TestAction\Action\TestAction;

final class ActionRegistryTest extends FunctionalTestCase
{
    protected array $testExtensionsToLoad = [
        'typo3/sysext/core/Tests/Functional/Fixtures/Extensions/test_action',
    ];

    #[Test]
    public function identifierIsDerivedFromTypeRouteAndVersion(): void
    {
        $registry = $this->get(ActionRegistry::class);

        self::assertSame('fetch_test_items_by_collection_by_id', $registry->getActionByMethod([TestAction::class, 'fetchItem'])->id);
        self::assertSame('create_test_items_by_collection', $registry->getActionByMethod([TestAction::class, 'createItem'])->id);
        self::assertSame('fetch_test_versioned_v2', $registry->getActionByMethod([TestAction::class, 'versionedV2'])->id);
    }

    #[Test]
    public function explicitIdentifierIsUsed(): void
    {
        $action = $this->get(ActionRegistry::class)->getActionByMethod([TestAction::class, 'explicitId']);

        self::assertSame('fetch_explicitly_identified', $action->id);
        self::assertSame('test/explicit-id', $action->route);
    }

    #[Test]
    public function methodWithoutActionIsRejected(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionCode(1793785201);

        $this->get(ActionRegistry::class)->getActionByMethod([TestAction::class, 'unknown']);
    }
}
