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

use Symfony\Component\DependencyInjection\Argument\BoundArgument;
use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Exception\InvalidArgumentException;
use Symfony\Component\DependencyInjection\Reference;

/**
 * Replaces the default logger by another one with its own channel for tagged services.
 */
class LoggerChannelPass implements CompilerPassInterface
{
    /**
     * @var array
     */
    protected $channels = ['app'];

    public function process(ContainerBuilder $container)
    {
        if (!$container->hasDefinition('monolog.logger')) {
            return;
        }

        // create channels necessary for the handlers
        foreach ($container->findTaggedServiceIds('monolog.logger') as $id => $tags) {
            foreach ($tags as $tag) {
                if (empty($tag['channel']) || $tag['channel'] === 'app') {
                    continue;
                }

                $resolvedChannel = $container->getParameterBag()->resolveValue($tag['channel']);

                $definition = $container->getDefinition($id);
                $loggerId = sprintf('monolog.logger.%s', $resolvedChannel);
                $this->createLogger($resolvedChannel, $loggerId, $container);

                foreach ($definition->getArguments() as $index => $argument) {
                    if ($argument instanceof Reference && 'logger' === (string)$argument) {
                        $definition->replaceArgument($index, $this->changeReference($argument, $loggerId));
                    }
                }

                $calls = $definition->getMethodCalls();
                foreach ($calls as $i => $call) {
                    foreach ($call[1] as $index => $argument) {
                        if ($argument instanceof Reference && 'logger' === (string)$argument) {
                            $calls[$i][1][$index] = $this->changeReference($argument, $loggerId);
                        }
                    }
                }
                $definition->setMethodCalls($calls);

                if (\method_exists($definition, 'getBindings')) {
                    $binding = new BoundArgument(new Reference($loggerId));

                    // Mark the binding as used already, to avoid reporting it as unused if the service does not use a
                    // logger injected through the LoggerInterface alias.
                    $values = $binding->getValues();
                    $values[2] = true;
                    $binding->setValues($values);

                    $bindings = $definition->getBindings();
                    $bindings['Psr\Log\LoggerInterface'] = $binding;
                    $definition->setBindings($bindings);
                }
            }
        }

        // create additional channels
//        foreach ($container->getParameter('monolog.additional_channels') as $chan) {
//            if ($chan === 'app') {
//                continue;
//            }
//            $loggerId = sprintf('monolog.logger.%s', $chan);
//            $this->createLogger($chan, $loggerId, $container);
//            $container->getDefinition($loggerId)->setPublic(true);
//        }
//        $container->getParameterBag()->remove('monolog.additional_channels');

        // wire handlers to channels
        $handlersToChannels = $container->getParameter('monolog.handlers_to_channels');
        foreach ($handlersToChannels as $handler => $channels) {
            foreach ($this->processChannels($channels) as $channel) {
                try {
                    $logger = $container->getDefinition($channel === 'app' ? 'monolog.logger' : 'monolog.logger.' . $channel);
                } catch (InvalidArgumentException $e) {
                    $msg = 'Monolog configuration error: The logging channel "' . $channel . '" assigned to the "' . substr($handler, 16) . '" handler does not exist.';
                    throw new \InvalidArgumentException($msg, 1575223056, $e);
                }
                $logger->addMethodCall('pushHandler', [new Reference($handler)]);
            }
        }
    }

    /**
     * @param array $configuration
     *
     * @return array
     */
    protected function processChannels($configuration)
    {
        if ($configuration === null) {
            return $this->channels;
        }

        if ($configuration['type'] === 'inclusive') {
            return $configuration['elements'] ?: $this->channels;
        }

        return array_diff($this->channels, $configuration['elements']);
    }
}
