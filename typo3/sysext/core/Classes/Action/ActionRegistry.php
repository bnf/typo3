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
use cebe\openapi\spec\Schema as BaseSchema;
use Psr\Http\Message\ResponseFactoryInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\StreamFactoryInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autoconfigure;
use Symfony\Component\DependencyInjection\Attribute\AutowireLocator;
use Symfony\Component\DependencyInjection\ServiceLocator;
use TYPO3\CMS\Core\Attribute\AsAction;
use TYPO3\CMS\Core\Context\Context;
use TYPO3\CMS\Core\JsonSchema\Schema;

/**
 * @internal
 */
#[Autoconfigure(public: true)]
final class ActionRegistry
{
    /**
     * @var array<string, array<string, Schema>>
     */
    private array $schemaInstances = [];

    /**
     * @param array<string, array{
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
     * }> $items
     * @param array<string, string|Schema> $schemas
     */
    public function __construct(
        private readonly array $items,
        private readonly array $schemas,
        #[AutowireLocator(
            services: AsAction::TAG_NAME,
        )]
        private readonly ServiceLocator $actionHandlers,
        private readonly ResponseFactoryInterface $responseFactory,
        private readonly StreamFactoryInterface $streamFactory,
        private readonly Context $context,
        private readonly LoggerInterface $logger,
    ) {}

    /**
     * @return list<string>
     */
    public function listSchemas(): array
    {
        return array_keys($this->schemas);
    }

    public function getSchema(string $identifier, $prefix = '$defs'): ?Schema
    {
        if (isset($this->schemaInstances[$prefix][$identifier])) {
            return $this->schemaInstances[$prefix][$identifier];
        }
        $schema = $this->schemas[$identifier] ?? null;
        if ($schema === null) {
            return null;
        }
        if ($prefix !== '$defs') {
            $schema = str_replace('#/$defs/', '#/' . $prefix . '/', $schema);
        }
        $instance = Schema::fromPlainData(json_decode($schema, false));
        //$schema = Reader::readFromJson($schema, Schema::class);
        $this->schemaInstances[$prefix][$identifier] = $instance;
        return $instance;
    }

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
        $service = $info['service'];
        $methodName = $info['methodName'];
        $handler = $this->actionHandlers->get($service);
        try {
            $this->logger->debug('Action {id} invoked', [
                'id' => $id,
                'arguments' => array_filter($arguments, static fn(mixed $item): bool => !$item instanceof ActionContext),
            ]);
            $result = $handler->{$methodName}(...$arguments);
            $this->logger->debug('Action {id} returned', [
                'id' => $id,
                'result' => $result,
            ]);
            return $result;

        } catch (\ArgumentCountError $e) {
            throw new ActionException('Missing arguments', 1766052153, $e);
        } catch (\TypeError $e) {
            throw new ActionException('Invalid arguments: ' . $e->getMessage(), 1766052154, $e);
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

    public function getRouteHandler(string $id): RouteHandler
    {
        $info = $this->items[$id] ?? null;
        if ($info === null) {
            throw new \RuntimeException('Action "' . $id . '" does not exist.', 1772299654);
        }
        return new RouteHandler(
            $info,
            $this->actionHandlers,
            $this->responseFactory,
            $this->streamFactory,
            $this->context,
            $this->logger,
            $this,
        );
    }

    public function provideRefs(BaseSchema $schema): Schema
    {
        $data = $schema->getSerializableData();
        $data->{'$defs'} ??= new \stdClass();
        foreach ($data->{'x-typo3-schemas'} ?? [] as $component) {
            $data->{'$defs'}->{$component} = $this->getSchema($component)->toPlainObject();
        }
        unset($data->{'x-typo3-schemas'});
        return Schema::fromPlainData($data);
    }
}
