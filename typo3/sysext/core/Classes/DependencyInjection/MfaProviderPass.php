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

namespace TYPO3\CMS\Core\DependencyInjection;

use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use TYPO3\CMS\Core\Authentication\Mfa\MfaProviderRegistry;

/**
 * Compiler pass to register tagged MFA providers
 *
 * @internal
 */
final class MfaProviderPass implements CompilerPassInterface
{
    protected string $tagName;

    public function __construct(string $tagName)
    {
        $this->tagName = $tagName;
    }

    public function process(ContainerBuilder $container): void
    {
        $mfaProviderRegistryDefinition = $container->findDefinition(MfaProviderRegistry::class);

        foreach ($container->findTaggedServiceIds($this->tagName) as $id => $tags) {
            $definition = $container->findDefinition($id);
            if (!$definition->isAutoconfigured() || $definition->isAbstract()) {
                continue;
            }
            $definition->setPublic(true)->setShared(false);
            $mfaProviderRegistryDefinition->addMethodCall('registerProvider', [$definition]);
        }
    }
}
