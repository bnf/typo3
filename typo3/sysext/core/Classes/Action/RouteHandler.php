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

use cebe\openapi\Reader;
use cebe\openapi\spec\Operation;
use cebe\openapi\spec\PathItem;
use JsonSchema\Validator;
use Psr\Http\Message\ResponseFactoryInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\StreamFactoryInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ServiceLocator;
use TYPO3\CMS\Core\Context\Context;
use TYPO3\CMS\Core\Http\RouteConfiguration;
use TYPO3\CMS\Core\Http\RouteHandlerInterface;
use TYPO3\CMS\Core\JsonSchema\Hydrator;

/**
 * @internal
 */
final readonly class RouteHandler implements RouteHandlerInterface
{
    /**
     * @param array{
     *   methodName: string,
     *   id: string,
     *   name: ?string,
     *   summary: ?string,
     *   description: ?string,
     *   method: string|array|null,
     *   route: ?string,
     *   content: ?string,
     *   ajaxAlias: ?string,
     *   meta: ?array,
     *   service: string,
     *   operations: string
     * } $info
     */
    public function __construct(
        private array $info,
        private ServiceLocator $actionHandlers,
        private ResponseFactoryInterface $responseFactory,
        private StreamFactoryInterface $streamFactory,
        private Context $context,
        private LoggerInterface $logger,
        private ActionRegistry $actionRegistry,
    ) {}

    public function getRoutes(): array
    {
        return [
            new RouteConfiguration(
                '/api/' . $this->info['route'],
                Reader::readFromJson($this->info['operations'], PathItem::class),
            ),
        ];
    }

    /**
     * @return list<string>
     */
    private function getRequiredScopesFromOperation(Operation $operation): array
    {
        $scopes = [];
        foreach ($operation->security as $securityRequirement) {
            if (isset($securityRequirement->oauth2)) {
                foreach ($securityRequirement->oauth2 as $scope) {
                    $scopes[] = $scope;
                }
            }
        }
        return $scopes;
    }

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        $info = $this->info;
        $id = $info['id'];
        if (!$this->actionHandlers->has($info['service'])) {
            return $this->badRequest(400, 'Route not available: ' . $id);
        }

        $operations = $info['operations'];
        $pathItem = Reader::readFromJson($operations, PathItem::class);
        $operation = null;
        foreach ($pathItem->getOperations() as $method => $op) {
            if (strtolower($request->getMethod()) === $method) {
                $operation = $op;
                break;
            }
        }
        if ($operation === null) {
            return $this->badRequest(400, 'Operation not available: ' . $request->getMethod());
        }

        $currentScopes = $request->getAttribute('api.scopes', []);
        $requiredScopes = $this->getRequiredScopesFromOperation($operation);
        foreach ($requiredScopes as $scope) {
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
            $arguments = $this->mapArgumentsFromRequest($operation, $request);
            $result = $this->actionRegistry->invoke($info, $arguments);
        } catch (ActionException $e) {
            $this->logger->debug('Action {id} returned an error', [
                'id' => $info['id'],
                'exception' => $e,
            ]);
            return $this->badRequest(400, $e->getMessage());
        }

        if ($result === null) {
            return $this->responseFactory->createResponse(204);
        }

        $response = $operation->responses->getResponse('200');
        $schema = $response->content['application/json']->schema ?? null;

        $encoded = json_encode($result);
        if ($schema) {
            $schema = $this->actionRegistry->provideRefs($schema);
            try {
                // @todo use coerce validation instead of decoding the encoded value?
                $this->validate(json_decode($encoded), $schema);
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

    private function mapArgumentsFromRequest(Operation $operation, ServerRequestInterface $request): array
    {
        $arguments = [];
        $contextParameter = $operation->{'x-typo3-context'} ?? [];
        foreach ($contextParameter as $parameter) {
            $arguments[$parameter] = new ActionContext(
                $this->context,
                $GLOBALS['BE_USER'],
                $GLOBALS['LANG'],
                $request,
                $request->getAttribute('api.scopes', []),
            );
        }
        if (isset($operation->requestBody->content)) {
            $body = (string)$request->getBody();
            foreach ($operation->requestBody->content as $type => $mediaType) {
                if ($type === 'application/json' && $request->getHeaderLine('Content-Type') === 'application/json') {
                    $bodyContent = json_decode($body, false, 512, JSON_THROW_ON_ERROR);
                    try {
                        $this->validate($bodyContent, $mediaType->schema);
                    } catch (\RuntimeException $e) {
                        throw new \RuntimeException(
                            'Invalid request body',
                            1766057432,
                            $e
                        );
                    }
                    foreach ($mediaType->schema->properties as $property => $schema) {
                        if (isset($bodyContent->{$property})) {
                            $value = $bodyContent->{$property};
                            $value = (new Hydrator())->hydrate($value, $schema);
                            $arguments[$property] = $value;
                        }
                    }
                    // @todo validate required
                }
            }
        }
        foreach ($operation->parameters as $parameter) {
            $value = null;
            if ($parameter->in === 'path' || $parameter->in === 'query') {
                $hasValue = false;
                if ($parameter->in === 'path') {
                    $routing = $request->getAttribute('routing');
                    if (isset($routing->getArguments()[$parameter->name])) {
                        $hasValue = true;
                        $value = $routing->getArguments()[$parameter->name];
                    }
                } else {
                    if (isset($request->getQueryParams()[$parameter->name])) {
                        $hasValue = true;
                        $value = $request->getQueryParams()[$parameter->name];
                    }
                }
                if (!$hasValue) {
                    if (!$parameter->required) {
                        continue;
                    }
                    throw new \RuntimeException(
                        sprintf(
                            'Missing parameter value for "%s"',
                            $parameter->name,
                        ),
                        1766247070
                    );
                }
            }
            $schema = $parameter->schema ?? null;
            if ($schema === null) {
                throw new \RuntimeException('Missing schema for parameter', 1768307029);
            }
            $hydrator = new Hydrator();
            if (isset($parameter->content['application/json'])) {
                $value = json_decode($value, false, 512, JSON_THROW_ON_ERROR);
                $schema = $parameter->content['application/json']->schema ?? null;
            }

            $schema = $this->actionRegistry->provideRefs($schema);

            if (is_string($value)) {
                $value = $hydrator->coerceScalars($value, new Schema(json_decode(json_encode($schema), true)));
            }

            try {
                $this->validate($value, $schema);
            } catch (\RuntimeException $e) {
                throw new \RuntimeException(
                    sprintf(
                        'Invalid parameter value for "%s"',
                        $parameter->name,
                    ),
                    1766057431,
                    $e
                );
            }
            // @todo avoid the json_decode/encode loop
            $value = $hydrator->hydrate($value, new Schema(json_decode(json_encode($schema), true)));
            $arguments[$parameter->name] = $value;
        }
        return $arguments;
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
