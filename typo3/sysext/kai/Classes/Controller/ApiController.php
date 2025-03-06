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

namespace TYPO3\CMS\Kai\Controller;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Log\LoggerInterface;
use TYPO3\CMS\Backend\Attribute\AsController;
use TYPO3\CMS\Core\Action\Ai\Tool;
use TYPO3\CMS\Core\Action\Ai\ToolProvider;
use TYPO3\CMS\Core\Http\JsonResponse;
use TYPO3\CMS\Core\Site\SiteFinder;
use TYPO3\CMS\Kai\Api\OpenAi;

/**
 * @internal
 */
#[AsController]
final readonly class ApiController
{
    public function __construct(
        private LoggerInterface $logger,
        private SiteFinder $siteFinder,
        private ToolProvider $toolProvider,
    ) {}

    public function suggest(ServerRequestInterface $request): ResponseInterface
    {
        $postData = $request->getParsedBody();

        $siteIdentifier = (string)($postData['site'] ?? '');
        $fieldName = (string)($postData['fieldName'] ?? 'Header');

        if (!$siteIdentifier) {
            return new JsonResponse([
                'status' => 'error',
                'message' => 'Missing site',
            ]);
        }

        $site = $this->siteFinder->getSiteByIdentifier($siteIdentifier);
        $settings = $site->getSettings();
        if (!$settings->has('kai.openai.apiKey')) {
            return new JsonResponse([
                'status' => 'error',
                'message' => 'Missing API key',
            ]);
        }
        $apiKey = $settings->get('kai.openai.apiKey');

        $openai = new OpenAi($apiKey);
        $res = $this->getResponses($openai, sprintf(
            'Generate raw plaintext value for form field named "%s" for a website whose name can be retrieved by a tool.',
            $fieldName,
        ), $site->getConfiguration()['websiteTitle'] ?? '');

        $text = '';
        foreach ($res['output'] ?? [] as $output) {
            if ($output['type'] === 'message' && $output['status'] === 'completed') {
                $text = json_decode($output['content'][0]['text']);//->value;
            }
        }

        return new JsonResponse([
            'status' => 'ok',
            'raw' => $res,
            'result' => [
                'content' => $text,
            ],
        ]);
    }

    private function getTools(string $siteTitle): array
    {
        $tools = [];
        $tools = $this->toolProvider->getTools();
        $tools['website_title'] = new Tool(
            shortname: 'website_title',
            summary: 'Retrieve website title',
            handler: static fn(): object => (object)['title' => $siteTitle],
        );
        return $tools;
    }

    private function getResponses(OpenAi $openai, string|array $prompt, string $siteTitle): array
    {
        $tools = $this->getTools($siteTitle);

        $prompt = is_string($prompt) ? [
            //[ 'role' => 'system', 'content' => 'You are an automcompletion tool that returns raw form input field values.' ],
            [ 'role' => 'user', 'content' => $prompt ],
        ] : $prompt;
        $req = [
            'input' => $prompt,
            'model' => 'gpt-4o-mini',
            'tools' => array_map(
                static fn(Tool $tool): object => (object)[
                    'name' => $tool->shortname,
                    'description' => $tool->summary . PHP_EOL . $tool->description,
                    'parameters' => $tool->inputSchema?->getSerializableData() ?? (object)[
                        'type' => 'object',
                        'properties' => (object)[],
                        'additionalProperties' => false,
                    ],
                    'type' => 'function',
                    'strict' => true,
                ],
                array_values($tools),
            ),
            'text' => [
                // Supply a text format to ensure AI courtesy boilerplate is avoided
                'format' => [
                    'type' => 'json_schema',
                    'name' => 'result',
                    'schema' => [
                        'type' => 'object',
                        'properties' => [
                            'value' => [
                                'type' => 'string',
                                'description' => 'Generated form value',
                            ],
                            'notificationTitle' => [
                                'type' => 'string',
                                'description' => 'Plaintext Notification title',
                            ],
                            'notificationMessage' => [
                                'type' => 'string',
                                'description' => 'Plaintext Notification message',
                            ],
                        ],
                        'required' => ['value', 'notificationTitle', 'notificationMessage'],
                        'additionalProperties' => false,
                    ],
                ],
            ],
        ];
        $this->logger->info('GPT request', ['req' => $req]);
        $data = $openai->responses($req);
        $res = json_decode($data, true, 512, JSON_THROW_ON_ERROR);
        $this->logger->info('GPT response', ['res' => $res]);

        $toolResults = [];
        foreach ($res['output'] ?? [] as $output) {
            if ($output['type'] === 'function_call') {
                // @todo use Actions API
                try {
                    $result = ($tools[$output['name']]->handler)(json_decode($output['arguments']));
                } catch (\RuntimeException $e) {
                    $result = (object)['error' => $e->getMessage()];
                }
                $toolResults[] = [
                    'type' => 'function_call_output',
                    'call_id' => $output['call_id'],
                    'output' => json_encode($result),
                ];
            }
        }

        if ($toolResults !== []) {
            return $this->getResponses($openai, [...$prompt, ...$res['output'], ...$toolResults], $siteTitle);
        }

        return $res;
    }
}
