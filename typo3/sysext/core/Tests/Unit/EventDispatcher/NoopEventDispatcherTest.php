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

namespace TYPO3\CMS\Core\Tests\Unit\EventDispatcher;

use Psr\EventDispatcher\EventDispatcherInterface;
use TYPO3\CMS\Core\EventDispatcher\NoopEventDispatcher;
use TYPO3\TestingFramework\Core\Unit\UnitTestCase;

class NoopEventDispatcherTest extends UnitTestCase
{
    /**
     * @test
     */
    public function implementsEventDispatcherInterface(): void
    {
        self::assertInstanceOf(EventDispatcherInterface::class, new NoopEventDispatcher());
    }

    /**
     * @test
     */
    public function dispatchReturnsProvidedEvent(): void
    {
        $event = new \stdClass();

        self::assertSame($event, (new NoopEventDispatcher())->dispatch($event));
    }
}
