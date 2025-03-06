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

class Url
{
    public function __construct(
        public string $origin = 'https://api.openai.com',
        public string $apiVersion = 'v1',
    ) {}

    public function getBaseUri(): string
    {
        return $this->origin . '/' . $this->apiVersion;
    }

    public function responsesURL(): string
    {
        return $this->getBaseUri() . '/responses';
    }

    public function completionsURL(): string
    {
        return $this->getBaseUri() . '/completions';
    }

    public function editsUrl(): string
    {
        return $this->getBaseUri() . '/edits';
    }

    public function searchURL(string $engine): string
    {
        return $this->getBaseUri() . '/engines/' . $engine . '/search';
    }

    public function enginesUrl(): string
    {
        return $this->getBaseUri() . '/engines';
    }

    public function engineUrl(string $engine): string
    {
        return $this->getBaseUri() . '/engines/' . $engine;
    }

    public function classificationsUrl(): string
    {
        return $this->getBaseUri() . '/classifications';
    }

    public function moderationUrl(): string
    {
        return $this->getBaseUri() . '/moderations';
    }

    public function transcriptionsUrl(): string
    {
        return $this->getBaseUri() . '/audio/transcriptions';
    }

    public function translationsUrl(): string
    {
        return $this->getBaseUri() . '/audio/translations';
    }

    public function filesUrl(): string
    {
        return $this->getBaseUri() . '/files';
    }

    public function fineTuneUrl(): string
    {
        return $this->getBaseUri() . '/fine_tuning/jobs';
    }

    public function fineTuneModel(): string
    {
        return $this->getBaseUri() . '/models';
    }

    public function answersUrl(): string
    {
        return $this->getBaseUri() . '/answers';
    }

    public function imageUrl(): string
    {
        return $this->getBaseUri() . '/images';
    }

    public function embeddings(): string
    {
        return $this->getBaseUri() . '/embeddings';
    }

    public function chatUrl(): string
    {
        return $this->getBaseUri() . '/chat/completions';
    }

    public function assistantsUrl(): string
    {
        return $this->getBaseUri() . '/assistants';
    }

    public function threadsUrl(): string
    {
        return $this->getBaseUri() . '/threads';
    }

    public function ttsUrl(): string
    {
        return $this->getBaseUri() . '/audio/speech';
    }
}
