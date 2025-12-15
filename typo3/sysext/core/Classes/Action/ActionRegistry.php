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
use cebe\openapi\spec\Schema;
use JsonSchema\Validator;
use Psr\Http\Message\ResponseFactoryInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\StreamFactoryInterface;
use Symfony\Component\DependencyInjection\Attribute\Autoconfigure;
use Symfony\Component\DependencyInjection\Attribute\AutowireLocator;
use Symfony\Component\DependencyInjection\ServiceLocator;
use TYPO3\CMS\Core\Attribute\AsAction;

/**
 * @internal
 */
#[Autoconfigure(public: true)]
final readonly class ActionRegistry
{
    /**
     * @param array{
     *   methodName: string,
     *   name: ?string,
     *   summary: ?string,
     *   description: ?string,
     *   method: string|array|null,
     *   route: ?string,
     *   content: ?string,
     *   ajaxAlias: ?string,
     *   meta: ?array,
     *   id: string,
     *   operations: string
     * }[] $items
     */
    public function __construct(
        private array $items,
        #[AutowireLocator(
            services: AsAction::TAG_NAME,
        )]
        private readonly ServiceLocator $actionHandlers,
        private readonly ResponseFactoryInterface $responseFactory,
        private readonly StreamFactoryInterface $streamFactory,
    ) {}

    public function getRoutes(string $context): array
    {
        return $this->items;
    }

    public function getItems(): array
    {
        return $this->items;
    }

    public function invoke(array $info, array $arguments): mixed
    {
        $id = $info['id'];
        $methodName = $info['methodName'];
        $handler = $this->actionHandlers->get($id);
        try {
            return $handler->{$methodName}(...$arguments);
        } catch (\ArgumentCountError $e) {
            throw new ActionException('Missing arguments', 1766052153, $e);
        } catch (\TypeError $e) {
            throw new ActionException('Invalid arguments: ' . $e->getMessage(), 1766052154, $e);
        }
    }

    private function badRequest(int $status, string $reason): ResponseInterface
    {
        return $this->responseFactory
            ->createResponse(400)
            ->withHeader('Content-Type', 'application/json')
            ->withBody(
                $this->streamFactory->createStream(json_encode((object)[
                    'error' => $reason,
                ]))
            );
    }

    public function invokeRoute(string $name, ServerRequestInterface $request): ResponseInterface
    {
        $info = null;
        foreach ($this->items as $item) {
            if ($item['name'] === $name) {
                $info = $item;
                break;
            }
        }
        if ($info === null || !$this->actionHandlers->has($info['id'])) {
            return $this->badRequest(400, 'Route not available: ' . $name);
        }

        $pathItem = Reader::readFromJson($info['operations'], PathItem::class);
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

        try {
            $arguments = $this->mapArgumentsFromRequest($operation, $request);
            $result = $this->invoke($info, $arguments);
        } catch (ActionException $e) {
            return $this->badRequest(400, $e->getMessage());
        } catch (\RuntimeException $e) {
            return $this->badRequest(400, $e->getMessage());
        }

        $response = $operation->responses->getResponse('200');
        $schema = $response->content['application/json']->schema ?? null;

        $encoded = json_encode($result);
        if ($schema) {
            /*
            $typo3Type = $schema?->{'x-typo3-type'} ?? null;
            if ($typo3Type === 'array' && is_array($result) && $schema->type === 'object') {
                $result = (object)$result;
            }
             */
            try {
                // @todo use coerce validation instead of decoding the encoded value?
                $this->validate(json_decode($encoded), $schema);
            } catch (\RuntimeException $e) {
                return $this->badRequest(500, 'action returned invalid result, that does not validate: ' . $e->getMessage());
            }
        }

        return $this->responseFactory
            ->createResponse(200)
            ->withHeader('Content-Type', 'application/json')
            ->withBody(
                $this->streamFactory->createStream($encoded)
            );
    }

    public function mapArgumentsFromRequest(Operation $operation, ServerRequestInterface $request): array
    {
        $arguments = [];
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
            $hydrator = new Hydrator();
            if (isset($parameter->content['application/json'])) {
                $value = json_decode($value, false, 512, JSON_THROW_ON_ERROR);
                $schema = $parameter->content['application/json']->schema ?? null;
            } elseif (is_string($value) && $schema !== null) {
                $value = $hydrator->coerceScalars($value, $schema);
            }
            if ($schema !== null) {
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
                $value = $hydrator->hydrate($value, $schema);
            }
            $arguments[$parameter->name] = $value;
        }
        return $arguments;
    }

    private function validate(mixed $value, Schema $schema): void
    {
        $validator = new Validator();
        $validator->validate($value, $schema->getSerializableData());
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
}
