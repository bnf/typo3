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

use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\Attributes\Test;
use Psr\Http\Message\ServerRequestInterface;
use TYPO3\CMS\Backend\Domain\Model\AccessToken;
use TYPO3\CMS\Backend\Http\Application;
use TYPO3\CMS\Core\Authentication\BackendUserAuthentication;
use TYPO3\CMS\Core\Core\RequestId;
use TYPO3\CMS\Core\Http\NormalizedParams;
use TYPO3\CMS\Core\Http\ServerRequest;
use TYPO3\CMS\Core\Http\StreamFactory;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\TestingFramework\Core\Functional\FunctionalTestCase;

final class ActionHandlerTest extends FunctionalTestCase
{
    protected array $testExtensionsToLoad = [
        'typo3/sysext/core/Tests/Functional/Fixtures/Extensions/test_action',
    ];

    protected function setUp(): void
    {
        parent::setUp();
        $this->withDatabaseSnapshot(function () {
            $this->importCSVDataSet(__DIR__ . '/../Fixtures/be_users.csv');
        });
    }

    #[Test]
    public function simpleReturnAction(): void
    {
        $request = $this->setUpApiTest('/v1/test/simple/return');
        $response = $this->get(Application::class)->handle($request);
        $result = json_decode((string)$response->getBody());

        self::assertSame('simple', $result);
    }

    #[Test]
    public function versionsOfAnActionAreServedSideBySide(): void
    {
        $responseV1 = $this->get(Application::class)->handle($this->setUpApiTest('/v1/test/versioned'));
        $responseV2 = $this->get(Application::class)->handle($this->setUpApiTest('/v2/test/versioned'));

        self::assertSame('v1', json_decode((string)$responseV1->getBody()));
        self::assertSame('v2', json_decode((string)$responseV2->getBody()));
    }

    #[Test]
    public function deprecatedActionAnnouncesDeprecationInResponseHeader(): void
    {
        $responseV1 = $this->get(Application::class)->handle($this->setUpApiTest('/v1/test/versioned'));
        $responseV2 = $this->get(Application::class)->handle($this->setUpApiTest('/v2/test/versioned'));

        self::assertSame('@1793608038', $responseV1->getHeaderLine('Deprecation'));
        self::assertFalse($responseV2->hasHeader('Deprecation'));
    }

    #[Test]
    public function actionIsNotAvailableWithoutVersion(): void
    {
        $response = $this->get(Application::class)->handle($this->setUpApiTest('/test/simple/return'));

        self::assertSame(404, $response->getStatusCode());
    }

    #[Test]
    public function actionIsOnlyAvailableForItsTargets(): void
    {
        $backendOnlyResponse = $this->get(Application::class)->handle($this->setUpApiTest('/v1/test/backend-only'));
        $httpOnlyResponse = $this->get(Application::class)->handle($this->setUpApiTest('/v1/test/http-only'));

        self::assertSame('backend', json_decode((string)$backendOnlyResponse->getBody()));
        // The access token of the backend user session is not accepted for the HTTP API
        self::assertSame(404, $httpOnlyResponse->getStatusCode());
    }

    #[Test]
    public function stringParameterAction(): void
    {
        $request = $this->setUpApiTest('/v1/test/string/parameter')
            ->withQueryParams(['foo' => 'bar']);
        $response = $this->get(Application::class)->handle($request);
        $result = json_decode((string)$response->getBody());

        self::assertSame(['bar'], $result);
    }

    #[Test]
    public function argumentInPathAction(): void
    {
        $request = $this->setUpApiTest('/v1/test/argument/bar');
        $response = $this->get(Application::class)->handle($request);
        $result = json_decode((string)$response->getBody());

        self::assertSame(['bar'], $result);
    }

    #[Test]
    public function queryParameterIsReadFromQueryForRequestWithBody(): void
    {
        $request = $this->setUpApiTest('/v1/test/query-parameter')
            ->withMethod('POST')
            ->withQueryParams(['bar' => 'from query'])
            ->withHeader('Content-Type', 'application/json')
            ->withBody(new StreamFactory()->createStream(json_encode(['foo' => 'from body', 'bar' => 'ignored'])));
        $response = $this->get(Application::class)->handle($request);

        self::assertSame(['from body', 'from query'], json_decode((string)$response->getBody()));
    }

    #[Test]
    public function createActionAnnouncesLocationOfCreatedResource(): void
    {
        $request = $this->setUpApiTest('/v1/test/items/books')
            ->withMethod('POST')
            ->withHeader('Content-Type', 'application/json')
            ->withBody(new StreamFactory()->createStream(json_encode(['name' => 'Dune'])));
        $response = $this->get(Application::class)->handle($request);

        self::assertSame(201, $response->getStatusCode());
        self::assertSame('https://typo3-testing.local/typo3/api/v1/test/items/books/42', $response->getHeaderLine('Location'));
        self::assertEquals((object)['item' => (object)['id' => 42, 'name' => 'Dune']], json_decode((string)$response->getBody()));
    }

    #[Test]
    public function createActionWithoutLocationRespondsWithOk(): void
    {
        $request = $this->setUpApiTest('/v1/test/query-parameter')
            ->withMethod('POST')
            ->withQueryParams(['bar' => 'from query'])
            ->withHeader('Content-Type', 'application/json')
            ->withBody(new StreamFactory()->createStream(json_encode(['foo' => 'from body'])));
        $response = $this->get(Application::class)->handle($request);

        self::assertSame(200, $response->getStatusCode());
        self::assertFalse($response->hasHeader('Location'));
    }

    #[Test]
    public function complexAction(): void
    {
        $application = $this->get(Application::class);

        $request = $this->setUpApiTest('/v1/test/complex')
            ->withQueryParams([
                'string' => 'Dummy',
                'int' => '7',
                'float' => '5.5',
                'stringlist' => json_encode(['foo', 'bar']),
                'intlist' => json_encode([1, 2, 3]),
                'stringmap' => json_encode(['foo' => 'bar']),
                'stringOrInt' => '8',
                'bool' => 'true',
            ]);

        $response = $this->get(Application::class)->handle($request);
        $statusCode = $response->getStatusCode();
        $result = json_decode((string)$response->getBody());

        $expected = (object)[
            'record' => [
                'foo',
                'bar',
            ],
            'string' => 'Dummy',
            'int' => 7,
            'float' => 5.5,
            'stringlist' => ['foo', 'bar'],
            'intlist' => [1, 2, 3],
            'stringmap' => (object)[
                'foo' => 'bar',
            ],
            'stringOrInt' => 8,
        ];

        self::assertSame(200, $statusCode);
        self::assertEquals($expected, $result);
    }

    #[Test]
    public function emptyResponseAction(): void
    {
        $application = $this->get(Application::class);

        $request = $this->setUpApiTest('/v1/test/empty-response');

        $response = $this->get(Application::class)->handle($request);
        $statusCode = $response->getStatusCode();
        $body = (string)$response->getBody();

        self::assertSame(204, $statusCode);
        self::assertEquals('', $body);
    }

    public static function invalidRequestsDataProvider(): \Generator
    {
        yield 'invalid integer' => [
            'route' => '/v1/test/complex',
            'queryParams' => [
                'int' => 'abc',
            ],
            'problem' => [
                'type' => 'https://typo3.org/go/exception/CMS/1793870606',
                'title' => 'Bad Request',
                'status' => 400,
                'detail' => 'The request contains invalid parameters',
                'errors' => [
                    ['parameter' => 'int', 'detail' => 'String value found, but an integer is required'],
                ],
            ],
        ];
        yield 'invalid json' => [
            'route' => '/v1/test/complex',
            'queryParams' => [
                'stringlist' => '{imcomplete json',
            ],
            'problem' => [
                'type' => 'https://typo3.org/go/exception/CMS/1793870606',
                'title' => 'Bad Request',
                'status' => 400,
                'detail' => 'The request contains invalid parameters',
                'errors' => [
                    ['parameter' => 'stringlist', 'detail' => 'Misformed JSON: Syntax error'],
                ],
            ],
        ];
        yield 'missing (required) query parameter' => [
            'route' => '/v1/test/string/parameter',
            'queryParams' => [],
            'problem' => [
                'type' => 'https://typo3.org/go/exception/CMS/1793870606',
                'title' => 'Bad Request',
                'status' => 400,
                'detail' => 'The request contains invalid parameters',
                'errors' => [
                    ['parameter' => 'foo', 'detail' => 'Missing parameter value'],
                ],
            ],
        ];
        yield 'unavailable route' => [
            'route' => '/v1/test/unavailable',
            'queryParams' => [],
            'problem' => [
                'type' => 'about:blank',
                'title' => 'Not Found',
                'status' => 404,
                'detail' => 'Route not found',
            ],
        ];
        yield 'api entrypoint' => [
            'route' => '',
            'queryParams' => [],
            'problem' => [
                'type' => 'about:blank',
                'title' => 'Not Found',
                'status' => 404,
                'detail' => 'Route not found',
            ],
        ];
    }

    #[DataProvider('invalidRequestsDataProvider')]
    #[Test]
    public function invalidRequests(string $route, array $queryParams, array $problem): void
    {
        $request = $this->setUpApiTest($route)->withQueryParams($queryParams);
        $response = $this->get(Application::class)->handle($request);

        self::assertSame($problem['status'], $response->getStatusCode());
        self::assertSame('application/problem+json', $response->getHeaderLine('Content-Type'));
        self::assertSame($problem, json_decode((string)$response->getBody(), true));
    }

    #[Test]
    public function invalidParametersOfRequestBodyAreReportedByPointer(): void
    {
        $request = $this->setUpApiTest('/v1/test/items/books')
            ->withMethod('POST')
            ->withHeader('Content-Type', 'application/json')
            ->withBody(new StreamFactory()->createStream(json_encode(['name' => 42])));
        $response = $this->get(Application::class)->handle($request);

        self::assertSame(400, $response->getStatusCode());
        self::assertSame(
            [['pointer' => '#/name', 'detail' => 'Integer value found, but a string is required']],
            json_decode((string)$response->getBody(), true)['errors']
        );
    }

    #[Test]
    public function misformedRequestBodyIsIdentifiedByExceptionCode(): void
    {
        $request = $this->setUpApiTest('/v1/test/items/books')
            ->withMethod('POST')
            ->withHeader('Content-Type', 'application/json')
            ->withBody(new StreamFactory()->createStream('{"name":'));
        $response = $this->get(Application::class)->handle($request);

        self::assertSame(400, $response->getStatusCode());
        self::assertSame(
            'https://typo3.org/go/exception/CMS/1793870605',
            json_decode((string)$response->getBody(), true)['type']
        );
    }

    #[Test]
    public function invalidResultIsRejected(): void
    {
        $request = $this->setUpApiTest('/v1/test/invalid-result');
        $response = $this->get(Application::class)->handle($request);
        $requestId = (string)$this->get(RequestId::class);

        self::assertSame(500, $response->getStatusCode());
        self::assertSame('application/problem+json', $response->getHeaderLine('Content-Type'));
        self::assertSame(
            [
                'type' => 'about:blank',
                'title' => 'Internal Server Error',
                'status' => 500,
                'detail' => 'The action failed, the error is logged with request ID ' . $requestId,
                'requestId' => $requestId,
            ],
            json_decode((string)$response->getBody(), true)
        );
    }

    #[Test]
    public function typeErrorOfActionIsInternalError(): void
    {
        $request = $this->setUpApiTest('/v1/test/type-error');
        $response = $this->get(Application::class)->handle($request);
        $body = (string)$response->getBody();

        self::assertSame(500, $response->getStatusCode());
        self::assertSame((string)$this->get(RequestId::class), json_decode($body, true)['requestId']);
        self::assertStringNotContainsString('secret.php', $body);
    }

    #[Test]
    public function actionErrorIsReturnedWithStatusCode(): void
    {
        $request = $this->setUpApiTest('/v1/test/not-found');
        $response = $this->get(Application::class)->handle($request);

        self::assertSame(404, $response->getStatusCode());
        self::assertSame('application/problem+json', $response->getHeaderLine('Content-Type'));
        self::assertSame(
            ['type' => 'https://typo3.org/go/exception/CMS/1791981204', 'title' => 'Not Found', 'status' => 404, 'detail' => 'Record not found'],
            json_decode((string)$response->getBody(), true)
        );
    }

    #[Test]
    public function insufficientScopeOfActionErrorIsAnnounced(): void
    {
        $request = $this->setUpApiTest('/v1/test/insufficient-scope');
        $response = $this->get(Application::class)->handle($request);

        self::assertSame(403, $response->getStatusCode());
        self::assertSame('Bearer error="insufficient_scope", scope="admin"', $response->getHeaderLine('WWW-Authenticate'));
        self::assertSame(
            'Access to table be_users requires the scope admin',
            json_decode((string)$response->getBody(), true)['detail']
        );
    }

    #[Test]
    public function missingToken(): void
    {
        $request = $this->setUpApiTest('/v1/test/empty-response')->withoutHeader('Authorization');
        $response = $this->get(Application::class)->handle($request);

        self::assertSame(401, $response->getStatusCode());
        self::assertSame('Bearer', $response->getHeaderLine('WWW-Authenticate'));
        self::assertSame(
            ['type' => 'about:blank', 'title' => 'Unauthorized', 'status' => 401, 'detail' => 'Missing access token'],
            json_decode((string)$response->getBody(), true)
        );
    }

    protected function setUpApiTest(string $route): ServerRequestInterface
    {
        return $this->setUpAuthenticatedRequest('https://typo3-testing.local/typo3/api' . $route, 1);
    }

    /**
     * Sets up Backend User which is already available in db
     * @todo move into testing framework
     */
    protected function setUpAuthenticatedRequest(string $url, int $userUid): ServerRequestInterface
    {
        $userRow = $this->getBackendUserRecordFromDatabase($userUid);
        if (!is_array($userRow)) {
            throw new \RuntimeException(
                'The BE User with the UID ' . $userUid . ' does not exist in the database.',
                1774904188
            );
        }

        $backendUser = GeneralUtility::makeInstance(BackendUserAuthentication::class);
        $session = $backendUser->createUserSession($userRow);
        $token = new AccessToken($userRow['username'])->toString();
        return $this->createServerRequest($url)
            ->withCookieParams(['be_typo_user' => $session->getJwt()])
            ->withHeader('Authorization', 'Bearer ' . $token);
    }

    /**
     * Temporary copy of TF function
     *
     * @todo remove when `setUpAuthenticatedRequest` is moved into TF
     */
    private function createServerRequest(string $url, string $method = 'GET'): ServerRequestInterface
    {
        $requestUrlParts = parse_url($url);
        $docRoot = $this->instancePath;

        $serverParams = [
            'DOCUMENT_ROOT' => $docRoot,
            'HTTP_USER_AGENT' => 'TYPO3 Functional Test Request',
            'HTTP_HOST' => $requestUrlParts['host'] ?? 'localhost',
            'SERVER_NAME' => $requestUrlParts['host'] ?? 'localhost',
            'SERVER_ADDR' => '127.0.0.1',
            'REMOTE_ADDR' => '127.0.0.1',
            'SCRIPT_NAME' => '/index.php',
            'PHP_SELF' => '/index.php',
            'SCRIPT_FILENAME' => $docRoot . '/index.php',
            'PATH_TRANSLATED' => $docRoot . '/index.php',
            'QUERY_STRING' => $requestUrlParts['query'] ?? '',
            'REQUEST_URI' => $requestUrlParts['path'] . (isset($requestUrlParts['query']) ? '?' . $requestUrlParts['query'] : ''),
            'REQUEST_METHOD' => $method,
        ];
        // Define HTTPS and server port
        if (isset($requestUrlParts['scheme'])) {
            if ($requestUrlParts['scheme'] === 'https') {
                $serverParams['HTTPS'] = 'on';
                $serverParams['SERVER_PORT'] = '443';
            } else {
                $serverParams['SERVER_PORT'] = '80';
            }
        }

        // Define a port if used in the URL
        if (isset($requestUrlParts['port'])) {
            $serverParams['SERVER_PORT'] = $requestUrlParts['port'];
        }
        // set up normalizedParams
        $request = new ServerRequest($url, $method, null, [], $serverParams);
        return $request->withAttribute('normalizedParams', NormalizedParams::createFromRequest($request));
    }
}
