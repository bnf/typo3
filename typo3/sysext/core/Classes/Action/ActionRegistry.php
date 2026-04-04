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
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autoconfigure;
use Symfony\Component\DependencyInjection\Attribute\AutowireLocator;
use Symfony\Component\DependencyInjection\ServiceLocator;
use TYPO3\CMS\Core\Attribute\AsAction;
use TYPO3\CMS\Core\Context\Context;
use TYPO3\CMS\Core\JsonSchema\Schema;
use TYPO3\CMS\Core\JsonSchema\SchemaStore;

/**
 * @internal
 */
#[Autoconfigure(public: true)]
final readonly class ActionRegistry
{
    /**
     * @param ServiceLocator<ActionDescriptor> $actions
     */
    public function __construct(
        private ServiceLocator $actions,
        private SchemaStore $schemas,
        #[AutowireLocator(
            services: AsAction::TAG_NAME,
        )]
        private ServiceLocator $actionHandlers,
        private ResponseFactoryInterface $responseFactory,
        private StreamFactoryInterface $streamFactory,
        private Context $context,
        private LoggerInterface $logger,
    ) {}

    /**
     * @return list<string>
     */
    public function listSchemas(): array
    {
        return array_keys($this->schemas->getStatic());
        /*
        return [
            ...array_keys($this->schemas->getStatic()),
            ...array_keys($this->schemas->getDynamic()),
        ];
        */
    }

    public function getSchema(string $identifier): Schema
    {
        return $this->schemas->get($identifier);
    }

    /**
     * @return iterable<ActionDescriptor>
     */
    public function getRoutes(string $context): iterable
    {
        return $this->actions;
    }

    /**
     * @return iterable<ActionDescriptor>
     */
    public function getActions(): iterable
    {
        return $this->actions;
    }

    public function invoke(ActionDescriptor $action, array $arguments): mixed
    {
        $id = $action->id;
        $service = $action->service;
        $methodName = $action->methodName;
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
            throw new ActionException('Missing arguments: ' . $e->getMessage(), 1766052153, $e);
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
        if (!$this->actions->has($id)) {
            throw new \RuntimeException('Action "' . $id . '" does not exist.', 1772299654);
        }
        $action = $this->actions->get($id);
        return new RouteHandler(
            $action,
            $this->actionHandlers,
            $this->responseFactory,
            $this->streamFactory,
            $this->context,
            $this->logger,
            $this,
        );
    }

    public function provideRefs(Schema $schema): Schema
    {
        return $schema->with(['store' => $this->schemas]);
    }
}
