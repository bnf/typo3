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

/**
 * Loads EXT:hub for the core and backend tests copied into this extension,
 * the copied classes are only registered by EXT:hub in TYPO3 v14.
 */
abstract class FunctionalTestCase extends \TYPO3\TestingFramework\Core\Functional\FunctionalTestCase
{
    protected function setUp(): void
    {
        $this->testExtensionsToLoad = ['typo3-suite/hub', ...$this->testExtensionsToLoad];
        parent::setUp();
    }
}
