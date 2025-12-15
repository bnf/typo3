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

use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\Attributes\Test;
use TYPO3\CMS\Backend\Scope\ContentReadScope;
use TYPO3\CMS\Backend\Scope\ContentWriteScope;
use TYPO3\CMS\Core\Scope\ScopeUser;
use TYPO3\CMS\Frontend\Authentication\FrontendUserAuthentication;
use TYPO3\TestingFramework\Core\Functional\FunctionalTestCase;

final class ContentScopeTest extends FunctionalTestCase
{
    protected array $coreExtensionsToLoad = ['filelist'];

    protected function setUp(): void
    {
        parent::setUp();
        $this->importCSVDataSet(__DIR__ . '/Fixtures/be_users.csv');
    }

    public static function backendUserDataProvider(): array
    {
        return [
            'admin' => [1, ['read' => true, 'write' => true]],
            'page editor' => [2, ['read' => true, 'write' => true]],
            'page reader' => [3, ['read' => true, 'write' => false]],
            'page reader with default file permissions' => [8, ['read' => true, 'write' => false]],
            'record editor' => [4, ['read' => true, 'write' => true]],
            'file editor' => [5, ['read' => true, 'write' => true]],
            'file reader' => [6, ['read' => true, 'write' => false]],
            'no content modules' => [7, ['read' => false, 'write' => false]],
        ];
    }

    #[Test]
    #[DataProvider('backendUserDataProvider')]
    public function contentScopesFollowBackendModuleAccess(int $userUid, array $expected): void
    {
        $user = new ScopeUser($this->setUpBackendUser($userUid));

        self::assertSame($expected, [
            'read' => $this->get(ContentReadScope::class)->allowedForUser($user),
            'write' => $this->get(ContentWriteScope::class)->allowedForUser($user),
        ]);
    }

    #[Test]
    public function contentScopesAreNotAllowedForFrontendUsers(): void
    {
        $user = new ScopeUser(new FrontendUserAuthentication());

        self::assertSame(['read' => false, 'write' => false], [
            'read' => $this->get(ContentReadScope::class)->allowedForUser($user),
            'write' => $this->get(ContentWriteScope::class)->allowedForUser($user),
        ]);
    }
}
