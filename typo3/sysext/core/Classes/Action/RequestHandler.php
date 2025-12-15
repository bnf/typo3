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
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\StreamFactoryInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\Attribute\Exclude;
use TYPO3\CMS\Core\Context\Context;
use TYPO3\CMS\Core\JsonSchema\Hydrator;
use TYPO3\CMS\Core\JsonSchema\SchemaNarrower;

/**
 * @internal
 */
#[Exclude]
final readonly class RequestHandler implements RequestHandlerInterface
{
    public function __construct(
        private ActionDescriptor $action,
        private ActionRegistry $actionRegistry,
        private ActionInvoker $actionInvoker,
        private ResponseFactoryInterface $responseFactory,
        private StreamFactoryInterface $streamFactory,
        private Context $context,
        private LoggerInterface $logger,
        private SchemaNarrower $schemaNarrower,
    ) {}

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        $id = $this->action->id;

        $currentScopes = $request->getAttribute('api.scopes', []);
        foreach ($this->action->scopes as $scope) {
            if (!isset($currentScopes[$scope])) {
                // @todo add WWW-Authenticate including required scopes?
                return $this->badRequest(403, 'Missing scope: ' . $scope);
            }
        }

        $requireJsonContentType = !in_array($request->getMethod(), ['GET', 'HEAD', 'DELETE'], true);
        if ($requireJsonContentType) {
            $contentType = $request->getHeader('Content-Type');
            if (count($contentType) !== 1) {
                return $this->badRequest(415, 'Unsupported Media Type');
            }
            $mediaType = explode(';', $contentType[0], 2)[0];
            if ($mediaType !== 'application/json') {
                /*
                // @todo add Accept-Post/Accept-Patch
                $isPost = $request->getMethod() === 'POST';
                $isPatch = $request->getMethod() === 'PATCH';
                */
                return $this->badRequest(415, 'Unsupported Media Type');
            }
        }
        try {
            $arguments = $this->mapArgumentsFromRequest($request);
        } catch (\InvalidArgumentException $e) {
            return $this->badRequest(400, $e->getMessage());
        }
        $context = new ActionContext(
            $this->context,
            $GLOBALS['BE_USER'],
            $GLOBALS['LANG'],
            $request,
            $request->getAttribute('api.scopes', []),
        );
        try {
            $result = $this->actionInvoker->invoke($this->action->id, (object)$arguments, $context, true, false);
        } catch (\InvalidArgumentException $e) {
            return $this->badRequest(400, $e->getMessage());
        } catch (ActionExceptionInterface $e) {
            return $this->badRequest($e->getHttpStatusCode(), $e->getMessage());
        } catch (\DomainException $e) {
            $this->logger->debug('Action {id} returned an error', [
                'id' => $this->action->id,
                'exception' => $e,
            ]);
            return $this->badRequest(500, 'Action produced invalid result that did not conform the schema: ' . $e->getMessage());
        }

        if ($result === null) {
            return $this->responseFactory->createResponse(204);
        }

        return $this->jsonResponse($result);
    }

    /**
     * @throws \InvalidArgumentException
     */
    private function mapArgumentsFromRequest(ServerRequestInterface $request): object
    {
        $arguments = new \stdClass();
        $requestBody = null;
        $routing = $request->getAttribute('routing');
        foreach ($this->action->parameters as $name => $parameter) {
            $value = null;
            $hasValue = false;
            $source = $parameter['http']['source'];
            $schema = $parameter['schema'];
            $jsonEncoded = false;
            if ($source === 'body') {
                $requestBody ??= $this->getJsonRequestBody($request);
                if (isset($requestBody->{$name})) {
                    $hasValue = true;
                    $value = $requestBody->{$name};
                }
            } elseif ($source === 'route') {
                if (isset($routing->getArguments()[$name])) {
                    $hasValue = true;
                    $value = $routing->getArguments()[$name];
                }
            } else {
                if (isset($request->getQueryParams()[$name])) {
                    $hasValue = true;
                    $value = $request->getQueryParams()[$name];
                    if ($parameter['http']['jsonEncoded']) {
                        try {
                            $value = json_decode($value, false, 512, JSON_THROW_ON_ERROR);
                        } catch (\JsonException $e) {
                            throw new \InvalidArgumentException(
                                sprintf(
                                    'Misformed JSON parameter value for "%s": %s',
                                    $name,
                                    $e->getMessage(),
                                ),
                                1789812388,
                                $e
                            );
                        }
                    }
                }
            }

            if (!$hasValue) {
                if ($parameter['optional']) {
                    continue;
                }
                throw new \InvalidArgumentException(
                    sprintf(
                        'Missing parameter value for "%s"',
                        $name,
                    ),
                    1766247070
                );
            }

            $schema = $this->actionRegistry->provideRefs($schema);

            $hydrator = new Hydrator();
            if (is_string($value)) {
                $value = $hydrator->coerceScalars($value, $schema);
            }
            $schema = $this->schemaNarrower->narrow($value, $schema);

            try {
                $this->actionInvoker->validate($value, $schema->toPlainObject());
            } catch (\InvalidArgumentException $e) {
                throw new \InvalidArgumentException(
                    sprintf(
                        'Invalid parameter value for "%s": %s',
                        $name,
                        $e->getMessage(),
                    ),
                    1766057431,
                    $e
                );
            }
            $arguments->{$name} = $value;
        }
        return $arguments;
    }

    /**
     * @throws \InvalidArgumentException
     */
    private function getJsonRequestBody(ServerRequestInterface $request): \stdClass
    {
        $bodyContent = null;
        if ($request->getHeaderLine('Content-Type') === 'application/json') {
            $body = (string)$request->getBody();
            $bodyContent = json_decode($body, false, 512, JSON_THROW_ON_ERROR);
        }
        if (!$bodyContent instanceof \stdClass) {
            throw new \InvalidArgumentException(
                'Invalid request body',
                1766057432,
            );
        }
        return $bodyContent;
    }

    private function badRequest(int $status, string $reason): ResponseInterface
    {
        return $this->jsonResponse((object)['error' => $reason], $status);
    }

    private function jsonResponse(mixed $data, int $status = 200): ResponseInterface
    {
        return $this->responseFactory
            ->createResponse($status)
            ->withHeader('Content-Type', 'application/json; charset=utf-8')
            ->withBody(
                $this->streamFactory->createStream(json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE))
            );
    }
}
