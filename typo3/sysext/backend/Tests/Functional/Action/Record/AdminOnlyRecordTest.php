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

namespace TYPO3\CMS\Backend\Tests\Functional\Action\Record;

use PHPUnit\Framework\Attributes\Test;
use TYPO3\CMS\Backend\Scope\ContentReadScope;
use TYPO3\CMS\Backend\Scope\ContentWriteScope;
use TYPO3\CMS\Core\Action\ActionContext;
use TYPO3\CMS\Core\Action\ActionInvoker;
use TYPO3\CMS\Core\Action\ActionRegistry;
use TYPO3\CMS\Core\Action\Error\InsufficientScopeError;
use TYPO3\CMS\Core\Action\Error\PermissionDeniedError;
use TYPO3\CMS\Core\Context\Context;
use TYPO3\CMS\Core\Database\ConnectionPool;
use TYPO3\CMS\Core\Localization\LanguageServiceFactory;
use TYPO3\CMS\Core\Scope\AdminScope;
use TYPO3\TestingFramework\Core\Functional\FunctionalTestCase;

/**
 * Records of tables restricted to administrators (`adminOnly`) require the
 * scope `admin` in addition to the content scopes. The test extension
 * restricts prices, the inline children of offers, to administrators.
 */
final class AdminOnlyRecordTest extends FunctionalTestCase
{
    private const CONTENT = ['content:read', 'content:write'];
    private const ADMIN = ['content:read', 'content:write', 'admin'];

    protected array $testExtensionsToLoad = [
        'typo3/sysext/core/Tests/Functional/Fixtures/Extensions/test_irre_foreignfield',
        'typo3/sysext/backend/Tests/Functional/Action/Record/Fixtures/Extensions/test_record_admin_only',
    ];

    protected function setUp(): void
    {
        parent::setUp();
        $this->importCSVDataSet(__DIR__ . '/Fixtures/pages_editable.csv');
        $this->importCSVDataSet(__DIR__ . '/../../../../../core/Tests/Functional/Fixtures/be_users_admin.csv');
        $this->importCSVDataSet(__DIR__ . '/Fixtures/be_users_price_reader.csv');
        $this->importCSVDataSet(__DIR__ . '/Fixtures/hotels.csv');
    }

    #[Test]
    public function recordOfAdminOnlyTableRequiresAdminScope(): void
    {
        try {
            $this->invoke(1, self::CONTENT, 'fetch_records_by_schema_by_identifier', ['schema' => 'be_users', 'identifier' => 1]);
            self::fail('Expected missing scope to be reported');
        } catch (InsufficientScopeError $e) {
            self::assertSame('admin', $e->scope);
        }
    }

    #[Test]
    public function recordsOfAdminOnlyTableCanNotBeListedWithoutAdminScope(): void
    {
        $this->expectException(InsufficientScopeError::class);
        $this->invoke(1, self::CONTENT, 'fetch_records_by_schema', ['schema' => 'be_users']);
    }

    #[Test]
    public function recordOfAdminOnlyTableIsReadWithAdminScope(): void
    {
        $record = $this->invoke(1, self::ADMIN, 'fetch_records_by_schema_by_identifier', ['schema' => 'be_users', 'identifier' => 1])['record'];

        self::assertSame('admin', $record['username']);
    }

    #[Test]
    public function passwordsAreNotSerialized(): void
    {
        $this->importCSVDataSet(__DIR__ . '/Fixtures/fe_users.csv');
        $backendUser = $this->invoke(1, self::ADMIN, 'fetch_records_by_schema_by_identifier', ['schema' => 'be_users', 'identifier' => 1])['record'];
        $frontendUser = $this->invoke(1, self::CONTENT, 'fetch_records_by_schema_by_identifier', ['schema' => 'fe_users', 'identifier' => 1])['record'];

        self::assertArrayNotHasKey('password', $backendUser);
        self::assertSame('jane', $frontendUser['username']);
        self::assertArrayNotHasKey('password', $frontendUser);
    }

    #[Test]
    public function passwordsAreWrittenButNotRead(): void
    {
        $actionRegistry = $this->get(ActionRegistry::class);
        $output = json_encode($actionRegistry->getActionOutputSchema('fetch_records_by_schema_by_identifier'));
        $input = json_encode($actionRegistry->getActionInputSchema('update_records_by_schema_by_identifier'));

        self::assertStringNotContainsString('"format":"password"', $output);
        self::assertStringContainsString('"format":"password"', $input);
    }

    #[Test]
    public function recordOfAdminOnlyTableCanNotBeUpdatedWithoutAdminScope(): void
    {
        $this->expectException(InsufficientScopeError::class);
        $this->invoke(1, self::CONTENT, 'update_records_by_schema_by_identifier', [
            'schema' => 'be_users',
            'identifier' => 2,
            'record' => ['_schema' => 'be_users', 'realName' => 'Changed'],
        ]);
    }

    #[Test]
    public function recordOfAdminOnlyTableIsUpdatedWithAdminScope(): void
    {
        $this->invoke(1, self::ADMIN, 'update_records_by_schema_by_identifier', [
            'schema' => 'be_users',
            'identifier' => 2,
            'record' => ['_schema' => 'be_users', 'realName' => 'Changed'],
        ]);

        self::assertSame('Changed', $this->fetchRow('be_users', 2)['realName']);
    }

    #[Test]
    public function recordOfAdminOnlyTableCanNotBeDeletedWithoutAdminScope(): void
    {
        try {
            $this->invoke(1, self::CONTENT, 'delete_records_by_schema_by_identifier', ['schema' => 'be_users', 'identifier' => 2]);
            self::fail('Expected missing scope to be reported');
        } catch (InsufficientScopeError) {
        }
        self::assertSame(0, $this->fetchRow('be_users', 2)['deleted']);
    }

    #[Test]
    public function recordOfAdminOnlyTableCanNotBeCreatedWithoutAdminScope(): void
    {
        $this->expectException(InsufficientScopeError::class);
        $this->invoke(1, self::CONTENT, 'create_records_by_schema_by_pid', [
            'schema' => 'tx_testirreforeignfield_price',
            'pid' => 1,
            'record' => ['_schema' => 'tx_testirreforeignfield_price', 'title' => 'Price'],
        ]);
    }

    #[Test]
    public function inlineChildOfAdminOnlyTableCanNotBeCreatedWithoutAdminScope(): void
    {
        try {
            $this->invoke(1, self::CONTENT, 'create_records_by_schema_by_pid', [
                'schema' => 'tx_testirreforeignfield_offer',
                'pid' => 1,
                'record' => [
                    '_schema' => 'tx_testirreforeignfield_offer',
                    'title' => 'Offer',
                    'prices' => [
                        ['_schema' => 'tx_testirreforeignfield_price', 'title' => 'Price'],
                    ],
                ],
            ]);
            self::fail('Expected missing scope to be reported');
        } catch (InsufficientScopeError) {
        }
        self::assertSame(3, $this->countRows('tx_testirreforeignfield_offer'));
        self::assertSame(1, $this->countRows('tx_testirreforeignfield_price'));
    }

    #[Test]
    public function inlineChildrenOfAdminOnlyTableAreOmittedWithoutAdminScope(): void
    {
        $withoutScope = $this->invoke(1, self::CONTENT, 'fetch_records_by_schema_by_identifier', ['schema' => 'tx_testirreforeignfield_offer', 'identifier' => 1])['record'];
        $withScope = $this->invoke(1, self::ADMIN, 'fetch_records_by_schema_by_identifier', ['schema' => 'tx_testirreforeignfield_offer', 'identifier' => 1])['record'];

        self::assertSame('Offer 1', $withoutScope['title']);
        self::assertArrayNotHasKey('prices', $withoutScope);
        self::assertSame(['Price 1'], array_column($withScope['prices'], 'title'));
    }

    #[Test]
    public function recordOfAdminOnlyTableIsDeniedForNonAdministratorWithTablePermission(): void
    {
        try {
            $this->invoke(7, self::CONTENT, 'fetch_records_by_schema_by_identifier', ['schema' => 'tx_testirreforeignfield_price', 'identifier' => 1]);
            self::fail('Expected access to be denied');
        } catch (PermissionDeniedError $e) {
            self::assertNotInstanceOf(InsufficientScopeError::class, $e);
        }
    }

    #[Test]
    public function inlineChildrenOfAdminOnlyTableAreOmittedForNonAdministratorWithTablePermission(): void
    {
        $record = $this->invoke(7, self::CONTENT, 'fetch_records_by_schema_by_identifier', ['schema' => 'tx_testirreforeignfield_offer', 'identifier' => 1])['record'];

        self::assertArrayNotHasKey('prices', $record);
    }

    /**
     * @param list<string> $scopes
     */
    private function invoke(int $userUid, array $scopes, string $action, array $arguments): mixed
    {
        $backendUser = $this->setUpBackendUser($userUid);
        $languageService = $this->get(LanguageServiceFactory::class)->createFromUserPreferences($backendUser);
        $GLOBALS['LANG'] = $languageService;
        $scopeServices = [
            'content:read' => ContentReadScope::class,
            'content:write' => ContentWriteScope::class,
            'admin' => AdminScope::class,
        ];
        $result = $this->get(ActionInvoker::class)->invoke(
            $action,
            json_decode(json_encode($arguments)),
            new ActionContext(
                $this->get(Context::class),
                $backendUser,
                $languageService,
                null,
                array_map(fn(string $scope): object => $this->get($scopeServices[$scope]), array_combine($scopes, $scopes)),
            ),
        );
        return json_decode(json_encode($result), true);
    }

    private function fetchRow(string $table, int $uid): array
    {
        $queryBuilder = $this->get(ConnectionPool::class)->getQueryBuilderForTable($table);
        $queryBuilder->getRestrictions()->removeAll();
        return $queryBuilder->select('*')
            ->from($table)
            ->where($queryBuilder->expr()->eq('uid', $uid))
            ->executeQuery()
            ->fetchAssociative();
    }

    private function countRows(string $table): int
    {
        return $this->get(ConnectionPool::class)->getConnectionForTable($table)->count('*', $table, ['deleted' => 0]);
    }
}
