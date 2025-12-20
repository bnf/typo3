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

namespace TYPO3\CMS\Core\Tests\Unit\Action;

use PHPUnit\Framework\Attributes\Test;
use TYPO3\CMS\Core\Action\UploadedContent;
use TYPO3\CMS\Core\Http\ServerRequest;
use TYPO3\CMS\Core\Http\StreamFactory;
use TYPO3\TestingFramework\Core\Unit\UnitTestCase;

final class UploadedContentTest extends UnitTestCase
{
    #[Test]
    public function fromRequestUsesBodyAndContentType(): void
    {
        $request = new ServerRequest('https://example.com/typo3/api/v1/files', 'POST')
            ->withHeader('Content-Type', 'Image/PNG; charset=binary')
            ->withBody(new StreamFactory()->createStream('content'));

        $content = UploadedContent::fromRequest($request);

        self::assertSame('content', (string)$content->stream);
        self::assertSame(7, $content->size);
        self::assertSame('image/png', $content->mediaType);
        self::assertNull($content->name);
    }

    #[Test]
    public function fromRequestWithoutContentTypeHasNoMediaType(): void
    {
        $request = new ServerRequest('https://example.com/typo3/api/v1/files', 'POST')
            ->withBody(new StreamFactory()->createStream(''));

        self::assertNull(UploadedContent::fromRequest($request)->mediaType);
    }
}
