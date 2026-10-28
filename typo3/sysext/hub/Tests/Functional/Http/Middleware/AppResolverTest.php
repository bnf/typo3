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

namespace TYPO3\CMS\Hub\Tests\Functional\Http\Middleware;

use PHPUnit\Framework\Attributes\Test;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\RequestHandlerInterface;
use TYPO3\CMS\Backend\Http\Application;
use TYPO3\CMS\Backend\Tests\Functional\Http\AuthenticatedRequestTrait;
use TYPO3\CMS\Core\Database\ConnectionPool;
use TYPO3\CMS\Core\Http\NormalizedParams;
use TYPO3\CMS\Core\Http\ServerRequest;
use TYPO3\CMS\Core\Http\StreamFactory;
use TYPO3\CMS\Core\Security\JwtTrait;
use TYPO3\CMS\Hub\Http\Middleware\Metadata;
use TYPO3\CMS\Hub\Model\AccessToken;
use TYPO3\TestingFramework\Core\Functional\FunctionalTestCase;

/**
 * @todo cleanup typo3/sysext/backend/Tests/Functional/Http/ActionHandlerTest.php
 * to expose all action test cases as data provider, to be able to test
 * actions internally (there) and via external API requrests here.
 */
final class AppResolverTest extends FunctionalTestCase
{
    use AuthenticatedRequestTrait;
    use JwtTrait;

    protected array $configurationToUseInTestInstance = [
        'SYS' => [
            'encryptionKey' => '4408d27a916d51e624b69af3554f516dbab61037a9f7b9fd6f81b4d3bedeccb6',
        ],
    ];

    protected array $coreExtensionsToLoad = [
        'hub',
    ];

    protected array $testExtensionsToLoad = [
        'typo3/sysext/core/Tests/Functional/Fixtures/Extensions/test_action',
    ];

    protected function setUp(): void
    {
        parent::setUp();
        $this->withDatabaseSnapshot(function () {
            $this->importCSVDataSet(__DIR__ . '/../../../../../backend/Tests/Functional/Fixtures/be_users.csv');
            $this->importCSVDataSet(__DIR__ . '/../../Fixtures/sys_app.csv');
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

    #[Test]
    public function actionIsOnlyAvailableForItsTargets(): void
    {
        $httpOnlyResponse = $this->get(Application::class)->handle($this->setUpApiTest('/v1/test/http-only'));
        $backendOnlyResponse = $this->get(Application::class)->handle($this->setUpApiTest('/v1/test/backend-only'));

        self::assertSame('http', json_decode((string)$httpOnlyResponse->getBody()));
        self::assertSame(404, $backendOnlyResponse->getStatusCode());
    }

    #[Test]
    public function schemaOfBackendTargetIsDeniedForApps(): void
    {
        $httpResponse = $this->get(Application::class)->handle($this->setUpApiTest('/v1/schema'));
        $backendResponse = $this->get(Application::class)->handle(
            $this->setUpApiTest('/v1/schema?target=backend')->withQueryParams(['target' => 'backend'])
        );

        self::assertSame(200, $httpResponse->getStatusCode());
        self::assertSame(403, $backendResponse->getStatusCode());
    }

    #[Test]
    public function tokenEndpointIsServedAtVersionedPathOfSpecification(): void
    {
        $schema = json_decode((string)$this->get(Application::class)->handle($this->setUpApiTest('/v1/schema'))->getBody(), true);
        $tokenPaths = array_keys(array_filter(
            $schema['paths'],
            static fn(array $pathItem): bool => in_array('oauth', $pathItem['post']['tags'] ?? [], true)
        ));

        self::assertSame(['/v1/oauth/token'], $tokenPaths);

        $request = $this->createServerRequest($schema['servers'][0]['url'] . $tokenPaths[0], 'POST')
            ->withParsedBody(['grant_type' => 'unknown']);
        $response = $this->get(Application::class)->handle($request);

        self::assertSame(400, $response->getStatusCode());
        self::assertSame('unsupported_grant_type', json_decode((string)$response->getBody(), true)['error']);
    }

    #[Test]
    public function staticTokenDoesNotGrantScopeNotAllowedForImpersonatedUser(): void
    {
        $this->importCSVDataSet(__DIR__ . '/../../Fixtures/sys_app_restricted.csv');
        $request = $this->createServerRequest('https://typo3-testing.local/typo3/api/v1/test/admin-only')
            ->withHeader('Authorization', 'Bearer ' . $this->createStaticToken('5b1e1f6a-3c1d-4f0e-9a51-7e0c2b8d4a10'));

        $response = $this->get(Application::class)->handle($request);

        self::assertSame(403, $response->getStatusCode());
        self::assertStringContainsString('Missing scope', (string)$response->getBody());
    }

    #[Test]
    public function staticTokenOfDisabledAppIsRejected(): void
    {
        $this->importCSVDataSet(__DIR__ . '/../../Fixtures/sys_app_restricted.csv');
        $request = $this->createServerRequest('https://typo3-testing.local/typo3/api/v1/test/simple/return')
            ->withHeader('Authorization', 'Bearer ' . $this->createStaticToken('9c4d2e7b-8f31-4a6c-b2d5-0e1f3a4b5c6d'));

        $response = $this->get(Application::class)->handle($request);

        self::assertSame(401, $response->getStatusCode());
    }

    #[Test]
    public function oauthTokenOfDisabledAppIsRejected(): void
    {
        $this->importCSVDataSet(__DIR__ . '/../../Fixtures/sys_app_restricted.csv');
        $token = self::encodeHashSignedJwt(
            [
                'jti' => 'oauth-token-of-disabled-app',
                'aud' => '9c4d2e7b-8f31-4a6c-b2d5-0e1f3a4b5c6d',
                'iat' => time(),
                'nbf' => time(),
                'sub' => 'be_users:1',
                'scopes' => ['content:read'],
                'mode' => 'oauth',
            ],
            self::createSigningKeyFromEncryptionKey(AccessToken::class)
        );
        $request = $this->createServerRequest('https://typo3-testing.local/typo3/api/v1/test/simple/return')
            ->withHeader('Authorization', 'Bearer ' . $token);

        $response = $this->get(Application::class)->handle($request);

        self::assertSame(401, $response->getStatusCode());
    }

    #[Test]
    public function generatedSecretOfStaticAppIsReturnedWithDigestAndToken(): void
    {
        $result = $this->generateAppSecret('ce1f0dc3-2fcc-443e-93e8-57f752691a71', 'static');

        self::assertMatchesRegularExpression('/^[0-9a-f]{40}$/', $result['secret']);
        self::assertSame('sha256:' . hash('sha256', $result['secret']), $result['digest']);

        $this->get(ConnectionPool::class)->getConnectionForTable('sys_app')
            ->update('sys_app', ['secret' => $result['digest']], ['uid' => 1]);
        $request = $this->createServerRequest('https://typo3-testing.local/typo3/api/v1/test/simple/return')
            ->withHeader('Authorization', 'Bearer ' . $result['token']);
        $response = $this->get(Application::class)->handle($request);

        self::assertSame('simple', json_decode((string)$response->getBody()));
    }

    #[Test]
    public function generatedSecretOfOauthAppIsReturnedWithoutToken(): void
    {
        $result = $this->generateAppSecret('ce1f0dc3-2fcc-443e-93e8-57f752691a71', 'oauth');

        self::assertSame('sha256:' . hash('sha256', $result['secret']), $result['digest']);
        self::assertNull($result['token']);
    }

    #[Test]
    public function staticTokenWithInvalidSecretIsRejected(): void
    {
        $request = $this->createServerRequest('https://typo3-testing.local/typo3/api/v1/test/simple/return')
            ->withHeader('Authorization', 'Bearer ' . $this->createStaticToken('ce1f0dc3-2fcc-443e-93e8-57f752691a71', 'invalid'));

        $response = $this->get(Application::class)->handle($request);

        self::assertSame(401, $response->getStatusCode());
    }

    #[Test]
    public function staticTokenIsRejectedAfterSecretOfAppChanged(): void
    {
        $request = $this->createServerRequest('https://typo3-testing.local/typo3/api/v1/test/simple/return')
            ->withHeader('Authorization', 'Bearer ' . $this->createStaticToken('ce1f0dc3-2fcc-443e-93e8-57f752691a71'));
        self::assertSame(200, $this->get(Application::class)->handle($request)->getStatusCode());

        $this->get(ConnectionPool::class)->getConnectionForTable('sys_app')
            ->update('sys_app', ['secret' => 'sha256:' . hash('sha256', 'changed')], ['uid' => 1]);
        $response = $this->get(Application::class)->handle($request);

        self::assertSame(401, $response->getStatusCode());
    }

    #[Test]
    public function tokenIsGeneratedForValidSecretOfStaticApp(): void
    {
        $response = $this->generateToken('ce1f0dc3-2fcc-443e-93e8-57f752691a71', 'a5b2c113d315d7f6c0ca996b6ddc69203765ca72');
        $token = json_decode((string)$response->getBody(), true)['token'] ?? '';

        $request = $this->createServerRequest('https://typo3-testing.local/typo3/api/v1/test/simple/return')
            ->withHeader('Authorization', 'Bearer ' . $token);
        self::assertSame('simple', json_decode((string)$this->get(Application::class)->handle($request)->getBody()));
    }

    #[Test]
    public function tokenIsNotGeneratedForInvalidSecret(): void
    {
        $response = $this->generateToken('ce1f0dc3-2fcc-443e-93e8-57f752691a71', 'invalid');

        self::assertSame(403, $response->getStatusCode());
        self::assertArrayNotHasKey('token', json_decode((string)$response->getBody(), true));
    }

    #[Test]
    public function oauthClientIsAuthenticatedBySecret(): void
    {
        $this->createOauthApp();
        $request = $this->createTokenRequest();
        $validSecretResponse = $this->get(Application::class)->handle($request);
        $invalidSecretResponse = $this->get(Application::class)->handle(
            $request->withParsedBody([...$request->getParsedBody(), 'client_secret' => 'invalid'])
        );

        self::assertNotSame('invalid_client', json_decode((string)$validSecretResponse->getBody(), true)['error']);
        self::assertSame('invalid_client', json_decode((string)$invalidSecretResponse->getBody(), true)['error']);
    }

    #[Test]
    public function tokenEndpointDoesNotAllowCrossOriginRequests(): void
    {
        $this->createOauthApp();

        $response = $this->get(Application::class)->handle($this->createTokenRequest()->withHeader('Origin', 'https://client.example'));

        self::assertSame(400, $response->getStatusCode());
        self::assertFalse($response->hasHeader('Access-Control-Allow-Origin'));
    }

    #[Test]
    public function preflightOfTokenEndpointDoesNotAllowCrossOriginRequests(): void
    {
        $request = $this->createServerRequest('https://typo3-testing.local/typo3/api/v1/oauth/token', 'OPTIONS')
            ->withHeader('Origin', 'https://client.example')
            ->withHeader('Access-Control-Request-Method', 'POST')
            ->withHeader('Access-Control-Request-Headers', 'authorization');

        $response = $this->get(Application::class)->handle($request);

        self::assertFalse($response->hasHeader('Access-Control-Allow-Origin'));
    }

    #[Test]
    public function authorizationServerMetadataIsReadableFromAnyOrigin(): void
    {
        $request = $this->createServerRequest('https://typo3-testing.local/.well-known/oauth-authorization-server')
            ->withHeader('Origin', 'https://client.example');

        $response = $this->get(Metadata::class)->process($request, new class implements RequestHandlerInterface {
            public function handle(ServerRequestInterface $request): ResponseInterface
            {
                throw new \RuntimeException('The request is not handled by the metadata middleware', 1793784400);
            }
        });

        self::assertSame(200, $response->getStatusCode());
        self::assertSame('*', $response->getHeaderLine('Access-Control-Allow-Origin'));
    }

    private function createOauthApp(): void
    {
        $this->get(ConnectionPool::class)->getConnectionForTable('sys_app')->insert('sys_app', [
            'uid' => 10,
            'app_type' => 'oauth',
            'name' => 'OAuth Client',
            'identifier' => '2f6b1c3e-7a4d-4e8b-9c1f-5d3a2b7e6f40',
            'secret' => 'sha256:' . hash('sha256', 'a5b2c113d315d7f6c0ca996b6ddc69203765ca72'),
            'impersonate_user' => 1,
            'scopes' => 'content:read',
        ]);
    }

    private function createTokenRequest(): ServerRequestInterface
    {
        return $this->createServerRequest('https://typo3-testing.local/typo3/api/v1/oauth/token', 'POST')
            ->withParsedBody([
                'grant_type' => 'authorization_code',
                'client_id' => '2f6b1c3e-7a4d-4e8b-9c1f-5d3a2b7e6f40',
                'client_secret' => 'a5b2c113d315d7f6c0ca996b6ddc69203765ca72',
                'code' => 'invalid',
            ]);
    }

    /**
     * @return array{secret: string, digest: string, token: ?string}
     */
    private function generateAppSecret(string $appIdentifier, string $appType): array
    {
        $request = $this->setUpAuthenticatedRequest('https://typo3-testing.local/typo3/api/v1/app/secret/generate', 1, 'POST')
            ->withHeader('Content-Type', 'application/json')
            ->withBody((new StreamFactory())->createStream(json_encode(['appIdentifier' => $appIdentifier, 'appType' => $appType])));
        $response = $this->get(Application::class)->handle($request);
        self::assertSame(200, $response->getStatusCode(), (string)$response->getBody());
        return json_decode((string)$response->getBody(), true);
    }

    private function generateToken(string $appIdentifier, string $secret): ResponseInterface
    {
        $request = $this->setUpAuthenticatedRequest('https://typo3-testing.local/typo3/api/v1/token/generate', 1, 'POST')
            ->withHeader('Content-Type', 'application/json')
            ->withBody((new StreamFactory())->createStream(json_encode(['appIdentifier' => $appIdentifier, 'secret' => $secret])));
        return $this->get(Application::class)->handle($request);
    }

    private function createStaticToken(string $appIdentifier, string $secret = 'a5b2c113d315d7f6c0ca996b6ddc69203765ca72'): string
    {
        return self::encodeHashSignedJwt(
            [
                'jti' => 'static',
                'aud' => $appIdentifier,
                'iat' => time(),
                'nbf' => time(),
                'secret' => $secret,
                'sub' => '',
                'scopes' => [],
                'mode' => 'static',
            ],
            self::createSigningKeyFromEncryptionKey(AccessToken::class)
        );
    }

    protected function setUpApiTest(string $route): ServerRequestInterface
    {
        return $this->setUpAuthenticatedStaticApiRequest('https://typo3-testing.local/typo3/api' . $route, 1);
    }

    /**
     * Sets up Backend User which is already available in db
     * @todo move into testing framework
     */
    protected function setUpAuthenticatedStaticApiRequest(string $url, int $userUid): ServerRequestInterface
    {
        // @todo create token dynamically?
        // client-id: ce1f0dc3-2fcc-443e-93e8-57f752691a71
        // secret: a5b2c113d315d7f6c0ca996b6ddc69203765ca72
        $token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiJzdGF0aWMiLCJhdWQiOiJjZTFmMGRjMy0yZmNjLTQ0M2UtOTNlOC01N2Y3NTI2OTFhNzEiLCJpYXQiOiIxNzc1MTM1MDAwLjUwNDYzMiIsIm5iZiI6IjE3NzUxMzUwMDAuNTA0NjM2Iiwic2VjcmV0IjoiYTViMmMxMTNkMzE1ZDdmNmMwY2E5OTZiNmRkYzY5MjAzNzY1Y2E3MiIsInN1YiI6IiIsInNjb3BlcyI6W10sIm1vZGUiOiJzdGF0aWMifQ.Foeqy42MlrUhJlYteN5PPP2-LZU1bF1JMbnFe8sVpbs';
        $request = $this->createServerRequest($url);
        return $request->withHeader('Authorization', 'Bearer ' . $token);
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
