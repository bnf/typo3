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
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\TestingFramework\Core\Functional\FunctionalTestCase;

final class ResourceApiTest extends FunctionalTestCase
{
    use AuthenticatedRequestTrait;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withDatabaseSnapshot(function () {
            $this->importCSVDataSet(__DIR__ . '/Fixtures/Resource/sys_file_storage.csv');
            $this->importCSVDataSet(__DIR__ . '/Fixtures/Resource/resource.csv');
        });
        $fileadmin = $this->instancePath . '/fileadmin';
        GeneralUtility::rmdir($fileadmin, true);
        GeneralUtility::mkdir_deep($fileadmin . '/user_upload/images');
        GeneralUtility::mkdir_deep($fileadmin . '/restricted');
        file_put_contents($fileadmin . '/user_upload/hello.txt', "hello\n");
        file_put_contents($fileadmin . '/user_upload/images/logo.txt', "logo\n");
        file_put_contents($fileadmin . '/restricted/secret.txt', "secret\n");
    }

    #[Test]
    public function fetchFile(): void
    {
        [$status, $data] = $this->request('files/1', 2);

        self::assertSame(200, $status);
        self::assertSame('sys_file', $data['_schema']);
        self::assertSame(1, $data['uid']);
        self::assertSame('1:/user_upload/hello.txt', $data['identifier']);
        self::assertSame('1:/user_upload/', $data['folder']);
        self::assertSame('hello.txt', $data['name']);
        self::assertSame('txt', $data['extension']);
        self::assertSame('text/plain', $data['mimeType']);
        self::assertSame('mimetypes-text-text', $data['iconIdentifier']);
        self::assertSame(6, $data['size']);
        self::assertSame(['_schema' => 'sys_file_metadata', 'uid' => 5], $data['metadata']);
        self::assertStringEndsWith('/fileadmin/user_upload/hello.txt', $data['url']);
        self::assertFalse($data['hasPreview']);
        self::assertSame(['read' => true, 'write' => false, 'rename' => false, 'delete' => false], $data['permissions']);
    }

    #[Test]
    public function fetchFileOutsideOfFileMountIsDenied(): void
    {
        [$status] = $this->request('files/2', 2);

        self::assertSame(403, $status);
    }

    #[Test]
    public function fetchUnknownFileIsNotFound(): void
    {
        [$status] = $this->request('files/999', 1);

        self::assertSame(404, $status);
    }

    #[Test]
    public function fetchFileRequiresContentReadScope(): void
    {
        [$status, $data] = $this->request('files/1', 3);

        self::assertSame(403, $status);
        self::assertStringStartsWith('Missing scope', $data['error']);
    }

    #[Test]
    public function fetchFolderListsSubfoldersBeforeFiles(): void
    {
        [$status, $data] = $this->request('folders', 2, ['identifier' => '1:/user_upload/']);

        self::assertSame(200, $status);
        self::assertSame('sys_folder', $data['folder']['_schema']);
        self::assertSame('1:/user_upload/', $data['folder']['identifier']);
        self::assertSame('user_upload', $data['folder']['name']);
        self::assertSame(
            [['sys_folder', '1:/user_upload/images/'], ['sys_file', '1:/user_upload/hello.txt']],
            array_map(static fn(array $item): array => [$item['_schema'], $item['identifier']], $data['items'])
        );
        self::assertNull($data['next']);
    }

    #[Test]
    public function fetchFolderIsPaginated(): void
    {
        [, $page1] = $this->request('folders', 2, ['identifier' => '1:/user_upload/', 'limit' => '1']);
        [, $page2] = $this->request('folders', 2, ['identifier' => '1:/user_upload/', 'limit' => '1', 'cursor' => $page1['next']]);

        self::assertSame(['1:/user_upload/images/'], array_column($page1['items'], 'identifier'));
        self::assertSame(['1:/user_upload/hello.txt'], array_column($page2['items'], 'identifier'));
        self::assertNull($page2['next']);
    }

    #[Test]
    public function fetchFolderFilteredByName(): void
    {
        [, $existing] = $this->request('folders', 2, ['identifier' => '1:/user_upload/', 'name' => 'hello.txt']);
        [, $missing] = $this->request('folders', 2, ['identifier' => '1:/user_upload/', 'name' => 'missing.txt']);

        self::assertSame(['1:/user_upload/hello.txt'], array_column($existing['items'], 'identifier'));
        self::assertSame([], $missing['items']);
    }

    #[Test]
    public function fetchFolderOutsideOfFileMountIsDenied(): void
    {
        [$status] = $this->request('folders', 2, ['identifier' => '1:/restricted/']);

        self::assertSame(403, $status);
    }

    #[Test]
    public function fetchUnknownFolderIsNotFound(): void
    {
        [$status] = $this->request('folders', 1, ['identifier' => '1:/unknown/']);

        self::assertSame(404, $status);
    }

    #[Test]
    public function fetchStoragesProvidesFileMountsOfUser(): void
    {
        [$status, $data] = $this->request('storages', 2);

        self::assertSame(200, $status);
        self::assertCount(1, $data['items']);
        self::assertSame(1, $data['items'][0]['uid']);
        self::assertSame('fileadmin', $data['items'][0]['name']);
        self::assertSame(
            [['Uploads', '1:/user_upload/']],
            array_map(static fn(array $mount): array => [$mount['title'], $mount['folder']['identifier']], $data['items'][0]['mounts'])
        );
    }

    #[Test]
    public function fetchStoragesProvidesStorageRootForAdmin(): void
    {
        [, $data] = $this->request('storages', 1);

        self::assertSame(['1:/'], array_map(static fn(array $mount): string => $mount['folder']['identifier'], $data['items'][0]['mounts']));
    }

    /**
     * @param array<string, string> $query
     * @return array{int, array<string, mixed>}
     */
    private function request(string $path, int $userUid, array $query = []): array
    {
        $url = 'https://typo3-testing.local/typo3/api/' . $path . ($query !== [] ? '?' . http_build_query($query) : '');
        $request = $this->setUpAuthenticatedRequest($url, $userUid)->withQueryParams($query);
        $response = $this->get(Application::class)->handle($request);
        return [$response->getStatusCode(), $this->decode($response)];
    }

    /**
     * @return array<string, mixed>
     */
    private function decode(ResponseInterface $response): array
    {
        return json_decode((string)$response->getBody(), true) ?? [];
    }
}
