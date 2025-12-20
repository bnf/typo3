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

namespace TYPO3\CMS\Hub\Tests\Functional;

use PHPUnit\Framework\Attributes\Test;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Hub\App\CreateRecordApp;
use TYPO3\CMS\Hub\AppRegistry;
use TYPO3\TestingFramework\Core\Functional\FunctionalTestCase;

final class AppRegistryTest extends FunctionalTestCase
{
    protected bool $resetSingletonInstances = true;

    protected array $coreExtensionsToLoad = ['hub'];

    protected AppRegistry $subject;

    protected function setUp(): void
    {
        parent::setUp();
        $hub = $this->buildAppMock();
        $this->subject = new AppRegistry($hub);
    }

    #[Test]
    public function getAvailableAppTypes(): void
    {
        $types = iterator_to_array($this->subject->getAvailableAppTypes()->getIterator());
        self::assertInstanceOf(CreateRecordApp::class, reset($types));
        self::assertCount(1, $types);
    }

    #[Test]
    public function getAppByType(): void
    {
        self::assertInstanceOf(CreateRecordApp::class, $this->subject->getAppByType(CreateRecordApp::getType()));
        self::assertNull($this->subject->getAppByType('invalid'));
    }

    protected function buildAppMock(): \IteratorAggregate
    {
        $class = new class () implements \IteratorAggregate {
            public function getIterator(): \Traversable
            {
                return new \ArrayIterator([CreateRecordApp::getType() => GeneralUtility::makeInstance(CreateRecordApp::class)]);
            }
        };

        return new $class();
    }
}
