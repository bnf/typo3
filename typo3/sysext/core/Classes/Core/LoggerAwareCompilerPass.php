<?php
declare(strict_types = 1);
namespace TYPO3\CMS\Core\Core;

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

use Psr\Log\LoggerAwareInterface;
use Symfony\Component\DependencyInjection\ChildDefinition;
use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Reference;
use TYPO3\CMS\Core\Log\LogManager;

/**
 * @internal
 */
final class LoggerAwareCompilerPass implements CompilerPassInterface
{
    public function registerAutoconfiguration(ContainerBuilder $container)
    {
        $container->registerForAutoconfiguration(LoggerAwareInterface::class)->addTag('psr.logger_aware');
    }

    public function process(ContainerBuilder $container)
    {
        foreach ($container->findTaggedServiceIds('psr.logger_aware') as $id => $tags) {
            $originalDefinition = $container->findDefinition($id);

            $decoratorServiceName = $this->getDecoratedServiceName($id, $container);
            $innerName = $decoratorServiceName . '.inner';
            $container->setDefinition($innerName, $originalDefinition);

            $factoryDefinition = new ChildDefinition($id);
            $factoryDefinition->setDecoratedService($id);
            $factoryDefinition->setFactory([self::class, 'addLoggerToLoggerAware']);
            $factoryDefinition->addArgument(new Reference(LogManager::class));
            $factoryDefinition->addArgument(new Reference($innerName));

            $container->setDefinition($decoratorServiceName, $factoryDefinition);
        }
    }

    private function getDecoratedServiceName(string $serviceName, ContainerBuilder $container): string
    {
        $counter = 1;
        while ($container->has($serviceName . '_decorated_' . $counter)) {
            $counter++;
        }
        return $serviceName . '_decorated_' . $counter;
    }

    public static function addLoggerToLoggerAware(LogManager $logManager, LoggerAwareInterface $object): LoggerAwareInterface
    {
        $object->setLogger($logManager->getLogger(get_class($object)));
        return $object;
    }
}
