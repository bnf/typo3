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

use Psr\Http\Message\ResponseFactoryInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\StreamFactoryInterface;
use TYPO3\CMS\Core\Action\Error\InsufficientScopeError;
use TYPO3\CMS\Core\Action\Error\InvalidRequestError;
use TYPO3\CMS\Core\Information\Typo3Information;

/**
 * Creates error responses as problem details, see RFC 9457
 *
 * @internal
 */
final readonly class ProblemResponseFactory
{
    public function __construct(
        private ResponseFactoryInterface $responseFactory,
        private StreamFactoryInterface $streamFactory,
    ) {}

    /**
     * The problem type of an action error is identified by the exception code,
     * which resolves to the documentation of the exception
     */
    public function createErrorResponse(ActionExceptionInterface $e): ResponseInterface
    {
        $response = $this->createResponse(
            $e->getHttpStatusCode(),
            $e->getMessage(),
            $e instanceof InvalidRequestError && $e->errors !== [] ? ['errors' => $e->errors] : [],
            $e->getCode() > 0 ? Typo3Information::URL_EXCEPTION . $e->getCode() : 'about:blank',
        );
        if ($e instanceof InsufficientScopeError) {
            $response = $response->withHeader('WWW-Authenticate', sprintf('Bearer error="insufficient_scope", scope="%s"', $e->scope));
        }
        return $response;
    }

    /**
     * @param array<string, mixed> $extensions Additional members of the problem
     * @param string $type The problem type, `about:blank` for problems without semantics beyond the status code
     */
    public function createResponse(int $status, ?string $detail = null, array $extensions = [], string $type = 'about:blank'): ResponseInterface
    {
        $response = $this->responseFactory->createResponse($status);
        $problem = [
            'type' => $type,
            'title' => $response->getReasonPhrase(),
            'status' => $status,
            ...($detail !== null ? ['detail' => $detail] : []),
            ...$extensions,
        ];
        return $response
            ->withHeader('Content-Type', 'application/problem+json')
            ->withBody($this->streamFactory->createStream(
                json_encode($problem, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR)
            ));
    }
}
