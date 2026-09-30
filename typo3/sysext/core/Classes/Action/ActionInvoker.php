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

use JsonSchema\Validator;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\Attribute\AutowireLocator;
use Symfony\Component\DependencyInjection\ServiceLocator;
use TYPO3\CMS\Core\Attribute\AsAction;
use TYPO3\CMS\Core\JsonSchema\Hydrator;

/**
 * @internal
 */
final readonly class ActionInvoker
{
    public function __construct(
        private ActionRegistry $actionRegistry,
        private Hydrator $hydrator,
        #[AutowireLocator(
            services: AsAction::TAG_NAME,
        )]
        private ServiceLocator $actionHandlers,
        private LoggerInterface $logger,
    ) {}

    /**
     * @throws \InvalidArgumentException if validation or hydration of input argument fails
     * @throws \LogicException if hydration fails
     * @throws ActionExceptionInterface if action execution fails
     * @throws \DomainException if action result is invalid
     */
    public function invoke(
        string $actionName,
        object $arguments,
        ActionContext $context,
        bool $validateOutput = true,
        bool $validateInput = true,
    ): mixed {
        $action = $this->actionRegistry->getAction($actionName);
        $schema = $this->actionRegistry->getActionInputSchema($action);
        $this->validate($arguments, $schema->toPlainObject());
        $arguments = $this->hydrator->hydrate($arguments, $schema);

        $result = $this->callActionMethod($action, (array)$arguments, $context);

        if ($validateOutput) {
            try {
                $textResult = json_encode($result);
                $this->validate(
                    json_decode($textResult, false),
                    $this->actionRegistry->getActionOutputSchema($action)->toPlainObject()
                );
            } catch (\InvalidArgumentException $e) {
                throw new \DomainException('Invalid action result `' . $textResult . '`. Reason: ' . $e->getMessage(), 1790060467, $e);
            }
        }
        return $result;
    }

    /**
     * @throws ActionExceptionInterface
     * @throws \RuntimeException
     */
    private function callActionMethod(ActionDescriptor $action, array $arguments, ActionContext $context): mixed
    {
        $arguments = [
            ...$arguments,
            ...array_fill_keys($action->contextParameter, $context),
        ];

        $id = $action->id;
        $service = $action->service;
        $methodName = $action->methodName;
        if (!$this->actionHandlers->has($service)) {
            throw new \RuntimeException(sprintf('Action service not available (action=%s, service=%s)', $id, $service), 1789983075);
        }
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

    /**
     * @throws \InvalidArgumentException
     */
    public function validate(mixed $value, object $schema): void
    {
        $validator = new Validator();
        $validator->validate($value, $schema);
        if (!$validator->isValid()) {
            $messages = [];
            foreach ($validator->getErrors() as $error) {
                $messages[] = sprintf('[%s] %s', $error['pointer'], $error['message']);
            }
            throw new \InvalidArgumentException(
                sprintf(
                    'schema validation error%s: %s',
                    count($messages) > 1 ? 's' : '',
                    implode('; ', $messages),
                ),
                1790071041
            );
        }
    }
}
