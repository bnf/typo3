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

//use cebe\openapi\Reader;
//use cebe\openapi\spec\Operation;
//use cebe\openapi\spec\PathItem;
use JsonSchema\Validator;
use Psr\Http\Message\ResponseFactoryInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\StreamFactoryInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ServiceLocator;
use TYPO3\CMS\Core\Context\Context;
use TYPO3\CMS\Core\Http\RouteConfiguration;
//use TYPO3\CMS\Core\Http\RouteHandlerInterface;
use TYPO3\CMS\Core\JsonSchema\Hydrator;

/**
 * @internal
 */
final readonly class RouteHandler /* implements RouteHandlerInterface*/
{
    public function __construct(
        private ActionDescriptor $action,
        private ServiceLocator $actionHandlers,
        private ResponseFactoryInterface $responseFactory,
        private StreamFactoryInterface $streamFactory,
        private Context $context,
        private LoggerInterface $logger,
        private ActionRegistry $actionRegistry,
    ) {}

    /*
    public function getRoutes(): array
    {
        return [
            new RouteConfiguration(
                '/api/' . $this->action->route,
                Reader::readFromJson($this->action->operations, PathItem::class),
            ),
        ];
    }
     */

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        $id = $this->action->id;
        if (!$this->actionHandlers->has($this->action->service)) {
            return $this->badRequest(400, 'Route not available: ' . $id);
        }

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
            $result = $this->actionRegistry->invoke($this->action, $arguments);
        } catch (ActionException $e) {
            $this->logger->debug('Action {id} returned an error', [
                'id' => $this->action->id,
                'exception' => $e,
            ]);
            return $this->badRequest(400, $e->getMessage());
        }

        if ($result === null) {
            return $this->responseFactory->createResponse(204);
        }

        $schema = $this->action->result ?? null;

        $encoded = json_encode($result);
        if ($schema) {
            $schema = $this->actionRegistry->provideRefs($schema);
            try {
                // @todo use coerce validation instead of decoding the encoded value?
                $this->validate(json_decode($encoded), $schema->toPlainObject());
            } catch (\RuntimeException $e) {
                return $this->badRequest(500, 'action produced invalid result, that did not validate: ' . $e->getMessage());
            }
        }

        return $this->responseFactory
            ->createResponse(200)
            ->withHeader('Content-Type', 'application/json')
            ->withBody(
                $this->streamFactory->createStream($encoded)
            );
    }

    private function mapArgumentsFromRequest(ServerRequestInterface $request): array
    {
        $arguments = [];
        foreach ($this->action->contextParameter as $parameter) {
            $arguments[$parameter] = new ActionContext(
                $this->context,
                $GLOBALS['BE_USER'],
                $GLOBALS['LANG'],
                $request,
                $request->getAttribute('api.scopes', []),
            );
        }

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
                        $value = json_decode($value, false, 512, JSON_THROW_ON_ERROR);
                    }
                }
            }

            if (!$hasValue) {
                if ($parameter['optional']) {
                    continue;
                }
                throw new \RuntimeException(
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

            try {
                $this->validate($value, $schema->toPlainObject());
            } catch (\RuntimeException $e) {
                throw new \RuntimeException(
                    sprintf(
                        'Invalid parameter value for "%s"',
                        $name,
                    ),
                    1766057431,
                    $e
                );
            }
            // @todo avoid the json_decode/encode loop
            $value = $hydrator->hydrate($value, $schema);
            $arguments[$name] = $value;
        }
        return $arguments;
    }

    private function getJsonRequestBody(ServerRequestInterface $request): \stdClass
    {
        $bodyContent = null;
        if ($request->getHeaderLine('Content-Type') === 'application/json') {
            $body = (string)$request->getBody();
            $bodyContent = json_decode($body, false, 512, JSON_THROW_ON_ERROR);
        }
        if (!$bodyContent instanceof \stdClass) {
            throw new \RuntimeException(
                'Invalid request body',
                1766057432,
            );
        }
        return $bodyContent;
    }

    private function validate(mixed $value, object $schema): void
    {
        $validator = new Validator();
        $validator->validate($value, $schema);
        if (!$validator->isValid()) {
            $messages = [];
            foreach ($validator->getErrors() as $error) {
                $messages[] = sprintf('[%s] %s', $error['property'], $error['message']);
            }
            throw new \RuntimeException(
                sprintf(
                    'JSON validation errors: %s',
                    implode('; ', $messages),
                ),
                1766055113
            );
        }
    }

    private function badRequest(int $status, string $reason): ResponseInterface
    {
        return $this->responseFactory
            ->createResponse($status)
            ->withHeader('Content-Type', 'application/json')
            // Provide error as header (at least for now, since playwright traces do not collect response bodies)
            ->withHeader('X-TYPO3-Action-Error', $reason)
            ->withBody(
                $this->streamFactory->createStream(json_encode((object)[
                    'error' => $reason,
                ]))
            );
    }
}
