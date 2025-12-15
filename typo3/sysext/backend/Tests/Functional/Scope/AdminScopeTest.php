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

namespace TYPO3\CMS\Backend\Tests\Functional\Scope;

use PHPUnit\Framework\Attributes\Test;
use TYPO3\CMS\Core\Scope\AdminScope;
use TYPO3\CMS\Core\Scope\ScopeRegistry;
use TYPO3\CMS\Core\Scope\ScopeUser;
use TYPO3\CMS\Frontend\Authentication\FrontendUserAuthentication;
use TYPO3\TestingFramework\Core\Functional\FunctionalTestCase;

final class AdminScopeTest extends FunctionalTestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        $this->importCSVDataSet(__DIR__ . '/Fixtures/be_users.csv');
    }

    #[Test]
    public function adminScopeIsRegistered(): void
    {
        self::assertInstanceOf(AdminScope::class, $this->get(ScopeRegistry::class)->get('admin'));
    }

    #[Test]
    public function adminScopeIsOnlyAllowedForAdministrators(): void
    {
        $subject = $this->get(AdminScope::class);

        self::assertTrue($subject->allowedForUser(new ScopeUser($this->setUpBackendUser(1))));
        self::assertFalse($subject->allowedForUser(new ScopeUser($this->setUpBackendUser(2))));
        self::assertFalse($subject->allowedForUser(new ScopeUser(new FrontendUserAuthentication())));
    }
}
