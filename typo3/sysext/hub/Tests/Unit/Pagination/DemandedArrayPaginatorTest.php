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

namespace TYPO3\CMS\Hub\Tests\Unit\Pagination;

use PHPUnit\Framework\Attributes\Test;
use TYPO3\CMS\Hub\Pagination\DemandedArrayPaginator;
use TYPO3\TestingFramework\Core\Unit\UnitTestCase;

final class DemandedArrayPaginatorTest extends UnitTestCase
{
    #[Test]
    public function paginatedItemsAreReturnedUnsliced(): void
    {
        $items = ['c', 'd'];
        $subject = new DemandedArrayPaginator($items, 2, 2, 5);

        self::assertSame($items, $subject->getPaginatedItems());
    }

    #[Test]
    public function numberOfPagesIsCalculatedFromAllCount(): void
    {
        $subject = new DemandedArrayPaginator(['c', 'd'], 2, 2, 5);

        self::assertSame(3, $subject->getNumberOfPages());
        self::assertSame(2, $subject->getCurrentPageNumber());
        self::assertSame(2, $subject->getKeyOfFirstPaginatedItem());
        self::assertSame(3, $subject->getKeyOfLastPaginatedItem());
    }

    #[Test]
    public function currentPageNumberIsLimitedToNumberOfPages(): void
    {
        $subject = new DemandedArrayPaginator([], 10, 2, 5);

        self::assertSame(3, $subject->getCurrentPageNumber());
    }
}
