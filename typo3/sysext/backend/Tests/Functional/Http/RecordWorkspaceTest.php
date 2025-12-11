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

namespace TYPO3\CMS\Backend\Tests\Functional\Http;

use PHPUnit\Framework\Attributes\Test;
use Psr\Http\Message\ResponseInterface;
use TYPO3\CMS\Backend\Http\Application;
use TYPO3\CMS\Core\Database\ConnectionPool;
use TYPO3\CMS\Core\Http\StreamFactory;
use TYPO3\TestingFramework\Core\Functional\FunctionalTestCase;

/**
 * Record actions of a user whose current backend workspace (`be_users.workspace_id`)
 * is not live: record 102 has a version in workspace 1, record 103 is deleted in
 * workspace 1.
 */
final class RecordWorkspaceTest extends FunctionalTestCase
{
    use AuthenticatedRequestTrait;

    protected array $coreExtensionsToLoad = ['workspaces'];

    protected function setUp(): void
    {
        parent::setUp();
        $this->importCSVDataSet(__DIR__ . '/../Fixtures/be_users.csv');
        $this->importCSVDataSet(__DIR__ . '/../../../../core/Tests/Functional/Fixtures/pages.csv');
        $this->importCSVDataSet(__DIR__ . '/Fixtures/tt_content_workspace.csv');
        $this->get(ConnectionPool::class)->getConnectionForTable('be_users')
            ->update('be_users', ['workspace_id' => 1], ['uid' => 1]);
    }

    #[Test]
    public function fetchRecordOfUserInWorkspace(): void
    {
        $response = $this->request('GET', 'records/tt_content/102');

        self::assertSame([
            'status' => 200,
            'header' => 'Workspace header',
        ], [
            'status' => $response->getStatusCode(),
            'header' => json_decode((string)$response->getBody(), true)['record']['header'] ?? null,
        ]);
    }

    #[Test]
    public function fetchVersionRecordByVersionUidOfUserInWorkspace(): void
    {
        $response = $this->request('GET', 'records/tt_content/201');

        self::assertSame(404, $response->getStatusCode());
    }

    #[Test]
    public function fetchRecordDeletedInWorkspaceOfUserInWorkspace(): void
    {
        $response = $this->request('GET', 'records/tt_content/103');

        self::assertSame(404, $response->getStatusCode());
    }

    #[Test]
    public function fetchVersionRecordOfUserInLive(): void
    {
        $this->get(ConnectionPool::class)->getConnectionForTable('be_users')
            ->update('be_users', ['workspace_id' => 0], ['uid' => 1]);

        $response = $this->request('GET', 'records/tt_content/201');

        self::assertSame(404, $response->getStatusCode());
    }

    #[Test]
    public function updateRecordOfUserInWorkspace(): void
    {
        $response = $this->request('PATCH', 'records/tt_content/101', [
            'record' => ['_schema' => 'tt_content', 'header' => 'Changed header'],
        ]);

        self::assertSame([
            'status' => 200,
            'response header' => 'Changed header',
            'live header' => 'Live header',
            'workspace versions' => [['header' => 'Changed header', 't3ver_oid' => 101]],
        ], [
            'status' => $response->getStatusCode(),
            'response header' => json_decode((string)$response->getBody(), true)['record']['header'] ?? null,
            'live header' => $this->fetchRows('uid = 101')[0]['header'],
            'workspace versions' => $this->fetchRows('t3ver_wsid = 1 AND uid > 202', ['header', 't3ver_oid']),
        ]);
    }

    #[Test]
    public function createRecordOfUserInWorkspace(): void
    {
        $response = $this->request('POST', 'records/tt_content/1', [
            'record' => ['_schema' => 'tt_content', 'CType' => 'text', 'header' => 'New header'],
        ]);

        self::assertSame([
            'status' => 200,
            'response header' => 'New header',
            'new rows' => [['header' => 'New header', 't3ver_wsid' => 1]],
        ], [
            'status' => $response->getStatusCode(),
            'response header' => json_decode((string)$response->getBody(), true)['record']['header'] ?? null,
            'new rows' => $this->fetchRows('uid > 202', ['header', 't3ver_wsid']),
        ]);
    }

    #[Test]
    public function listRecordsOfUserInWorkspace(): void
    {
        $response = $this->request('GET', 'records/tt_content', null, ['search' => 'header']);

        self::assertSame(200, $response->getStatusCode());
        self::assertSame(
            ['items' => [
                ['uid' => 101, 'pid' => 1, 'label' => 'Live header', 'type' => 'text', 'hidden' => false, 'language' => 0],
                ['uid' => 102, 'pid' => 1, 'label' => 'Workspace header', 'type' => 'text', 'hidden' => false, 'language' => 0],
            ], 'next' => null],
            json_decode((string)$response->getBody(), true)
        );
    }

    #[Test]
    public function listRecordsOfUserInLive(): void
    {
        $this->get(ConnectionPool::class)->getConnectionForTable('be_users')
            ->update('be_users', ['workspace_id' => 0], ['uid' => 1]);

        $response = $this->request('GET', 'records/tt_content', null, ['search' => 'header']);

        self::assertSame(200, $response->getStatusCode());
        self::assertSame(
            ['items' => [
                ['uid' => 101, 'pid' => 1, 'label' => 'Live header', 'type' => 'text', 'hidden' => false, 'language' => 0],
                ['uid' => 102, 'pid' => 1, 'label' => 'Live header', 'type' => 'text', 'hidden' => false, 'language' => 0],
                ['uid' => 103, 'pid' => 1, 'label' => 'Live header', 'type' => 'text', 'hidden' => false, 'language' => 0],
            ], 'next' => null],
            json_decode((string)$response->getBody(), true)
        );
    }

    #[Test]
    public function listRecordsOfUserInWorkspaceSkipsRecordsDeletedInWorkspace(): void
    {
        $firstPage = json_decode((string)$this->request('GET', 'records/tt_content', null, ['search' => 'header', 'limit' => '1'])->getBody(), true);
        $secondPage = json_decode((string)$this->request('GET', 'records/tt_content', null, ['search' => 'header', 'limit' => '2', 'cursor' => $firstPage['next']])->getBody(), true);

        self::assertSame([101], array_column($firstPage['items'], 'uid'));
        self::assertSame(
            ['items' => [['uid' => 102, 'pid' => 1, 'label' => 'Workspace header', 'type' => 'text', 'hidden' => false, 'language' => 0]], 'next' => null],
            $secondPage
        );
    }

    #[Test]
    public function deleteRecordOfUserInWorkspace(): void
    {
        $response = $this->request('DELETE', 'records/tt_content/101');

        self::assertSame([
            'status' => 204,
            'live deleted' => 0,
            'delete placeholders' => [['t3ver_oid' => 101, 't3ver_state' => 2]],
        ], [
            'status' => $response->getStatusCode(),
            'live deleted' => $this->fetchRows('uid = 101')[0]['deleted'],
            'delete placeholders' => $this->fetchRows('t3ver_wsid = 1 AND uid > 202', ['t3ver_oid', 't3ver_state']),
        ]);
    }

    #[Test]
    public function deleteVersionRecordByVersionUidOfUserInWorkspace(): void
    {
        $response = $this->request('DELETE', 'records/tt_content/201');

        self::assertSame(404, $response->getStatusCode());
    }

    #[Test]
    public function deleteRecordDeletedInWorkspaceOfUserInWorkspace(): void
    {
        $response = $this->request('DELETE', 'records/tt_content/103');

        self::assertSame(404, $response->getStatusCode());
    }

    #[Test]
    public function fetchRecordInLiveOfUserInWorkspace(): void
    {
        $response = $this->request('GET', 'records/tt_content/102', null, ['workspace' => '0']);

        self::assertSame([
            'status' => 200,
            'header' => 'Live header',
        ], [
            'status' => $response->getStatusCode(),
            'header' => json_decode((string)$response->getBody(), true)['record']['header'] ?? null,
        ]);
    }

    #[Test]
    public function fetchRecordInWorkspaceOfUserInLive(): void
    {
        $this->get(ConnectionPool::class)->getConnectionForTable('be_users')
            ->update('be_users', ['workspace_id' => 0], ['uid' => 1]);

        $response = $this->request('GET', 'records/tt_content/102', null, ['workspace' => '1']);

        self::assertSame([
            'status' => 200,
            'header' => 'Workspace header',
        ], [
            'status' => $response->getStatusCode(),
            'header' => json_decode((string)$response->getBody(), true)['record']['header'] ?? null,
        ]);
    }

    #[Test]
    public function fetchRecordInUnavailableWorkspace(): void
    {
        $response = $this->request('GET', 'records/tt_content/102', null, ['workspace' => '99']);

        self::assertSame(403, $response->getStatusCode());
    }

    #[Test]
    public function listRecordsInLiveOfUserInWorkspace(): void
    {
        $response = $this->request('GET', 'records/tt_content', null, ['search' => 'header', 'workspace' => '0']);

        self::assertSame(200, $response->getStatusCode());
        self::assertSame(
            ['items' => [
                ['uid' => 101, 'pid' => 1, 'label' => 'Live header', 'type' => 'text', 'hidden' => false, 'language' => 0],
                ['uid' => 102, 'pid' => 1, 'label' => 'Live header', 'type' => 'text', 'hidden' => false, 'language' => 0],
                ['uid' => 103, 'pid' => 1, 'label' => 'Live header', 'type' => 'text', 'hidden' => false, 'language' => 0],
            ], 'next' => null],
            json_decode((string)$response->getBody(), true)
        );
    }

    #[Test]
    public function updateRecordInLiveOfUserInWorkspace(): void
    {
        $response = $this->request('PATCH', 'records/tt_content/101', [
            'record' => ['_schema' => 'tt_content', 'header' => 'Changed header'],
        ], ['workspace' => '0']);

        self::assertSame([
            'status' => 200,
            'response header' => 'Changed header',
            'live header' => 'Changed header',
            'workspace versions' => [],
        ], [
            'status' => $response->getStatusCode(),
            'response header' => json_decode((string)$response->getBody(), true)['record']['header'] ?? null,
            'live header' => $this->fetchRows('uid = 101')[0]['header'],
            'workspace versions' => $this->fetchRows('t3ver_wsid = 1 AND uid > 202', ['header', 't3ver_oid']),
        ]);
    }

    #[Test]
    public function createRecordInWorkspaceOfUserInLive(): void
    {
        $this->get(ConnectionPool::class)->getConnectionForTable('be_users')
            ->update('be_users', ['workspace_id' => 0], ['uid' => 1]);

        $response = $this->request('POST', 'records/tt_content/1', [
            'record' => ['_schema' => 'tt_content', 'CType' => 'text', 'header' => 'New header'],
        ], ['workspace' => '1']);

        self::assertSame([
            'status' => 200,
            'response header' => 'New header',
            'new rows' => [['header' => 'New header', 't3ver_wsid' => 1]],
        ], [
            'status' => $response->getStatusCode(),
            'response header' => json_decode((string)$response->getBody(), true)['record']['header'] ?? null,
            'new rows' => $this->fetchRows('uid > 202', ['header', 't3ver_wsid']),
        ]);
    }

    #[Test]
    public function deleteRecordInLiveOfUserInWorkspace(): void
    {
        $response = $this->request('DELETE', 'records/tt_content/101', null, ['workspace' => '0']);

        self::assertSame([
            'status' => 204,
            'live deleted' => 1,
            'delete placeholders' => [],
        ], [
            'status' => $response->getStatusCode(),
            'live deleted' => $this->fetchRows('uid = 101')[0]['deleted'],
            'delete placeholders' => $this->fetchRows('t3ver_wsid = 1 AND uid > 202', ['t3ver_oid', 't3ver_state']),
        ]);
    }

    private function request(string $method, string $path, ?array $body = null, array $query = []): ResponseInterface
    {
        $request = $this->setUpAuthenticatedRequest('https://typo3-testing.local/typo3/api/' . $path, 1, $method)
            ->withQueryParams($query);
        if ($body !== null) {
            $request = $request
                ->withHeader('Content-Type', 'application/json')
                ->withBody(new StreamFactory()->createStream(json_encode($body)));
        }
        return $this->get(Application::class)->handle($request);
    }

    private function fetchRows(string $where, array $fields = ['*']): array
    {
        $queryBuilder = $this->get(ConnectionPool::class)->getQueryBuilderForTable('tt_content');
        $queryBuilder->getRestrictions()->removeAll();
        return $queryBuilder->select(...$fields)
            ->from('tt_content')
            ->where($where)
            ->orderBy('uid')
            ->executeQuery()
            ->fetchAllAssociative();
    }
}
