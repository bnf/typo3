<?php
declare(strict_types = 1);
namespace TYPO3\CMS\Core\DependencyInjection;

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

use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Definition;
use Symfony\Component\DependencyInjection\Reference;
use TYPO3\CMS\Core\Log\Logger;
use TYPO3\CMS\Core\Log\LogManager;

/**
 * @internal
 */
final class LoggerAwarePass implements CompilerPassInterface
{
    /**
     * @var string
     */
    private $tagname;

    /**
     * @param string $tagname
     */
    public function __construct(string $tagname)
    {
        $this->tagname = $tagname;
    }

    public function process(ContainerBuilder $container)
    {
        foreach ($container->findTaggedServiceIds($this->tagname) as $id => $tags) {
            $definition = $container->findDefinition($id);
            if (!$definition->isAutowired() || $definition->isAbstract()) {
                continue;
            }

            $logger = new Definition(Logger::class);
            $logger->setFactory([new Reference(LogManager::class), 'getLogger']);
            $logger->setArguments([$id]);
            $logger->setShared(false);

            $definition->addMethodCall('setLogger', [$logger]);
        }
    }
}
