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
use TYPO3\CMS\Backend\Http\Application;
use TYPO3\CMS\Core\Database\ConnectionPool;
use TYPO3\CMS\Core\Http\StreamFactory;
use TYPO3\CMS\Core\Resource\ResourceFactory;
use TYPO3\CMS\Core\SysLog\Action\File as SystemLogFileAction;
use TYPO3\CMS\Core\SysLog\Type as SystemLogType;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\TestingFramework\Core\Functional\FunctionalTestCase;

final class ResourceWriteApiTest extends FunctionalTestCase
{
    use AuthenticatedRequestTrait;

    protected array $coreExtensionsToLoad = ['filelist'];

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
        GeneralUtility::mkdir_deep($fileadmin . '/user_upload/archive');
        GeneralUtility::mkdir_deep($fileadmin . '/restricted');
        file_put_contents($fileadmin . '/user_upload/hello.txt', "hello\n");
        file_put_contents($fileadmin . '/user_upload/other.txt', "other\n");
        file_put_contents($fileadmin . '/user_upload/images/logo.txt', "logo\n");
        file_put_contents($fileadmin . '/restricted/secret.txt', "secret\n");
    }

    #[Test]
    public function renameFile(): void
    {
        [$status, $data] = $this->send('PATCH', 'files/1', 4, ['name' => 'renamed.txt']);

        self::assertSame(200, $status, json_encode($data));
        self::assertSame(1, $data['uid']);
        self::assertSame('renamed.txt', $data['name']);
        self::assertSame('1:/user_upload/renamed.txt', $data['identifier']);
        self::assertFileExists($this->instancePath . '/fileadmin/user_upload/renamed.txt');
        self::assertFileDoesNotExist($this->instancePath . '/fileadmin/user_upload/hello.txt');
        self::assertSame(['File renamed from "{identifier}" to "{destination}"'], $this->getLogMessages(SystemLogFileAction::RENAME));
    }

    #[Test]
    public function moveFile(): void
    {
        [$status, $data] = $this->send('PATCH', 'files/1', 4, ['folder' => '1:/user_upload/images/']);

        self::assertSame(200, $status, json_encode($data));
        self::assertSame(1, $data['uid']);
        self::assertSame('1:/user_upload/images/hello.txt', $data['identifier']);
        self::assertSame('1:/user_upload/images/', $data['folder']);
        self::assertFileExists($this->instancePath . '/fileadmin/user_upload/images/hello.txt');
        self::assertSame(['File "{identifier}" moved to "{destination}"'], $this->getLogMessages(SystemLogFileAction::MOVE));
    }

    #[Test]
    public function moveAndRenameFile(): void
    {
        [$status, $data] = $this->send('PATCH', 'files/1', 4, ['folder' => '1:/user_upload/images/', 'name' => 'renamed.txt']);

        self::assertSame(200, $status, json_encode($data));
        self::assertSame('1:/user_upload/images/renamed.txt', $data['identifier']);
    }

    #[Test]
    public function renameFileToExistingNameIsConflict(): void
    {
        [$status] = $this->send('PATCH', 'files/1', 4, ['name' => 'other.txt']);

        self::assertSame(409, $status);
        self::assertFileExists($this->instancePath . '/fileadmin/user_upload/hello.txt');
        self::assertSame("other\n", file_get_contents($this->instancePath . '/fileadmin/user_upload/other.txt'));
    }

    #[Test]
    public function renameFileToExistingNameWithConflictModeRename(): void
    {
        [$status, $data] = $this->send('PATCH', 'files/1', 4, ['name' => 'other.txt', 'conflictMode' => 'rename']);

        self::assertSame(200, $status, json_encode($data));
        self::assertSame('other_01.txt', $data['name']);
    }

    #[Test]
    public function updateFileWithoutChangesIsRejected(): void
    {
        [$status] = $this->send('PATCH', 'files/1', 4, []);

        self::assertSame(400, $status);
    }

    #[Test]
    public function renameFileRequiresMediaModule(): void
    {
        [$status] = $this->send('PATCH', 'files/1', 5, ['name' => 'renamed.txt']);

        self::assertSame(403, $status);
        self::assertFileExists($this->instancePath . '/fileadmin/user_upload/hello.txt');
    }

    #[Test]
    public function renameFileOutsideOfFileMountIsDenied(): void
    {
        [$status] = $this->send('PATCH', 'files/2', 4, ['name' => 'renamed.txt']);

        self::assertSame(403, $status);
        self::assertFileExists($this->instancePath . '/fileadmin/restricted/secret.txt');
    }

    #[Test]
    public function moveFileOutsideOfFileMountIsDenied(): void
    {
        [$status] = $this->send('PATCH', 'files/1', 4, ['folder' => '1:/restricted/']);

        self::assertSame(403, $status);
        self::assertFileExists($this->instancePath . '/fileadmin/user_upload/hello.txt');
    }

    #[Test]
    public function renameFolder(): void
    {
        [$status, $data] = $this->send('PATCH', 'folders', 4, ['name' => 'pictures'], ['identifier' => '1:/user_upload/images/']);

        self::assertSame(200, $status, json_encode($data));
        self::assertSame('sys_folder', $data['_schema']);
        self::assertSame('1:/user_upload/pictures/', $data['identifier']);
        self::assertFileExists($this->instancePath . '/fileadmin/user_upload/pictures/logo.txt');
        self::assertSame(['Directory renamed from "{identifier}" to "{destination}"'], $this->getLogMessages(SystemLogFileAction::RENAME));
    }

    #[Test]
    public function moveFolder(): void
    {
        [$status, $data] = $this->send('PATCH', 'folders', 4, ['parent' => '1:/user_upload/archive/'], ['identifier' => '1:/user_upload/images/']);

        self::assertSame(200, $status, json_encode($data));
        self::assertSame('1:/user_upload/archive/images/', $data['identifier']);
        self::assertSame('1:/user_upload/archive/', $data['parent']);
        self::assertFileExists($this->instancePath . '/fileadmin/user_upload/archive/images/logo.txt');
        self::assertSame(['Directory "{identifier}" moved to "{destination}"'], $this->getLogMessages(SystemLogFileAction::MOVE));
    }

    #[Test]
    public function moveFolderIntoItselfIsRejected(): void
    {
        [$status] = $this->send('PATCH', 'folders', 4, ['parent' => '1:/user_upload/images/'], ['identifier' => '1:/user_upload/images/']);

        self::assertSame(400, $status);
    }

    #[Test]
    public function renameFolderToExistingNameIsConflict(): void
    {
        [$status] = $this->send('PATCH', 'folders', 4, ['name' => 'archive'], ['identifier' => '1:/user_upload/images/']);

        self::assertSame(409, $status);
        self::assertFileExists($this->instancePath . '/fileadmin/user_upload/images/logo.txt');
    }

    #[Test]
    public function renameFolderRequiresMediaModule(): void
    {
        [$status] = $this->send('PATCH', 'folders', 5, ['name' => 'pictures'], ['identifier' => '1:/user_upload/images/']);

        self::assertSame(403, $status);
        self::assertDirectoryExists($this->instancePath . '/fileadmin/user_upload/images');
    }

    #[Test]
    public function createFolder(): void
    {
        [$status, $data] = $this->send('POST', 'folders', 4, ['type' => 'folder', 'name' => 'new'], ['identifier' => '1:/user_upload/']);

        self::assertSame(200, $status, json_encode($data));
        self::assertSame('sys_folder', $data['_schema']);
        self::assertSame('1:/user_upload/new/', $data['identifier']);
        self::assertDirectoryExists($this->instancePath . '/fileadmin/user_upload/new');
        self::assertSame(['Directory "{identifier}" created in "{destination}"'], $this->getLogMessages(SystemLogFileAction::NEW_FOLDER));
    }

    #[Test]
    public function createExistingFolderIsConflict(): void
    {
        [$status] = $this->send('POST', 'folders', 4, ['type' => 'folder', 'name' => 'images'], ['identifier' => '1:/user_upload/']);

        self::assertSame(409, $status);
    }

    #[Test]
    public function createFileWithContent(): void
    {
        [$status, $data] = $this->send('POST', 'folders', 4, ['type' => 'file', 'name' => 'new.txt', 'content' => 'new content'], ['identifier' => '1:/user_upload/']);

        self::assertSame(200, $status, json_encode($data));
        self::assertSame('sys_file', $data['_schema']);
        self::assertSame('1:/user_upload/new.txt', $data['identifier']);
        self::assertSame('new content', file_get_contents($this->instancePath . '/fileadmin/user_upload/new.txt'));
        self::assertSame(['File "{identifier}" created'], $this->getLogMessages(SystemLogFileAction::NEW_FILE));
    }

    #[Test]
    public function createExistingFileIsConflict(): void
    {
        [$status] = $this->send('POST', 'folders', 4, ['type' => 'file', 'name' => 'hello.txt'], ['identifier' => '1:/user_upload/']);

        self::assertSame(409, $status);
        self::assertSame("hello\n", file_get_contents($this->instancePath . '/fileadmin/user_upload/hello.txt'));
    }

    #[Test]
    public function copyFile(): void
    {
        [$status, $data] = $this->send('POST', 'folders', 4, ['copyFrom' => ['file' => 1]], ['identifier' => '1:/user_upload/images/']);

        self::assertSame(200, $status, json_encode($data));
        self::assertSame('1:/user_upload/images/hello.txt', $data['identifier']);
        self::assertNotSame(1, $data['uid']);
        self::assertFileExists($this->instancePath . '/fileadmin/user_upload/hello.txt');
        self::assertFileExists($this->instancePath . '/fileadmin/user_upload/images/hello.txt');
        self::assertSame(['File "{identifier}" copied to "{destination}"'], $this->getLogMessages(SystemLogFileAction::COPY));
    }

    #[Test]
    public function copyFileWithName(): void
    {
        [$status, $data] = $this->send('POST', 'folders', 4, ['copyFrom' => ['file' => 1], 'name' => 'copy.txt'], ['identifier' => '1:/user_upload/']);

        self::assertSame(200, $status, json_encode($data));
        self::assertSame('1:/user_upload/copy.txt', $data['identifier']);
    }

    #[Test]
    public function copyFileToExistingNameIsConflict(): void
    {
        [$status] = $this->send('POST', 'folders', 4, ['copyFrom' => ['file' => 1]], ['identifier' => '1:/user_upload/']);

        self::assertSame(409, $status);
    }

    #[Test]
    public function copyFileToExistingNameWithConflictModeRename(): void
    {
        [$status, $data] = $this->send('POST', 'folders', 4, ['copyFrom' => ['file' => 1], 'conflictMode' => 'rename'], ['identifier' => '1:/user_upload/']);

        self::assertSame(200, $status, json_encode($data));
        self::assertSame('hello_01.txt', $data['name']);
    }

    #[Test]
    public function copyFolder(): void
    {
        [$status, $data] = $this->send('POST', 'folders', 4, ['copyFrom' => ['folder' => '1:/user_upload/images/']], ['identifier' => '1:/user_upload/archive/']);

        self::assertSame(200, $status, json_encode($data));
        self::assertSame('1:/user_upload/archive/images/', $data['identifier']);
        self::assertFileExists($this->instancePath . '/fileadmin/user_upload/archive/images/logo.txt');
        self::assertFileExists($this->instancePath . '/fileadmin/user_upload/images/logo.txt');
        self::assertSame(['Directory "{identifier}" copied to "{destination}"'], $this->getLogMessages(SystemLogFileAction::COPY));
    }

    #[Test]
    public function createWithoutTypeOrCopySourceIsRejected(): void
    {
        [$status] = $this->send('POST', 'folders', 4, ['name' => 'new'], ['identifier' => '1:/user_upload/']);

        self::assertSame(400, $status);
    }

    #[Test]
    public function createFolderRequiresMediaModule(): void
    {
        [$status] = $this->send('POST', 'folders', 5, ['type' => 'folder', 'name' => 'new'], ['identifier' => '1:/user_upload/']);

        self::assertSame(403, $status);
        self::assertDirectoryDoesNotExist($this->instancePath . '/fileadmin/user_upload/new');
    }

    #[Test]
    public function createFolderOutsideOfFileMountIsDenied(): void
    {
        [$status] = $this->send('POST', 'folders', 4, ['type' => 'folder', 'name' => 'new'], ['identifier' => '1:/restricted/']);

        self::assertSame(403, $status);
        self::assertDirectoryDoesNotExist($this->instancePath . '/fileadmin/restricted/new');
    }

    #[Test]
    public function deleteFile(): void
    {
        [$status] = $this->send('DELETE', 'files/1', 4, null);

        self::assertSame(204, $status);
        self::assertFileDoesNotExist($this->instancePath . '/fileadmin/user_upload/hello.txt');
        self::assertSame(['File "{identifier}" deleted'], $this->getLogMessages(SystemLogFileAction::DELETE));
    }

    #[Test]
    public function deleteFileInUseIsConflict(): void
    {
        $this->addReference(1);

        [$status, $data] = $this->send('DELETE', 'files/1', 4, null);

        self::assertSame(409, $status);
        self::assertStringContainsString('[record:tt_content:7]', $data['error']);
        self::assertFileExists($this->instancePath . '/fileadmin/user_upload/hello.txt');
    }

    #[Test]
    public function deleteFileRequiresMediaModule(): void
    {
        [$status] = $this->send('DELETE', 'files/1', 5, null);

        self::assertSame(403, $status);
        self::assertFileExists($this->instancePath . '/fileadmin/user_upload/hello.txt');
    }

    #[Test]
    public function deleteFolderRecursively(): void
    {
        [$status] = $this->send('DELETE', 'folders', 4, null, ['identifier' => '1:/user_upload/images/', 'recursive' => 'true']);

        self::assertSame(204, $status);
        self::assertDirectoryDoesNotExist($this->instancePath . '/fileadmin/user_upload/images');
        self::assertSame(['Directory "{identifier}" deleted'], $this->getLogMessages(SystemLogFileAction::DELETE));
    }

    #[Test]
    public function deleteEmptyFolder(): void
    {
        [$status] = $this->send('DELETE', 'folders', 4, null, ['identifier' => '1:/user_upload/archive/']);

        self::assertSame(204, $status);
        self::assertDirectoryDoesNotExist($this->instancePath . '/fileadmin/user_upload/archive');
    }

    #[Test]
    public function deleteFolderWithContentRequiresRecursive(): void
    {
        [$status] = $this->send('DELETE', 'folders', 4, null, ['identifier' => '1:/user_upload/images/']);

        self::assertSame(409, $status);
        self::assertFileExists($this->instancePath . '/fileadmin/user_upload/images/logo.txt');
    }

    #[Test]
    public function deleteFolderWithFileInUseIsConflict(): void
    {
        $file = $this->get(ResourceFactory::class)->getFileObjectFromCombinedIdentifier('1:/user_upload/images/logo.txt');
        $this->addReference($file->getUid());

        [$status] = $this->send('DELETE', 'folders', 4, null, ['identifier' => '1:/user_upload/images/', 'recursive' => 'true']);

        self::assertSame(409, $status);
        self::assertFileExists($this->instancePath . '/fileadmin/user_upload/images/logo.txt');
    }

    #[Test]
    public function deleteFolderOutsideOfFileMountIsDenied(): void
    {
        [$status] = $this->send('DELETE', 'folders', 4, null, ['identifier' => '1:/restricted/', 'recursive' => 'true']);

        self::assertSame(403, $status);
        self::assertFileExists($this->instancePath . '/fileadmin/restricted/secret.txt');
    }

    #[Test]
    public function uploadFile(): void
    {
        [$status, $data] = $this->sendContent('POST', 'files', 4, 'uploaded', ['folder' => '1:/user_upload/', 'name' => 'upload.txt']);

        self::assertSame(200, $status, json_encode($data));
        self::assertSame('1:/user_upload/upload.txt', $data['identifier']);
        self::assertSame('uploaded', file_get_contents($this->instancePath . '/fileadmin/user_upload/upload.txt'));
        self::assertSame(['File "{identifier}" uploaded to "{destination}"'], $this->getLogMessages(SystemLogFileAction::UPLOAD));
    }

    #[Test]
    public function uploadFileWithExistingNameIsConflict(): void
    {
        [$status] = $this->sendContent('POST', 'files', 4, 'uploaded', ['folder' => '1:/user_upload/', 'name' => 'hello.txt']);

        self::assertSame(409, $status);
        self::assertSame("hello\n", file_get_contents($this->instancePath . '/fileadmin/user_upload/hello.txt'));
    }

    #[Test]
    public function uploadFileWithExistingNameAndConflictModeReplace(): void
    {
        [$status, $data] = $this->sendContent('POST', 'files', 4, 'uploaded', ['folder' => '1:/user_upload/', 'name' => 'hello.txt', 'conflictMode' => 'replace']);

        self::assertSame(200, $status, json_encode($data));
        self::assertSame(1, $data['uid']);
        self::assertSame('uploaded', file_get_contents($this->instancePath . '/fileadmin/user_upload/hello.txt'));
    }

    #[Test]
    public function uploadFileRequiresMediaModule(): void
    {
        [$status] = $this->sendContent('POST', 'files', 5, 'uploaded', ['folder' => '1:/user_upload/', 'name' => 'upload.txt']);

        self::assertSame(403, $status);
        self::assertFileDoesNotExist($this->instancePath . '/fileadmin/user_upload/upload.txt');
    }

    #[Test]
    public function uploadFileOutsideOfFileMountIsDenied(): void
    {
        [$status] = $this->sendContent('POST', 'files', 4, 'uploaded', ['folder' => '1:/restricted/', 'name' => 'upload.txt']);

        self::assertSame(403, $status);
        self::assertFileDoesNotExist($this->instancePath . '/fileadmin/restricted/upload.txt');
    }

    #[Test]
    public function replaceFile(): void
    {
        [$status, $data] = $this->sendContent('PUT', 'files/1', 4, 'replaced');

        self::assertSame(200, $status, json_encode($data));
        self::assertSame(1, $data['uid']);
        self::assertSame('hello.txt', $data['name']);
        self::assertSame('replaced', file_get_contents($this->instancePath . '/fileadmin/user_upload/hello.txt'));
        self::assertSame(['File "{identifier}" replaced with "{destination}"'], $this->getLogMessages(SystemLogFileAction::UPLOAD));
    }

    #[Test]
    public function replaceFileWithName(): void
    {
        [$status, $data] = $this->sendContent('PUT', 'files/1', 4, 'replaced', ['name' => 'replaced.txt']);

        self::assertSame(200, $status, json_encode($data));
        self::assertSame(1, $data['uid']);
        self::assertSame('1:/user_upload/replaced.txt', $data['identifier']);
        self::assertSame('replaced', file_get_contents($this->instancePath . '/fileadmin/user_upload/replaced.txt'));
        self::assertFileDoesNotExist($this->instancePath . '/fileadmin/user_upload/hello.txt');
    }

    #[Test]
    public function replaceFileRequiresMediaModule(): void
    {
        [$status] = $this->sendContent('PUT', 'files/1', 5, 'replaced');

        self::assertSame(403, $status);
        self::assertSame("hello\n", file_get_contents($this->instancePath . '/fileadmin/user_upload/hello.txt'));
    }

    private function addReference(int $fileUid): void
    {
        $this->get(ConnectionPool::class)->getConnectionForTable('sys_refindex')->insert('sys_refindex', [
            'hash' => md5('reference-' . $fileUid),
            'tablename' => 'tt_content',
            'recuid' => 7,
            'field' => 'image',
            'ref_table' => 'sys_file',
            'ref_uid' => $fileUid,
        ]);
    }

    /**
     * @param array<string, mixed>|null $body
     * @param array<string, string> $query
     * @return array{int, array<string, mixed>}
     */
    private function send(string $method, string $path, int $userUid, ?array $body, array $query = []): array
    {
        $url = 'https://typo3-testing.local/typo3/api/' . $path . ($query !== [] ? '?' . http_build_query($query) : '');
        $request = $this->setUpAuthenticatedRequest($url, $userUid, $method)->withQueryParams($query);
        if ($body !== null) {
            $request = $request
                ->withHeader('Content-Type', 'application/json')
                ->withBody(new StreamFactory()->createStream(json_encode((object)$body)));
        }
        $response = $this->get(Application::class)->handle($request);
        return [$response->getStatusCode(), json_decode((string)$response->getBody(), true) ?? []];
    }

    /**
     * @param array<string, string> $query
     * @return array{int, array<string, mixed>}
     */
    private function sendContent(string $method, string $path, int $userUid, string $content, array $query = []): array
    {
        $url = 'https://typo3-testing.local/typo3/api/' . $path . ($query !== [] ? '?' . http_build_query($query) : '');
        $request = $this->setUpAuthenticatedRequest($url, $userUid, $method)
            ->withQueryParams($query)
            ->withHeader('Content-Type', 'text/plain')
            ->withBody(new StreamFactory()->createStream($content));
        $response = $this->get(Application::class)->handle($request);
        return [$response->getStatusCode(), json_decode((string)$response->getBody(), true) ?? []];
    }

    /**
     * @return list<string>
     */
    private function getLogMessages(int $action): array
    {
        return array_column(
            $this->get(ConnectionPool::class)->getConnectionForTable('sys_log')->select(
                ['details'],
                'sys_log',
                ['type' => SystemLogType::FILE, 'action' => $action],
            )->fetchAllAssociative(),
            'details'
        );
    }
}
