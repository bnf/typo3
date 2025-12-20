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

namespace TYPO3\CMS\Hub\Tests\Functional\App;

use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\Attributes\Test;
use Psr\Http\Message\ServerRequestInterface;
use TYPO3\CMS\Core\Authentication\BackendUserAuthentication;
use TYPO3\CMS\Core\Database\ConnectionPool;
use TYPO3\CMS\Core\Database\Query\Restriction\DeletedRestriction;
use TYPO3\CMS\Core\Http\ServerRequest;
use TYPO3\CMS\Core\Localization\LanguageServiceFactory;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Hub\Authentication\AppUserAuthentication;
use TYPO3\CMS\Hub\Model\AppInstruction;
use TYPO3\CMS\Hub\App\CreateRecordApp;
use TYPO3\CMS\Hub\Repository\AppRepository;
use TYPO3\TestingFramework\Core\Functional\FunctionalTestCase;

final class CreateRecordAppTest extends FunctionalTestCase
{
    protected array $coreExtensionsToLoad = ['hub'];

    protected function setUp(): void
    {
        parent::setUp();

        $GLOBALS['LANG'] = $this->get(LanguageServiceFactory::class)->create('default');
        $this->importCSVDataSet(__DIR__ . '/../Fixtures/be_users.csv');
        $this->importCSVDataSet(__DIR__ . '/../Fixtures/HubRepositoryTest_pages.csv');
        $this->importCSVDataSet(__DIR__ . '/../Fixtures/HubRepositoryTest_hub.csv');
    }

    #[Test]
    public function reactWorksForAValidRequest(): void
    {
        $appRecord = (new AppRepository())->getAppRecordByIdentifier('visual-app-uuid');
        $app = $this->get(CreateRecordApp::class);
        $request = new ServerRequest('http://localhost/', 'POST');
        $payload = [
            'foo' => 'bar',
            'bar' => [
                'string' => 'bar.foo',
                'int' => 42,
                'bool' => true,
            ],
        ];
        $user = $this->setUpAppBackendUser($request, $appRecord);
        $GLOBALS['BE_USER'] = $user;
        $request = $request->withHeader('x-api-key', $appRecord->toArray()['secret']);

        self::assertCount(0, $this->getTestPages());

        $response = $app->react($request, $payload, $appRecord);

        self::assertEquals(201, $response->getStatusCode());
        self::assertCount(1, $this->getTestPages());
    }

    #[Test]
    public function reactFailsOnInvalidTable(): void
    {
        $appRecord = (new AppRepository())->getAppRecordByIdentifier('invalid-table');
        $app = GeneralUtility::makeInstance(CreateRecordApp::class);
        $request = new ServerRequest('http://localhost/', 'POST');
        $request = $request->withHeader('x-api-key', $appRecord->toArray()['secret']);

        $response = $app->react($request, [], $appRecord);
        self::assertEquals(400, $response->getStatusCode());
        self::assertEquals('Invalid argument "table_name"', json_decode((string)$response->getBody(), true)['error']);
    }

    #[Test]
    public function reactFailsOnInvalidFields(): void
    {
        $appRecord = (new AppRepository())->getAppRecordByIdentifier('invalid-fields');
        $app = GeneralUtility::makeInstance(CreateRecordApp::class);
        $request = new ServerRequest('http://localhost/', 'POST');
        $request = $request->withHeader('x-api-key', $appRecord->toArray()['secret']);

        $response = $app->react($request, [], $appRecord);
        self::assertEquals(400, $response->getStatusCode());
        self::assertEquals('No fields given.', json_decode((string)$response->getBody(), true)['error']);
    }

    protected function getTestPages(): array
    {
        $queryBuilder = $this->get(ConnectionPool::class)
            ->getQueryBuilderForTable('pages');
        $queryBuilder->getRestrictions()->removeAll();
        $queryBuilder->getRestrictions()->add(new DeletedRestriction());
        return $queryBuilder->select('*')
            ->from('pages')
            ->where(
                $queryBuilder->expr()->eq('title', $queryBuilder->createNamedParameter('Test bar')),
                $queryBuilder->expr()->eq('pid', $queryBuilder->createNamedParameter(1))
            )
            ->executeQuery()
            ->fetchAllAssociative();
    }

    protected function setUpAppBackendUser(ServerRequestInterface $request, AppInstruction $appInstruction): BackendUserAuthentication
    {
        $backendUser = GeneralUtility::makeInstance(AppUserAuthentication::class);
        /** @var AppUserAuthentication $backendUser */
        $backendUser->setAppInstruction($appInstruction);
        return $this->authenticateBackendUser($backendUser, $request);
    }

    public static function replacePlaceHolderDataProvider(): array
    {
        return [
            'no placeholders' => [
                'value' => 'foo',
                'payload' => [],
                'expected' => 'foo',
            ],
            'placeholder in value' => [
                'value' => '${foo}',
                'payload' => [
                    'foo' => 'bar',
                ],
                'expected' => 'bar',
            ],
            'placeholder in value is integer' => [
                'value' => '${foo}',
                'payload' => [
                    'foo' => 42,
                ],
                'expected' => '42',
            ],
            'placeholder in value is float' => [
                'value' => '${foo}',
                'payload' => [
                    'foo' => 42.5,
                ],
                'expected' => '42.5',
            ],
            'placeholder in value is boolean true' => [
                'value' => '${foo}',
                'payload' => [
                    'foo' => true,
                ],
                'expected' => '1',
            ],
            'placeholder in value is boolean false' => [
                'value' => '${foo}',
                'payload' => [
                    'foo' => false,
                ],
                'expected' => '',
            ],
            'two placeholder in value' => [
                'value' => '${foo} ${bar}',
                'payload' => [
                    'foo' => 'bar',
                    'bar' => 'foo',
                ],
                'expected' => 'bar foo',
            ],
            'placeholder in value with dot' => [
                'value' => '${foo.bar}',
                'payload' => [
                    'foo' => [
                        'bar' => 'baz',
                    ],
                ],
                'expected' => 'baz',
            ],
            'placeholder in value with dot and array access' => [
                'value' => '${foo.bar.0}',
                'payload' => [
                    'foo' => [
                        'bar' => [
                            '0' => 'baz',
                        ],
                    ],
                ],
                'expected' => 'baz',
            ],
            'placeholder in value with dot and numeric array access' => [
                'value' => '${foo.bar.0}',
                'payload' => [
                    'foo' => [
                        'bar' => [
                            'baz',
                        ],
                    ],
                ],
                'expected' => 'baz',
            ],
            'placeholder in value with dot and array access and array access in value' => [
                'value' => '${foo.bar.0.baz}',
                'payload' => [
                    'foo' => [
                        'bar' => [
                            '0' => [
                                'baz' => 'qux',
                            ],
                        ],
                    ],
                ],
                'expected' => 'qux',
            ],
            'placeholder in value with dot and array access and numeric array access in value' => [
                'value' => '${foo.bar.0.baz}',
                'payload' => [
                    'foo' => [
                        'bar' => [
                            [
                                'baz' => 'qux',
                            ],
                        ],
                    ],
                ],
                'expected' => 'qux',
            ],
            'placeholder in value with dot and array access and array access in value and array access in value' => [
                'value' => '${foo.bar.0.baz.0}',
                'payload' => [
                    'foo' => [
                        'bar' => [
                            '0' => [
                                'baz' => [
                                    '0' => 'qux',
                                ],
                            ],
                        ],
                    ],
                ],
                'expected' => 'qux',
            ],
            'placeholder in value with dot and array numeric access and numeric array access in value and numeric array access in value' => [
                'value' => '${foo.bar.0.baz.0}',
                'payload' => [
                    'foo' => [
                        'bar' => [
                            [
                                'baz' => [
                                    'qux',
                                ],
                            ],
                        ],
                    ],
                ],
                'expected' => 'qux',
            ],
            'placeholder in value with dot and array access and array access in value and array access in value and array access in value' => [
                'value' => '${foo.bar.0.baz.0.qux}',
                'payload' => [
                    'foo' => [
                        'bar' => [
                            '0' => [
                                'baz' => [
                                    '0' => [
                                        'qux' => 'quux',
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
                'expected' => 'quux',
            ],
            'placeholder in value with dot and array access and numeric array access in value and numeric array access in value and numeric array access in value' => [
                'value' => '${foo.bar.0.baz.0.qux}',
                'payload' => [
                    'foo' => [
                        'bar' => [
                            [
                                'baz' => [
                                    [
                                        'qux' => 'quux',
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
                'expected' => 'quux',
            ],
        ];
    }

    #[DataProvider('replacePlaceHolderDataProvider')]
    #[Test]
    public function replacePlaceHolders(mixed $value, array $payload, string $expected): void
    {
        $subject = GeneralUtility::makeInstance(CreateRecordApp::class);
        self::assertSame($expected, $subject->replacePlaceHolders($value, $payload));
    }
}
