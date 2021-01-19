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

namespace TYPO3\CMS\Core\Tests\Acceptance\Application\IndexedSearch;

use TYPO3\CMS\Core\Tests\Acceptance\Support\ApplicationTester;

/**
 * Tests for the Indexed Search module
 */
final class IndexedSearchModuleCest
{
    public function _before(ApplicationTester $I): void
    {
        $I->useExistingSession('admin');
    }

    public function checkExpectedTextOnIndexedSearchPages(ApplicationTester $I): void
    {
        $I->click('[data-modulemenu-identifier="web_IndexedSearchIsearch"]');
        // click on PID=0
        $I->clickWithLeftButton('#typo3-pagetree-treeContainer [role="treeitem"][data-id="0"] .node-contentlabel');
        $I->switchToContentFrame();
        $I->seeElement('.t3-js-jumpMenuBox');
        $I->selectOption('.t3-js-jumpMenuBox', 'General statistics');
        $I->see('General statistics', 'typo3-backend-module');
        $I->see('Row count by database table', 'typo3-backend-module');
        // Select only "Row count by database table"
        $rowCount = $I->grabMultiple('.row > .col-md-6:first-child > table > tbody >tr > td:nth-child(2)');
        foreach ($rowCount as $count) {
            // Check only for numeric value, coz we can't actually predict the value due to frontend testing
            $I->assertIsNumeric($count);
        }

        $I->selectOption('.t3-js-jumpMenuBox', 'List of indexed pages');
        $I->see('List of indexed pages', 'typo3-backend-module');

        $I->selectOption('.t3-js-jumpMenuBox', 'List of indexed external documents');
        $I->see('List of indexed external documents', 'typo3-backend-module');

        $I->selectOption('.t3-js-jumpMenuBox', 'Detailed statistics');
        $I->see('Detailed statistics', 'typo3-backend-module');
        $I->see('Please select a page in the page tree.', 'typo3-backend-module');
    }
}
