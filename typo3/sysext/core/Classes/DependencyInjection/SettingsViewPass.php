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
use Symfony\Component\DependencyInjection\Reference;
use TYPO3\CMS\Core\Settings\SettingsManager;
use TYPO3\CMS\Core\Settings\SettingsRegistry;

/**
 * @internal
 */
final class SettingsViewPass implements CompilerPassInterface
{
    public function __construct(
        private readonly string $tagName
    ) {}

    public function process(ContainerBuilder $container): void
    {
        if (!$container->hasDefinition(SettingsRegistry::class)) {
            return;
        }
        $settingsRegistryDefinition = $container->findDefinition(SettingsRegistry::class);

        foreach ($container->findTaggedServiceIds($this->tagName) as $serviceName => $tags) {
            $settingsServiceDefinition = $container->findDefinition($serviceName)->setPublic(true);
            foreach ($tags as $attributes) {
                $type = (string)($attributes['type'] ?? '');
                $prefix = $attributes['prefix'] ?? null;
                if ($type === '') {
                    continue;
                }

                $settingsServiceDefinition->setFactory([ new Reference(SettingsManager::class), 'getSettings' ]);
                $settingsServiceDefinition->setArguments([
                    $type . ($prefix ? '.' . $prefix : ''),
                    $settingsServiceDefinition->getClass(),
                ]);
            }
        }
    }
}
