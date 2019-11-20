<?php
declare(strict_types = 1);
namespace TYPO3\CMS\Core\DependencyInjection\Monolog;

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

use Monolog\Processor\ProcessorInterface;
use Monolog\ResettableInterface;
use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Definition;
use Symfony\Component\DependencyInjection\Reference;
use TYPO3\CMS\Core\Log\Exception\ConfigurationException;

/**
 * todo: add description
 */
class MonologConfigurationPass implements CompilerPassInterface
{
    private $nestedHandlers = [];

    public function process(ContainerBuilder $container)
    {
        $configuration = $GLOBALS['TYPO3_CONF_VARS']['monolog'] ?? [];
        $configuration = is_array($configuration) ? $configuration : [];

        // channels
        $channelsConfiguration = $configuration['channels'] ?? [];
        $channelsConfiguration = is_array($channelsConfiguration) ? $channelsConfiguration : [];
        $container->setParameter('monolog.additional_channels', $channelsConfiguration);

        // handlers
        $handlersConfiguration = $configuration['handlers'] ?? [];
        $handlersConfiguration = is_array($handlersConfiguration) ? $handlersConfiguration : [];

        $this->processHandlersConfiguration($container, $handlersConfiguration);

        // processors
        $container->registerForAutoconfiguration(ProcessorInterface::class)
            ->addTag('monolog.processor');
    }

    /**
     * @param ContainerBuilder $container
     * @param array $handlersConfiguration
     */
    private function processHandlersConfiguration(ContainerBuilder $container, array $handlersConfiguration)
    {
        $handlers = [];
        foreach ($handlersConfiguration as $name => $handler) {
            $handlerClass = $handler['class'] ?? '';
            if (!class_exists($handlerClass)) {
                throw new ConfigurationException('@todo: proper exception message', 1575221215);
            }
            unset($handler['class']);

            $handlerArguments = $handler['arguments'] ?? [];
            $handlerArguments = is_array($handlerArguments) ? $handlerArguments : [];
            unset($handler['arguments']);

            $handlers[$handler['priority']][] = [
                'id' => $this->buildHandler($container, $name, $handlerClass, $handlerArguments, $handler),
                'channels' => empty($handler['channels']) ? null : $handler['channels'],
            ];
        }

        ksort($handlers);
        $sortedHandlers = [];
        foreach ($handlers as $priorityHandlers) {
            foreach (array_reverse($priorityHandlers) as $handler) {
                $sortedHandlers[] = $handler;
            }
        }

        $handlersToChannels = [];
        foreach ($sortedHandlers as $handler) {
            if (!in_array($handler['id'], $this->nestedHandlers)) {
                $handlersToChannels[$handler['id']] = $handler['channels'];
            }
        }
        $container->setParameter('monolog.handlers_to_channels', $handlersToChannels);
    }

    private function buildHandler(
        ContainerBuilder $container,
        string $name,
        string $handlerClassName,
        array $handlerArguments,
        array $handlerConfiguration
    ): string {
        $handlerId = $this->getHandlerId($name);
//        if ($handler['type'] === 'service') {
//            $container->setAlias($handlerId, $handler['id']);
//
//            if (!empty($handler['nested']) && true === $handler['nested']) {
//                $this->markNestedHandler($handlerId);
//            }
//
//            return $handlerId;
//        }

        $definition = new Definition($handlerClassName);
        $definition->setArguments($handlerArguments);

//        $handler['level'] = $this->levelToMonologConst($handler['level']);

//        if ($handler['include_stacktraces']) {
//            $definition->setConfigurator(['Symfony\\Bundle\\MonologBundle\\MonologBundle', 'includeStacktraces']);
//        }

//        if ($handler['process_psr_3_messages'] === null) {
//            $handler['process_psr_3_messages'] = !isset($handler['handler']) && !$handler['members'];
//        }

//        if ($handler['process_psr_3_messages']) {
//            $processorId = 'monolog.processor.psr_log_message';
//            if (!$container->hasDefinition($processorId)) {
//                $processor = new Definition('Monolog\\Processor\\PsrLogMessageProcessor');
//                $processor->setPublic(false);
//                $container->setDefinition($processorId, $processor);
//            }
//
//            $definition->addMethodCall('pushProcessor', [new Reference($processorId)]);
//        }

        if (($handlerConfiguration['nested'] ?? false) === true) {
            $this->markNestedHandler($handlerId);
        }

        if (!empty($handlerConfiguration['formatter'])) {
            $definition->addMethodCall('setFormatter', [new Reference($handlerConfiguration['formatter'])]);
        }

//        if (!in_array($handlerId, $this->nestedHandlers) && is_subclass_of($handlerClass, ResettableInterface::class)) {
//            $definition->addTag('kernel.reset', ['method' => 'reset']);
//        }

        $container->setDefinition($handlerId, $definition);

        return $handlerId;
    }

    private function markNestedHandler(string $nestedHandlerId): void
    {
        if (in_array($nestedHandlerId, $this->nestedHandlers, true)) {
            return;
        }

        $this->nestedHandlers[] = $nestedHandlerId;
    }

    private function getHandlerId(string $name): string
    {
        return sprintf('monolog.handler.%s', $name);
    }
}
