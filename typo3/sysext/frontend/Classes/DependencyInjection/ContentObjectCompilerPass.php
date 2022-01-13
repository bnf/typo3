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

namespace TYPO3\CMS\Frontend\DependencyInjection;

use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use TYPO3\CMS\Frontend\ContentObject\AbstractContentObject;
use TYPO3\CMS\Frontend\ContentObject\ContentObjectFactory;
use TYPO3\CMS\Frontend\ContentObject\Exception\ContentRenderingException;

/**
 * Compiler pass to register tagged ContentObjects
 *
 * @internal
 */
final class ContentObjectCompilerPass implements CompilerPassInterface
{
    protected string $tagName;

    public function __construct(string $tagName)
    {
        $this->tagName = $tagName;
    }

    public function process(ContainerBuilder $container): void
    {
        $contentObjectRegistryDefinition = $container->findDefinition(ContentObjectFactory::class);
        if (!$contentObjectRegistryDefinition) {
            return;
        }

        foreach ($container->findTaggedServiceIds($this->tagName) as $id => $tags) {
            $definition = $container->findDefinition($id);
            if (!$definition->isAutoconfigured() || $definition->isAbstract()) {
                continue;
            }
            if (!is_a($id, AbstractContentObject::class, true)) {
                throw new ContentRenderingException('ContentObject "' . $id . '" must be of type AbstractContentObject', 1642199589);
            }
            foreach ($tags as $attributes) {
                $identifier = $attributes['identifier'] ?? $id;
                $contentObjectRegistryDefinition->addMethodCall('registerContentObject', [$id, $identifier]);
            }
        }
    }
}
