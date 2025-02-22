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

namespace TYPO3\CMS\Core\Tests\Functional\Resource;

use TYPO3\CMS\Core\Core\Environment;
use TYPO3\CMS\Core\Resource\File;
use TYPO3\CMS\Core\Resource\ResourceFactory;
use TYPO3\CMS\Core\Resource\StorageRepository;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\TestingFramework\Core\Functional\FunctionalTestCase;

class StorageRepositoryTest extends FunctionalTestCase
{
    /**
     * @var StorageRepository
     */
    private $subject;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setUpBackendUserFromFixture(1);
        $this->subject = GeneralUtility::makeInstance(StorageRepository::class);
    }

    protected function tearDown(): void
    {
        unset($this->storageRepository, $this->subject);
        parent::tearDown();
    }

    public function bestStorageIsResolvedDataProvider(): array
    {
        // `{public}` will be replaced by public project path (not having trailing slash)
        // double slashes `//` are used on purpose for given file identifiers
        return $this->mapToDataSet([
            // legacy storage
            '/favicon.ico' => '0:/favicon.ico',
            'favicon.ico' => '0:/favicon.ico',

            '{public}//favicon.ico' => '0:/favicon.ico',
            '{public}/favicon.ico' => '0:/favicon.ico',

            // using storages with relative path
            '/fileadmin/img.png' => '1:/img.png',
            'fileadmin/img.png' => '1:/img.png',
            '/fileadmin/images/img.png' => '1:/images/img.png',
            'fileadmin/images/img.png' => '1:/images/img.png',
            '/documents/doc.pdf' => '2:/doc.pdf',
            'documents/doc.pdf' => '2:/doc.pdf',
            '/fileadmin/nested/images/img.png' => '3:/images/img.png',
            'fileadmin/nested/images/img.png' => '3:/images/img.png',

            '{public}//fileadmin/img.png' => '1:/img.png',
            '{public}/fileadmin/img.png' => '1:/img.png',
            '{public}//fileadmin/images/img.png' => '1:/images/img.png',
            '{public}/fileadmin/images/img.png' => '1:/images/img.png',
            '{public}//documents/doc.pdf' => '2:/doc.pdf',
            '{public}/documents/doc.pdf' => '2:/doc.pdf',
            '{public}//fileadmin/nested/images/img.png' => '3:/images/img.png',
            '{public}/fileadmin/nested/images/img.png' => '3:/images/img.png',

            // using storages with absolute path
            '/files/img.png' => '4:/img.png',
            'files/img.png' => '4:/img.png',
            '/files/images/img.png' => '4:/images/img.png',
            'files/images/img.png' => '4:/images/img.png',
            '/docs/doc.pdf' => '5:/doc.pdf',
            'docs/doc.pdf' => '5:/doc.pdf',
            '/files/nested/images/img.png' => '6:/images/img.png',
            'files/nested/images/img.png' => '6:/images/img.png',

            '{public}//files/img.png' => '4:/img.png',
            '{public}/files/img.png' => '4:/img.png',
            '{public}//files/images/img.png' => '4:/images/img.png',
            '{public}/files/images/img.png' => '4:/images/img.png',
            '{public}//docs/doc.pdf' => '5:/doc.pdf',
            '{public}/docs/doc.pdf' => '5:/doc.pdf',
            '{public}//files/nested/images/img.png' => '6:/images/img.png',
            '{public}/files/nested/images/img.png' => '6:/images/img.png',
        ]);
    }

    /**
     * @param string $sourceIdentifier
     * @param string $expectedCombinedIdentifier
     * @test
     * @dataProvider bestStorageIsResolvedDataProvider
     */
    public function bestStorageIsResolved(string $sourceIdentifier, string $expectedCombinedIdentifier): void
    {
        $this->createLocalStorages();
        $sourceIdentifier = str_replace('{public}', Environment::getPublicPath(), $sourceIdentifier);
        $storage = $this->subject->getStorageObject(0, [], $sourceIdentifier);
        $combinedIdentifier = sprintf('%d:%s', $storage->getUid(), $sourceIdentifier);
        self::assertSame(
            $expectedCombinedIdentifier,
            $combinedIdentifier,
            sprintf('Given identifier "%s"', $sourceIdentifier)
        );
    }

    private function createLocalStorages(): void
    {
        $publicPath = Environment::getPublicPath();
        $prefixDelegate = static function (string $value) use ($publicPath): string {
            return $publicPath . '/' . $value;
        };
        // array indexes are not relevant here, but are those expected to be used as storage UID (`1:/file.png`)
        // @todo it is possible to create ambiguous storages, e.g. `fileadmin/` AND `/fileadmin/`
        $relativeNames = [1 => 'fileadmin/', 2 => 'documents/', 3 => 'fileadmin/nested/'];
        // @todo: All these directories must exist. This is because createLocalStorage() calls testCaseSensitivity()
        //        which creates a file in each directory without checking if the directory does exist. Arguably, this
        //        should be handled in testCaseSensitivity(). For now, we create the directories in question and
        //        suppress errors so only the first test creates them and subsequent tests don't emit a warning here.
        @mkdir($this->instancePath . '/documents');
        @mkdir($this->instancePath . '/fileadmin/nested');
        $absoluteNames = array_map($prefixDelegate, [4 => 'files/', 5 => 'docs/', 6 => 'files/nested']);
        @mkdir($this->instancePath . '/files');
        @mkdir($this->instancePath . '/docs');
        @mkdir($this->instancePath . '/files/nested');
        foreach ($relativeNames as $relativeName) {
            $this->subject->createLocalStorage('rel:' . $relativeName, $relativeName, 'relative');
        }
        foreach ($absoluteNames as $absoluteName) {
            $this->subject->createLocalStorage('abs:' . $absoluteName, $absoluteName, 'absolute');
        }
    }

    /**
     * @param array<string, string> $map
     * @return array<string, string[]>
     */
    private function mapToDataSet(array $map): array
    {
        array_walk($map, static function (&$item, string $key) {
            $item = [$key, $item];
        });
        return $map;
    }

    /**
     * @test
     */
    public function copyFileCopiesMetadata(): void
    {
        $this->importCSVDataSet(__DIR__ . '/../Fixtures/sys_file_storage.csv');
        $this->setUpBackendUser(1);
        mkdir(Environment::getPublicPath() . '/fileadmin/foo');
        file_put_contents(Environment::getPublicPath() . '/fileadmin/foo/bar.txt', 'Temp file');
        $subject = GeneralUtility::makeInstance(StorageRepository::class)->findByUid(1);
        $fileToCopyMetaData = [
            'title' => 'Temp file title',
            'description' => 'Temp file description',
        ];
        /** @var File $fileToCopy */
        $fileToCopy = GeneralUtility::makeInstance(ResourceFactory::class)->getFileObjectFromCombinedIdentifier('1:/foo/bar.txt');
        $fileToCopy->getMetaData()->add($fileToCopyMetaData);
        $targetParentFolder = GeneralUtility::makeInstance(ResourceFactory::class)->getFolderObjectFromCombinedIdentifier('1:/');
        /** @var File $newFile */
        $newFile = $subject->copyFile($fileToCopy, $targetParentFolder);
        self::assertNotEquals($fileToCopy->getMetaData()->get()['file'], $newFile->getMetaData()->get()['file']);
        self::assertNotEquals($fileToCopy->getMetaData()->get()['uid'], $newFile->getMetaData()->get()['uid']);
        self::assertEquals($fileToCopyMetaData['title'], $newFile->getMetaData()->get()['title']);
        self::assertEquals($fileToCopyMetaData['description'], $newFile->getMetaData()->get()['description']);
    }
}
