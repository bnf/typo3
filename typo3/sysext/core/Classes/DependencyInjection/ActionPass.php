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
use TYPO3\CMS\Core\Action\ActionRegistry;
use Symfony\Component\TypeInfo\Type;
use Symfony\Component\TypeInfo\TypeResolver\TypeResolver;

final readonly class ActionPass implements CompilerPassInterface
{
    public function __construct(private string $tagName) {}

    public function process(ContainerBuilder $container)
    {
        if (!$container->hasDefinition(ActionRegistry::class)) {
            return;
        }

        $registryDefinition = $container->findDefinition(ActionRegistry::class);

        $items = [];
        foreach ($container->findTaggedServiceIds($this->tagName) as $id => $tags) {
            $definition = $container->findDefinition($id);
            if (!$definition->isAutowired() || $definition->isAbstract()) {
                continue;
            }

            $class = $definition->getClass() ?: $id;

            $classReflection = $container->getReflectionClass($class, false);
            if (!$classReflection) {
                // @todo throw an error here?
                continue;
            }

            foreach ($tags as $tag) {
                $method = $tag['method'];

                $signature = $this->introspect($classReflection, $method);
                $items[] = [
                    'id' => $id,
                    'method' => $method,
                    'params' => array_map(
                        static fn (Type $type): string => (string)$type,
                        $signature['params'],
                    ),
                    'return' => (string)$signature['return'],
                ];
                //var_dump($this->introspect($classReflection, $method));
                //exit;
            }
        }

        $registryDefinition->setArgument('$items', $items);
    }

    private function introspect(\ReflectionClass $classReflection, string $method): array
    {
        $methodReflection = $classReflection->getMethod($method);

        $typeResolver = TypeResolver::create();
        return [
            'params' => array_combine(
                array_map(
                    static fn(\ReflectionParameter $parameter): string => $parameter->name,
                    $methodReflection->getParameters()
                ),
                array_map(
                    static fn(\ReflectionParameter $parameter): Type => $typeResolver->resolve($parameter),
                    $methodReflection->getParameters()
                ),
            ),
            'return' => $typeResolver->resolve($methodReflection),
        ];
    }
}
