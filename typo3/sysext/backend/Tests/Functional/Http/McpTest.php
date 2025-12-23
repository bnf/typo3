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
use Psr\Http\Message\ServerRequestInterface;
use TYPO3\CMS\Backend\Domain\Model\AccessToken;
use TYPO3\CMS\Backend\Http\Application;
use TYPO3\CMS\Core\Authentication\BackendUserAuthentication;
use TYPO3\CMS\Core\Http\NormalizedParams;
use TYPO3\CMS\Core\Http\ServerRequest;
use TYPO3\CMS\Core\Http\StreamFactory;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\TestingFramework\Core\Functional\FunctionalTestCase;

final class McpTest extends FunctionalTestCase
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
    public function initializeReturnsServerInformation(): void
    {
        $response = $this->sendMcpMessage([
            'jsonrpc' => '2.0',
            'id' => 1,
            'method' => 'initialize',
            'params' => [
                'protocolVersion' => '2025-06-18',
                'capabilities' => new \stdClass(),
                'clientInfo' => ['name' => 'test-client', 'version' => '1.0.0'],
            ],
        ]);
        $result = json_decode((string)$response->getBody());

        self::assertSame(200, $response->getStatusCode());
        self::assertSame('2.0', $result->jsonrpc);
        self::assertSame(1, $result->id);
        self::assertSame('2025-06-18', $result->result->protocolVersion);
        self::assertSame('TYPO3 CMS', $result->result->serverInfo->name);
        self::assertTrue(isset($result->result->capabilities->tools));
    }

    #[Test]
    public function requestIdIsReturnedAsGiven(): void
    {
        $response = $this->sendMcpMessage([
            'jsonrpc' => '2.0',
            'id' => 'request-1',
            'method' => 'initialize',
        ]);
        $result = json_decode((string)$response->getBody());

        self::assertSame('request-1', $result->id);
    }

    #[Test]
    public function notificationIsAcceptedWithoutResponseBody(): void
    {
        $response = $this->sendMcpMessage([
            'jsonrpc' => '2.0',
            'method' => 'notifications/initialized',
        ]);

        self::assertSame(204, $response->getStatusCode());
        self::assertSame('', (string)$response->getBody());
    }

    #[Test]
    public function unknownMethodReturnsMethodNotFoundError(): void
    {
        $response = $this->sendMcpMessage([
            'jsonrpc' => '2.0',
            'id' => 1,
            'method' => 'unknown/method',
        ]);
        $result = json_decode((string)$response->getBody());

        self::assertSame(1, $result->id);
        self::assertSame(-32601, $result->error->code);
        self::assertSame('Method not found: unknown/method', $result->error->message);
    }

    #[Test]
    public function toolsListContainsActionsAsTools(): void
    {
        $tools = $this->listTools();

        self::assertArrayHasKey('fetch_test_simple_return', $tools);
        self::assertArrayHasKey('fetch_test_string_parameter', $tools);
        self::assertArrayHasKey('fetch_test_complex', $tools);
        self::assertArrayHasKey('fetch_test_empty_response', $tools);
    }

    #[Test]
    public function toolsListDoesNotContainMcpServerItself(): void
    {
        $tools = $this->listTools();

        self::assertArrayNotHasKey('dispatch_mcp', $tools);
    }

    #[Test]
    public function toolsListDescribesInputSchemaAndAnnotations(): void
    {
        $tool = $this->listTools()['fetch_test_string_parameter'];

        self::assertSame('object', $tool->inputSchema->type);
        self::assertSame('string', $tool->inputSchema->properties->foo->type);
        self::assertSame(['foo'], $tool->inputSchema->required);
        self::assertTrue($tool->annotations->readOnlyHint);
        self::assertFalse($tool->annotations->destructiveHint);
        self::assertFalse($tool->annotations->idempotentHint);
    }

    #[Test]
    public function toolsListWrapsNonObjectOutputSchema(): void
    {
        $tool = $this->listTools()['fetch_test_simple_return'];

        self::assertSame('object', $tool->outputSchema->type);
        self::assertSame(['data'], $tool->outputSchema->required);
        self::assertSame('string', $tool->outputSchema->properties->data->type);
    }

    #[Test]
    public function toolsListKeepsObjectOutputSchema(): void
    {
        $tool = $this->listTools()['fetch_test_complex'];

        self::assertSame('object', $tool->outputSchema->type);
        self::assertTrue(isset($tool->outputSchema->properties->record));
    }

    #[Test]
    public function toolsCallReturnsScalarResultAsData(): void
    {
        $result = $this->callTool('fetch_test_simple_return');

        self::assertEquals((object)['data' => 'simple'], $result->result->structuredContent);
        self::assertSame([], $result->result->content);
    }

    #[Test]
    public function toolsCallPassesArguments(): void
    {
        $result = $this->callTool('fetch_test_string_parameter', ['foo' => 'bar']);

        self::assertEquals((object)['data' => ['bar']], $result->result->structuredContent);
    }

    #[Test]
    public function toolsCallPassesArgumentsOfRoutePlaceholders(): void
    {
        $result = $this->callTool('fetch_test_argument_by_foo', ['foo' => 'bar']);

        self::assertEquals((object)['data' => ['bar']], $result->result->structuredContent);
    }

    #[Test]
    public function toolsCallReturnsObjectResultUnwrapped(): void
    {
        $result = $this->callTool('fetch_test_complex', ['string' => 'Dummy', 'int' => 7, 'stringmap' => ['foo' => 'bar']]);

        self::assertSame('Dummy', $result->result->structuredContent->string);
        self::assertSame(7, $result->result->structuredContent->int);
    }

    #[Test]
    public function toolsCallReturnsOkForEmptyResult(): void
    {
        $result = $this->callTool('fetch_test_empty_response');

        self::assertEquals((object)['data' => 'OK'], $result->result->structuredContent);
    }

    #[Test]
    public function toolsCallActsAsAuthenticatedBackendUser(): void
    {
        $result = $this->callTool('fetch_test_whoami');

        self::assertEquals((object)['data' => 'admin'], $result->result->structuredContent);
    }

    #[Test]
    public function toolsCallForUnknownToolReturnsInvalidParamsError(): void
    {
        $result = $this->callTool('fetch_unknown_tool');

        self::assertSame(-32602, $result->error->code);
        self::assertSame('Unknown tool: fetch_unknown_tool', $result->error->message);
    }

    #[Test]
    public function toolsCallWithInvalidArgumentsReturnsInvalidParamsError(): void
    {
        $result = $this->callTool('fetch_test_string_parameter', ['foo' => 123]);

        self::assertSame(1, $result->id);
        self::assertSame(-32602, $result->error->code);
        self::assertStringContainsString('foo', $result->error->message);
    }

    #[Test]
    public function toolsCallWithInvalidResultReturnsInternalError(): void
    {
        $result = $this->callTool('fetch_test_invalid_result');

        self::assertSame(1, $result->id);
        self::assertSame(-32603, $result->error->code);
    }

    #[Test]
    public function toolsCallWithFailingActionReturnsToolError(): void
    {
        $result = $this->callTool('fetch_test_not_found');

        self::assertTrue($result->result->isError);
        self::assertEquals([(object)['type' => 'text', 'text' => 'Record not found']], $result->result->content);
    }

    #[Test]
    public function missingTokenIsRejected(): void
    {
        $request = $this->createMcpRequest([
            'jsonrpc' => '2.0',
            'id' => 1,
            'method' => 'initialize',
        ])->withoutHeader('Authorization');
        $response = $this->get(Application::class)->handle($request);

        self::assertSame(401, $response->getStatusCode());
    }

    /**
     * @return array<string, \stdClass>
     */
    private function listTools(): array
    {
        $response = $this->sendMcpMessage([
            'jsonrpc' => '2.0',
            'id' => 1,
            'method' => 'tools/list',
        ]);
        $result = json_decode((string)$response->getBody());
        $tools = [];
        foreach ($result->result->tools as $tool) {
            $tools[$tool->name] = $tool;
        }
        return $tools;
    }

    private function callTool(string $name, array $arguments = []): \stdClass
    {
        $response = $this->sendMcpMessage([
            'jsonrpc' => '2.0',
            'id' => 1,
            'method' => 'tools/call',
            'params' => [
                'name' => $name,
                'arguments' => (object)$arguments,
            ],
        ]);
        return json_decode((string)$response->getBody());
    }

    private function sendMcpMessage(array $message): ResponseInterface
    {
        return $this->get(Application::class)->handle($this->createMcpRequest($message));
    }

    private function createMcpRequest(array $message): ServerRequestInterface
    {
        return $this->setUpAuthenticatedRequest('https://typo3-testing.local/typo3/api/mcp', 1, 'POST')
            ->withHeader('Content-Type', 'application/json')
            ->withBody(new StreamFactory()->createStream(json_encode($message)));
    }

    /**
     * Sets up Backend User which is already available in db
     * @todo move into testing framework
     */
    private function setUpAuthenticatedRequest(string $url, int $userUid, string $method = 'GET'): ServerRequestInterface
    {
        $userRow = $this->getBackendUserRecordFromDatabase($userUid);
        if (!is_array($userRow)) {
            throw new \RuntimeException(
                'The BE User with the UID ' . $userUid . ' does not exist in the database.',
                1791980412
            );
        }

        $backendUser = GeneralUtility::makeInstance(BackendUserAuthentication::class);
        $session = $backendUser->createUserSession($userRow);
        $token = new AccessToken($userRow['username'])->toString();
        return $this->createServerRequest($url, $method)
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
        if (isset($requestUrlParts['scheme'])) {
            if ($requestUrlParts['scheme'] === 'https') {
                $serverParams['HTTPS'] = 'on';
                $serverParams['SERVER_PORT'] = '443';
            } else {
                $serverParams['SERVER_PORT'] = '80';
            }
        }
        if (isset($requestUrlParts['port'])) {
            $serverParams['SERVER_PORT'] = $requestUrlParts['port'];
        }
        $request = new ServerRequest($url, $method, null, [], $serverParams);
        return $request->withAttribute('normalizedParams', NormalizedParams::createFromRequest($request));
    }
}
