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
use TYPO3\CMS\Core\Action\Error\NotFoundError;
use TYPO3\CMS\Core\Action\ProblemResponseFactory;
use TYPO3\CMS\Core\Http\ResponseFactory;
use TYPO3\CMS\Core\Http\StreamFactory;
use TYPO3\TestingFramework\Core\Unit\UnitTestCase;

final class ProblemResponseFactoryTest extends UnitTestCase
{
    #[Test]
    public function errorIsIdentifiedByExceptionCode(): void
    {
        $subject = new ProblemResponseFactory(new ResponseFactory(), new StreamFactory());
        $response = $subject->createErrorResponse(new NotFoundError('Page not found', 1793878286));

        self::assertSame(
            ['type' => 'https://typo3.org/go/exception/CMS/1793878286', 'title' => 'Not Found', 'status' => 404, 'detail' => 'Page not found'],
            json_decode((string)$response->getBody(), true)
        );
    }

    #[Test]
    public function errorWithoutExceptionCodeHasNoType(): void
    {
        $subject = new ProblemResponseFactory(new ResponseFactory(), new StreamFactory());
        $response = $subject->createErrorResponse(new NotFoundError('Page not found'));

        self::assertSame('about:blank', json_decode((string)$response->getBody(), true)['type']);
    }
}
