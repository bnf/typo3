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

namespace TYPO3\CMS\Kai\Action;

use Psr\Log\LoggerInterface;
use TYPO3\CMS\Core\Action\ActionContext;
use TYPO3\CMS\Core\Action\ActionException;
use TYPO3\CMS\Core\Action\Ai\OpenAiToolProvider;
use TYPO3\CMS\Core\Action\Ai\Tool;
use TYPO3\CMS\Core\Action\Ai\ToolContext;
use TYPO3\CMS\Core\Attribute\AsAction;
use TYPO3\CMS\Core\Exception\SiteNotFoundException;
use TYPO3\CMS\Core\Site\SiteFinder;
use TYPO3\CMS\Kai\Api\OpenAi;

/**
 * @internal
 */
final readonly class Suggest
{
    public function __construct(
        private LoggerInterface $logger,
        private SiteFinder $siteFinder,
        private OpenAiToolProvider $toolProvider,
    ) {}

    /**
     * @return array{
     *   status: string,
     *   result: array{
     *      content: mixed|array{
     *        value: string,
     *        notificationTitle: string,
     *        notificationMessage: string
     *      }
     *   },
     *   raw: mixed
     * }
     */
    #[AsAction(
        name: 'kai/suggest',
        method: 'POST',
        ajaxAlias: 'kai_suggest',
    )]
    public function suggest(
        ActionContext $context,
        string $site,
        string $fieldName = 'Header',
    ): array {
        try {
            $site = $this->siteFinder->getSiteByIdentifier($site);
        } catch (SiteNotFoundException $e) {
            throw new ActionException('Site not found', 1767891009, $e);
        }
        $settings = $site->getSettings();
        if (!$settings->has('kai.openai.apiKey')) {
            throw new ActionException('Site is not enabled for AI usage (missing API key)', 1767891010);
        }
        $apiKey = $settings->get('kai.openai.apiKey');

        $openai = new OpenAi($apiKey);
        $res = $this->getResponses($context, $openai, sprintf(
            'Generate raw plaintext value for form field named "%s" for a website whose name can be retrieved by a tool.',
            $fieldName,
        ), $site->getConfiguration()['websiteTitle'] ?? '');

        $text = '';
        foreach ($res['output'] ?? [] as $output) {
            if ($output['type'] === 'message' && $output['status'] === 'completed') {
                $text = json_decode($output['content'][0]['text']);//->value;
            }
        }

        return [
            'status' => 'ok',
            'result' => [
                'content' => $text,
            ],
            'raw' => $res,
        ];
    }

    private function getTools(string $siteTitle): array
    {
        return [
            ...$this->toolProvider->getTools(),
            ...[
                [
                    'name' => 'website_title',
                    'description' => 'Receive website title',
                    'parameters' => (object)[
                        'type' => 'object',
                        'properties' => (object)[],
                        'additionalProperties' => false,
                    ],
                    'type' => 'function',
                    'strict' => true,
                ],
            ],
        ];
    }

    private function getResponses(ActionContext $context, OpenAi $openai, string|array $prompt, string $siteTitle): array
    {
        $prompt = is_string($prompt) ? [
            //[ 'role' => 'system', 'content' => 'You are an automcompletion tool that returns raw form input field values.' ],
            [ 'role' => 'user', 'content' => $prompt ],
        ] : $prompt;
        $req = [
            'input' => $prompt,
            'model' => 'gpt-4o-mini',
            'tools' => $this->getTools($siteTitle),
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
                try {
                    if ($output['name'] === 'website_title') {
                        $result = (object)['title' => $siteTitle];
                    } else {
                        $result = $this->toolProvider->callTool(
                            $output['name'],
                            // @todo hydrate
                            json_decode($output['arguments']),
                            ToolContext::fromActionContext($context),
                        );
                    }
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
            return $this->getResponses($context, $openai, [...$prompt, ...$res['output'], ...$toolResults], $siteTitle);
        }

        return $res;
    }
}
