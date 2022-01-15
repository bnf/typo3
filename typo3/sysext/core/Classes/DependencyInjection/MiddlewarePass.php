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
use TYPO3\CMS\Core\Attributes\Middleware;
use TYPO3\CMS\Core\Http\Middleware\MiddlewareRegistry;

/**
 * @internal
 */
final class MiddlewarePass implements CompilerPassInterface
{
    /**
     * @var string
     */
    private $tagName;

    /**
     * @param string $tagName
     */
    public function __construct(string $tagName)
    {
        $this->tagName = $tagName;
    }

    /**
     * @param ContainerBuilder $container
     */
    public function process(ContainerBuilder $container)
    {
        //$middlewareRegistryDefinition = $container->findDefinition(MiddlewareRegistry::class);
        //if (!$middlewareRegistryDefinition) {
            //return;
        //}

        foreach ($container->findTaggedServiceIds($this->tagName) as $id => $tags) {

            $definition = $container->findDefinition($id);
            if (!$definition->isAutoconfigured() || $definition->isAbstract()) {
                continue;
            }

            $definition->setPublic(true);

            if (!$definition->getClass()) {
                continue;
            }
            $reflectionClass = $container->getReflectionClass($definition->getClass(), false);
            if (!$reflectionClass) {
                continue;
            }

            $attributes = $this->getMiddlewareAttributes($reflectionClass);
            var_dump($attributes);
            foreach ($attributes as $attribute) {
            }
        }
    }

    protected function getMiddlewareAttributes(\ReflectionClass $class): array
    {
        $attributes = $class->getAttributes(Middleware::class, \ReflectionAttribute::IS_INSTANCEOF);

        if (count($attributes) > 0) {
            return array_map(fn ($channel) => $channel->newInstance(), $attributes);
        }

        if ($class->getParentClass() !== false) {
            return $this->getMiddlewareAttributes($class->getParentClass());
        }

        return [];
    }
}
