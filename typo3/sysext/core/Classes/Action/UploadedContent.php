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

namespace TYPO3\CMS\Core\Action;

use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\StreamInterface;

/**
 * Content of a file passed to an action, independent of how it is
 * transferred, e.g. as raw body of an HTTP request
 */
final readonly class UploadedContent
{
    public function __construct(
        public StreamInterface $stream,
        public ?int $size = null,
        public ?string $mediaType = null,
        public ?string $name = null,
    ) {}

    public static function fromRequest(ServerRequestInterface $request): self
    {
        $body = $request->getBody();
        $contentLength = $request->getHeaderLine('Content-Length');
        $mediaType = trim(explode(';', $request->getHeaderLine('Content-Type'), 2)[0]);
        return new self(
            stream: $body,
            size: $body->getSize() ?? (ctype_digit($contentLength) ? (int)$contentLength : null),
            mediaType: $mediaType !== '' ? strtolower($mediaType) : null,
        );
    }
}
