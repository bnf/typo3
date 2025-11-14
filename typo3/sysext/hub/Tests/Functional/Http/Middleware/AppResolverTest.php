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
use Psr\Http\Message\ServerRequestInterface;
use TYPO3\CMS\Backend\Http\Application;
use TYPO3\CMS\Core\Http\NormalizedParams;
use TYPO3\CMS\Core\Http\ServerRequest;
use TYPO3\TestingFramework\Core\Functional\FunctionalTestCase;

/**
 * @todo cleanup typo3/sysext/backend/Tests/Functional/Http/ActionHandlerTest.php
 * to expose all action test cases as data provider, to be able to test
 * actions internally (there) and via external API requrests here.
 */
final class AppResolverTest extends FunctionalTestCase
{
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
        $request = $this->setUpApiTest('/test/simple/return');
        $response = $this->get(Application::class)->handle($request);
        $result = json_decode((string)$response->getBody());

        self::assertSame('simple', $result);
    }

    #[Test]
    public function stringParameterAction(): void
    {
        $request = $this->setUpApiTest('/test/string/parameter')
            ->withQueryParams(['foo' => 'bar']);
        $response = $this->get(Application::class)->handle($request);
        $result = json_decode((string)$response->getBody());

        self::assertSame(['bar'], $result);
    }

    #[Test]
    public function argumentInPathAction(): void
    {
        $request = $this->setUpApiTest('/test/argument/bar');
        $response = $this->get(Application::class)->handle($request);
        $result = json_decode((string)$response->getBody());

        self::assertSame(['bar'], $result);
    }

    #[Test]
    public function complexAction(): void
    {
        $application = $this->get(Application::class);

        $request = $this->setUpApiTest('/test/complex')
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
