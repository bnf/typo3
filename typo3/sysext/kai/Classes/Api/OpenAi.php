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

namespace TYPO3\CMS\Kai\Api;

class OpenAi
{
    private string $engine = 'davinci';
    private string $model = 'text-davinci-002';
    private string $chatModel = 'gpt-3.5-turbo';
    private string $assistantsBetaVersion = 'v1';
    private array $headers;
    private array $contentTypes;
    private int $timeout = 0;
    private object $stream_method;
    private string $proxy = '';
    private array $curlInfo = [];
    private Url $url;

    public function __construct(
        #[\SensitiveParameter]
        string $apiKey,
        string $apiVersion = 'v1',
        string $origin = 'https://api.openai.com',
    ) {
        $this->contentTypes = [
            'application/json' => 'Content-Type: application/json',
            'multipart/form-data' => 'Content-Type: multipart/form-data',
        ];

        $this->headers = [
            $this->contentTypes['application/json'],
            'Authorization: Bearer ' . $apiKey,
        ];

        $this->url = new Url($origin, $apiVersion);
    }

    /**
     * @return array
     * Remove this method from your code before deploying
     */
    public function getCURLInfo()
    {
        return $this->curlInfo;
    }

    /**
     * @return bool|string
     */
    public function listModels(): bool|string
    {
        $url = $this->url->fineTuneModel();

        return $this->sendRequest($url, 'GET');
    }

    public function retrieveModel(string $model): bool|string
    {
        $url = $this->url->fineTuneModel() . '/' . $model;

        return $this->sendRequest($url, 'GET');
    }

    /**
     * @throws \Exception
     */
    public function responses(array $opts, ?callable $stream = null): bool|string
    {
        if (array_key_exists('stream', $opts) && $opts['stream']) {
            if ($stream === null) {
                throw new \Exception(
                    'Please provide a stream function. Check https://github.com/orhanerday/open-ai#stream-example for an example.',
                    1766638558
                );
            }

            $this->stream_method = $stream;
        }

        $opts['model'] = $opts['model'] ?? $this->model;
        $url = $this->url->responsesURL();

        return $this->sendRequest($url, 'POST', $opts);
    }

    /**
     * @throws \Exception
     */
    public function completion(array $opts, ?callable $stream = null): bool|string
    {
        if (array_key_exists('stream', $opts) && $opts['stream']) {
            if ($stream === null) {
                throw new \Exception(
                    'Please provide a stream function. Check https://github.com/orhanerday/open-ai#stream-example for an example.',
                    1766638559
                );
            }

            $this->stream_method = $stream;
        }

        $opts['model'] = $opts['model'] ?? $this->model;
        $url = $this->url->completionsURL();

        return $this->sendRequest($url, 'POST', $opts);
    }

    public function createEdit(array $opts): bool|string
    {
        $url = $this->url->editsUrl();

        return $this->sendRequest($url, 'POST', $opts);
    }

    public function image(array $opts): bool|string
    {
        $url = $this->url->imageUrl() . '/generations';

        return $this->sendRequest($url, 'POST', $opts);
    }

    public function imageEdit(array $opts): bool|string
    {
        $url = $this->url->imageUrl() . '/edits';

        return $this->sendRequest($url, 'POST', $opts);
    }

    public function createImageVariation(array $opts): bool|string
    {
        $url = $this->url->imageUrl() . '/variations';

        return $this->sendRequest($url, 'POST', $opts);
    }

    /**
     * @deprecated
     */
    public function search(array $opts): bool|string
    {
        $engine = $opts['engine'] ?? $this->engine;
        $url = $this->url->searchURL($engine);
        unset($opts['engine']);

        return $this->sendRequest($url, 'POST', $opts);
    }

    /**
     * @deprecated
     */
    public function answer(array $opts): bool|string
    {
        $url = $this->url->answersUrl();

        return $this->sendRequest($url, 'POST', $opts);
    }

    /**
     * @deprecated
     */
    public function classification(array $opts): bool|string
    {
        $url = $this->url->classificationsUrl();

        return $this->sendRequest($url, 'POST', $opts);
    }

    public function moderation(array $opts): bool|string
    {
        $url = $this->url->moderationUrl();

        return $this->sendRequest($url, 'POST', $opts);
    }

    /**
     * @throws \Exception
     */
    public function chat(array $opts, ?callable $stream = null): bool|string
    {
        if ($stream != null && array_key_exists('stream', $opts)) {
            if (! $opts['stream']) {
                throw new \Exception(
                    'Please provide a stream function. Check https://github.com/orhanerday/open-ai#stream-example for an example.',
                    1766638560
                );
            }

            $this->stream_method = $stream;
        }

        $opts['model'] = $opts['model'] ?? $this->chatModel;
        $url = $this->url->chatUrl();

        return $this->sendRequest($url, 'POST', $opts);
    }

    public function transcribe(array $opts): bool|string
    {
        $url = $this->url->transcriptionsUrl();

        return $this->sendRequest($url, 'POST', $opts);
    }

    public function translate(array $opts): bool|string
    {
        $url = $this->url->translationsUrl();

        return $this->sendRequest($url, 'POST', $opts);
    }

    public function uploadFile(array $opts): bool|string
    {
        $url = $this->url->filesUrl();

        return $this->sendRequest($url, 'POST', $opts);
    }

    public function listFiles(): bool|string
    {
        $url = $this->url->filesUrl();

        return $this->sendRequest($url, 'GET');
    }

    public function retrieveFile(string $file_id): bool|string
    {
        $file_id = "/$file_id";
        $url = $this->url->filesUrl() . $file_id;

        return $this->sendRequest($url, 'GET');
    }

    public function retrieveFileContent(string $file_id): bool|string
    {
        $file_id = "/$file_id/content";
        $url = $this->url->filesUrl() . $file_id;

        return $this->sendRequest($url, 'GET');
    }

    public function deleteFile(string $file_id): bool|string
    {
        $file_id = "/$file_id";
        $url = $this->url->filesUrl() . $file_id;

        return $this->sendRequest($url, 'DELETE');
    }

    public function createFineTune(array $opts): bool|string
    {
        $url = $this->url->fineTuneUrl();

        return $this->sendRequest($url, 'POST', $opts);
    }

    public function listFineTunes(): bool|string
    {
        $url = $this->url->fineTuneUrl();

        return $this->sendRequest($url, 'GET');
    }

    public function retrieveFineTune(string $fine_tune_id): bool|string
    {
        $fine_tune_id = "/$fine_tune_id";
        $url = $this->url->fineTuneUrl() . $fine_tune_id;

        return $this->sendRequest($url, 'GET');
    }

    public function cancelFineTune(string $fine_tune_id): bool|string
    {
        $fine_tune_id = "/$fine_tune_id/cancel";
        $url = $this->url->fineTuneUrl() . $fine_tune_id;

        return $this->sendRequest($url, 'POST');
    }

    public function listFineTuneEvents(string $fine_tune_id): bool|string
    {
        $fine_tune_id = "/$fine_tune_id/events";
        $url = $this->url->fineTuneUrl() . $fine_tune_id;

        return $this->sendRequest($url, 'GET');
    }

    public function deleteFineTune(string $fine_tune_id): bool|string
    {
        $fine_tune_id = "/$fine_tune_id";
        $url = $this->url->fineTuneModel() . $fine_tune_id;

        return $this->sendRequest($url, 'DELETE');
    }

    /**
     * @deprecated
     */
    public function engines(): bool|string
    {
        $url = $this->url->enginesUrl();

        return $this->sendRequest($url, 'GET');
    }

    /**
     * @deprecated
     */
    public function engine(string $engine): bool|string
    {
        $url = $this->url->engineUrl($engine);

        return $this->sendRequest($url, 'GET');
    }

    public function embeddings(array $opts): bool|string
    {
        $url = $this->url->embeddings();

        return $this->sendRequest($url, 'POST', $opts);
    }

    public function createAssistant(array $data): bool|string
    {
        $data['model'] = $data['model'] ?? $this->chatModel;
        $this->addAssistantsBetaHeader();
        $url = $this->url->assistantsUrl();

        return $this->sendRequest($url, 'POST', $data);
    }

    public function retrieveAssistant(string $assistantId): bool|string
    {
        $this->addAssistantsBetaHeader();
        $url = $this->url->assistantsUrl() . '/' . $assistantId;

        return $this->sendRequest($url, 'GET');
    }

    public function modifyAssistant(string $assistantId, array $data): bool|string
    {
        $this->addAssistantsBetaHeader();
        $url = $this->url->assistantsUrl() . '/' . $assistantId;

        return $this->sendRequest($url, 'POST', $data);
    }

    public function deleteAssistant(string $assistantId): bool|string
    {
        $this->addAssistantsBetaHeader();
        $url = $this->url->assistantsUrl() . '/' . $assistantId;

        return $this->sendRequest($url, 'DELETE');
    }

    public function listAssistants(array $query = []): bool|string
    {
        $this->addAssistantsBetaHeader();
        $url = $this->url->assistantsUrl();
        if (count($query) > 0) {
            $url .= '?' . http_build_query($query);
        }

        return $this->sendRequest($url, 'GET');
    }

    public function createAssistantFile(string $assistantId, string $fileId): bool|string
    {
        $this->addAssistantsBetaHeader();
        $url = $this->url->assistantsUrl() . '/' . $assistantId . '/files';

        return $this->sendRequest($url, 'POST', ['file_id' => $fileId]);
    }

    public function retrieveAssistantFile(string $assistantId, string $fileId): bool|string
    {
        $this->addAssistantsBetaHeader();
        $url = $this->url->assistantsUrl() . '/' . $assistantId . '/files/' . $fileId;

        return $this->sendRequest($url, 'GET');
    }

    public function listAssistantFiles(string $assistantId, array $query = []): bool|string
    {
        $this->addAssistantsBetaHeader();
        $url = $this->url->assistantsUrl() . '/' . $assistantId . '/files';
        if (count($query) > 0) {
            $url .= '?' . http_build_query($query);
        }

        return $this->sendRequest($url, 'GET');
    }

    public function deleteAssistantFile(string $assistantId, string $fileId): bool|string
    {
        $this->addAssistantsBetaHeader();
        $url = $this->url->assistantsUrl() . '/' . $assistantId . '/files/' . $fileId;

        return $this->sendRequest($url, 'DELETE');
    }

    public function createThread(array $data = []): bool|string
    {
        $this->addAssistantsBetaHeader();
        $url = $this->url->threadsUrl();

        return $this->sendRequest($url, 'POST', $data);
    }

    public function retrieveThread(string $threadId): bool|string
    {
        $this->addAssistantsBetaHeader();
        $url = $this->url->threadsUrl() . '/' . $threadId;

        return $this->sendRequest($url, 'GET');
    }

    public function modifyThread(string $threadId, array $data): bool|string
    {
        $this->addAssistantsBetaHeader();
        $url = $this->url->threadsUrl() . '/' . $threadId;

        return $this->sendRequest($url, 'POST', $data);
    }

    public function deleteThread(string $threadId): bool|string
    {
        $this->addAssistantsBetaHeader();
        $url = $this->url->threadsUrl() . '/' . $threadId;

        return $this->sendRequest($url, 'DELETE');
    }

    public function createThreadMessage(string $threadId, array $data): bool|string
    {
        $this->addAssistantsBetaHeader();
        $url = $this->url->threadsUrl() . '/' . $threadId . '/messages';

        return $this->sendRequest($url, 'POST', $data);
    }

    public function retrieveThreadMessage(string $threadId, string $messageId): bool|string
    {
        $this->addAssistantsBetaHeader();
        $url = $this->url->threadsUrl() . '/' . $threadId . '/messages/' . $messageId;

        return $this->sendRequest($url, 'GET');
    }

    public function modifyThreadMessage(string $threadId, string $messageId, array $data): bool|string
    {
        $this->addAssistantsBetaHeader();
        $url = $this->url->threadsUrl() . '/' . $threadId . '/messages/' . $messageId;

        return $this->sendRequest($url, 'POST', $data);
    }

    public function listThreadMessages(string $threadId, array $query = []): bool|string
    {
        $this->addAssistantsBetaHeader();
        $url = $this->url->threadsUrl() . '/' . $threadId . '/messages';
        if (count($query) > 0) {
            $url .= '?' . http_build_query($query);
        }

        return $this->sendRequest($url, 'GET');
    }

    public function retrieveMessageFile(string $threadId, string $messageId, string $fileId): bool|string
    {
        $this->addAssistantsBetaHeader();
        $url = $this->url->threadsUrl() . '/' . $threadId . '/messages/' . $messageId . '/files/' . $fileId;

        return $this->sendRequest($url, 'GET');
    }

    public function listMessageFiles(string $threadId, string $messageId, array $query = []): bool|string
    {
        $this->addAssistantsBetaHeader();
        $url = $this->url->threadsUrl() . '/' . $threadId . '/messages/' . $messageId . '/files';
        if (count($query) > 0) {
            $url .= '?' . http_build_query($query);
        }

        return $this->sendRequest($url, 'GET');
    }

    public function createRun(string $threadId, array $data, ?callable $stream = null): bool|string
    {
        if (array_key_exists('stream', $data) && $data['stream']) {
            if ($stream === null) {
                throw new \Exception(
                    'Please provide a stream function. Check https://github.com/orhanerday/open-ai#stream-example for an example.',
                    1766638561
                );
            }

            $this->stream_method = $stream;
        }

        $this->addAssistantsBetaHeader();
        $url = $this->url->threadsUrl() . '/' . $threadId . '/runs';

        return $this->sendRequest($url, 'POST', $data);
    }

    public function retrieveRun(string $threadId, string $runId): bool|string
    {
        $this->addAssistantsBetaHeader();
        $url = $this->url->threadsUrl() . '/' . $threadId . '/runs/' . $runId;

        return $this->sendRequest($url, 'GET');
    }

    public function modifyRun(string $threadId, string $runId, array $data): bool|string
    {
        $this->addAssistantsBetaHeader();
        $url = $this->url->threadsUrl() . '/' . $threadId . '/runs/' . $runId;

        return $this->sendRequest($url, 'POST', $data);
    }

    public function listRuns(string $threadId, array $query = []): bool|string
    {
        $this->addAssistantsBetaHeader();
        $url = $this->url->threadsUrl() . '/' . $threadId . '/runs';
        if (count($query) > 0) {
            $url .= '?' . http_build_query($query);
        }

        return $this->sendRequest($url, 'GET');
    }

    public function submitToolOutputs(string $threadId, string $runId, array $outputs, ?callable $stream = null): bool|string
    {
        if (array_key_exists('stream', $outputs) && $outputs['stream']) {
            if ($stream === null) {
                throw new \Exception(
                    'Please provide a stream function. Check https://github.com/orhanerday/open-ai#stream-example for an example.',
                    1766638562
                );
            }

            $this->stream_method = $stream;
        }

        $this->addAssistantsBetaHeader();
        $url = $this->url->threadsUrl() . '/' . $threadId . '/runs/' . $runId . '/submit_tool_outputs';

        return $this->sendRequest($url, 'POST', $outputs);
    }

    public function cancelRun(string $threadId, string $runId): bool|string
    {
        $this->addAssistantsBetaHeader();
        $url = $this->url->threadsUrl() . '/' . $threadId . '/runs/' . $runId . '/cancel';

        return $this->sendRequest($url, 'POST');
    }

    public function createThreadAndRun(array $data): bool|string
    {
        $this->addAssistantsBetaHeader();
        $url = $this->url->threadsUrl() . '/runs';

        return $this->sendRequest($url, 'POST', $data);
    }

    public function retrieveRunStep(string $threadId, string $runId, string $stepId): bool|string
    {
        $this->addAssistantsBetaHeader();
        $url = $this->url->threadsUrl() . '/' . $threadId . '/runs/' . $runId . '/steps/' . $stepId;

        return $this->sendRequest($url, 'GET');
    }

    public function listRunSteps(string $threadId, string $runId, array $query = []): bool|string
    {
        $this->addAssistantsBetaHeader();
        $url = $this->url->threadsUrl() . '/' . $threadId . '/runs/' . $runId . '/steps';
        if (count($query) > 0) {
            $url .= '?' . http_build_query($query);
        }

        return $this->sendRequest($url, 'GET');
    }

    public function tts(array $opts): bool|string
    {
        $url = $this->url->ttsUrl();

        return $this->sendRequest($url, 'POST', $opts);
    }

    public function setTimeout(int $timeout): void
    {
        $this->timeout = $timeout;
    }

    public function setProxy(string $proxy): void
    {
        if ($proxy && !str_contains($proxy, '://')) {
            $proxy = 'https://' . $proxy;
        }
        $this->proxy = $proxy;
    }

    public function setHeader(array $header): void
    {
        if ($header) {
            foreach ($header as $key => $value) {
                $this->headers[$key] = $value;
            }
        }
    }

    public function setORG(string $org): void
    {
        if ($org !== '') {
            $this->headers[] = "OpenAI-Organization: $org";
        }
    }

    public function setAssistantsBetaVersion(string $version): void
    {
        if ($version !== '') {
            $this->assistantsBetaVersion = $version;
        }
    }

    private function addAssistantsBetaHeader(): void
    {
        $this->headers[] = 'OpenAI-Beta: assistants=' . $this->assistantsBetaVersion;
    }

    private function sendRequest(string $url, string $method, array $opts = []): bool|string
    {
        $post_fields = json_encode($opts);

        if (array_key_exists('file', $opts) || array_key_exists('image', $opts)) {
            $this->headers[0] = $this->contentTypes['multipart/form-data'];
            $post_fields = $opts;
        } else {
            $this->headers[0] = $this->contentTypes['application/json'];
        }
        $curl_info = [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => '',
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => $this->timeout,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => $method,
            CURLOPT_POSTFIELDS => $post_fields,
            CURLOPT_HTTPHEADER => $this->headers,
        ];

        if ($opts == []) {
            unset($curl_info[CURLOPT_POSTFIELDS]);
        }

        if (! empty($this->proxy)) {
            $curl_info[CURLOPT_PROXY] = $this->proxy;
        }

        if (array_key_exists('stream', $opts) && $opts['stream']) {
            $curl_info[CURLOPT_WRITEFUNCTION] = $this->stream_method;
        }

        $curl = curl_init();

        curl_setopt_array($curl, $curl_info);
        $response = curl_exec($curl);

        $info = curl_getinfo($curl);
        $this->curlInfo = $info;

        curl_close($curl);

        if (! $response) {
            throw new \Exception(curl_error($curl), 1766638563);
        }

        return $response;
    }
}
