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

final class RecordApiTest extends FunctionalTestCase
{
    use AuthenticatedRequestTrait;

    protected array $coreExtensionsToLoad = ['seo'];

    protected function setUp(): void
    {
        parent::setUp();
        $this->withDatabaseSnapshot(function () {
            $this->importCSVDataSet(__DIR__ . '/../Fixtures/be_users.csv');
            $this->importCSVDataSet(__DIR__ . '/Fixtures/be_users_editor.csv');
            $this->importCSVDataSet(__DIR__ . '/../../../../core/Tests/Functional/Fixtures/pages.csv');
        });
    }

    #[Test]
    public function createRecordReportsValidationErrorOfRequestedSchemaOnly(): void
    {
        $response = $this->createRecord(1, 'tt_content', 1, [
            '_schema' => 'tt_content',
            'CType' => 'text',
            'header' => 'Header',
            'unknown' => 'value',
        ]);

        $error = json_decode((string)$response->getBody())->error;
        self::assertSame(400, $response->getStatusCode());
        self::assertStringContainsString('[] The property unknown is not defined', $error);
        self::assertStringNotContainsString('[/_schema]', $error);
    }

    #[Test]
    public function createRecordRejectsTableNotModifiableByUser(): void
    {
        $response = $this->createRecord(3, 'pages', 1, [
            '_schema' => 'pages',
            'doktype' => 1,
            'title' => 'Page',
        ]);

        self::assertSame(403, $response->getStatusCode());
        self::assertSame(
            'No permission to modify table pages, field pages.doktype',
            json_decode((string)$response->getBody())->error
        );
    }

    #[Test]
    public function fetchPage(): void
    {
        $request = $this->setUpAuthenticatedRequest('https://typo3-testing.local/typo3/api/records/pages/1', 1);
        $response = $this->get(Application::class)->handle($request);

        $body = (string)$response->getBody();
        self::assertSame(200, $response->getStatusCode(), $body);
        self::assertSame('Root 1', json_decode($body, true)['record']['title'] ?? null);
    }

    #[Test]
    public function fetchPageWithDecimalSelectValue(): void
    {
        $this->get(ConnectionPool::class)->getConnectionForTable('pages')
            ->update('pages', ['sitemap_priority' => 0.5], ['uid' => 1]);

        $request = $this->setUpAuthenticatedRequest('https://typo3-testing.local/typo3/api/records/pages/1', 1);
        $response = $this->get(Application::class)->handle($request);

        $body = (string)$response->getBody();
        self::assertSame(200, $response->getStatusCode(), $body);
        self::assertEquals(0.5, json_decode($body, true)['record']['sitemap_priority'] ?? null);
    }

    private function createRecord(int $userUid, string $schema, int $pid, array $record): ResponseInterface
    {
        $request = $this->setUpAuthenticatedRequest('https://typo3-testing.local/typo3/api/records/' . $schema . '/' . $pid, $userUid, 'POST')
            ->withHeader('Content-Type', 'application/json')
            ->withBody((new StreamFactory())->createStream(json_encode(['record' => $record])));
        return $this->get(Application::class)->handle($request);
    }
}
