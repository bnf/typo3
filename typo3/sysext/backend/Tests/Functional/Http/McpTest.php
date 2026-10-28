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
use TYPO3\CMS\Backend\Http\Application;
use TYPO3\CMS\Core\Http\StreamFactory;
use TYPO3\TestingFramework\Core\Functional\FunctionalTestCase;

final class McpTest extends FunctionalTestCase
{
    use AuthenticatedRequestTrait;

    protected array $testExtensionsToLoad = [
        'typo3/sysext/core/Tests/Functional/Fixtures/Extensions/test_action',
    ];

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
    public function toolsListIsIdenticalForUsersOfDifferentRoles(): void
    {
        self::assertEquals($this->listTools(1), $this->listTools(3));
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
    public function toolsCallRejectsRecordOfTableNotModifiableByUser(): void
    {
        $result = $this->callTool('create_records_by_schema_by_pid', [
            'schema' => 'pages',
            'pid' => 1,
            'record' => ['_schema' => 'pages', 'doktype' => 1, 'title' => 'Page'],
        ], 3);

        self::assertTrue($result->result->isError);
        self::assertSame('No permission to modify table pages, field pages.doktype', $result->result->content[0]->text);
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
    private function listTools(int $userUid = 1): array
    {
        $response = $this->sendMcpMessage([
            'jsonrpc' => '2.0',
            'id' => 1,
            'method' => 'tools/list',
        ], $userUid);
        $result = json_decode((string)$response->getBody());
        $tools = [];
        foreach ($result->result->tools as $tool) {
            $tools[$tool->name] = $tool;
        }
        return $tools;
    }

    private function callTool(string $name, array $arguments = [], int $userUid = 1): \stdClass
    {
        $response = $this->sendMcpMessage([
            'jsonrpc' => '2.0',
            'id' => 1,
            'method' => 'tools/call',
            'params' => [
                'name' => $name,
                'arguments' => (object)$arguments,
            ],
        ], $userUid);
        return json_decode((string)$response->getBody());
    }

    private function sendMcpMessage(array $message, int $userUid = 1): ResponseInterface
    {
        return $this->get(Application::class)->handle($this->createMcpRequest($message, $userUid));
    }

    private function createMcpRequest(array $message, int $userUid = 1): ServerRequestInterface
    {
        return $this->setUpAuthenticatedRequest('https://typo3-testing.local/typo3/api/mcp', $userUid, 'POST')
            ->withHeader('Content-Type', 'application/json')
            ->withBody((new StreamFactory())->createStream(json_encode($message)));
    }
}
