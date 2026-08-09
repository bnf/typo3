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
use Psr\Http\Message\ServerRequestInterface;
use TYPO3\CMS\Backend\Domain\Model\AccessToken;
use TYPO3\CMS\Backend\Http\Application;
use TYPO3\CMS\Core\Authentication\BackendUserAuthentication;
use TYPO3\CMS\Core\Http\NormalizedParams;
use TYPO3\CMS\Core\Http\ServerRequest;
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

    #[Test]
    public function emptyResponseAction(): void
    {
        $application = $this->get(Application::class);

        $request = $this->setUpApiTest('/test/empty-response');

        $response = $this->get(Application::class)->handle($request);
        $statusCode = $response->getStatusCode();
        $body = (string)$response->getBody();

        self::assertSame(204, $statusCode);
        self::assertEquals('', $body);
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
        $token = (new AccessToken($userRow['username']))->toString();
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
