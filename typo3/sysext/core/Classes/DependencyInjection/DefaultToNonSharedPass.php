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

/**
 * Default to non shared (prototype service) if the `shared` settings
 * has not been explicitly set.
 *
 * Explicit configuration may happen by autoconfiguration
 * (e.g. for Singletons), by other compiler passes (e.g.
 * for services defined in service providers), or by
 * supplying shared: true in Services.yaml configuration.
 *
 * @internal
 */
class DefaultToNonSharedPass implements CompilerPassInterface
{
    public function process(ContainerBuilder $container): void
    {
        foreach ($container->getDefinitions() as $id => $definition) {
            if (!isset($definition->getChanges()['shared'])) {
                $definition->setShared(false);
            }
        }
    }
}
