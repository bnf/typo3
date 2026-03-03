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

namespace TYPO3\CMS\Core\JsonSchema;

use Symfony\Component\DependencyInjection\Attribute\AutowireLocator;
use Symfony\Component\DependencyInjection\ServiceLocator;

/**
 * @implements \IteratorAggregate<string, DynamicSchemaProviderInterface>
 */
final readonly class DynamicSchemaProviderRegistry implements \IteratorAggregate
{
    /**
     * @param ServiceLocator<DynamicSchemaProviderInterface> $schemaProviders
     */
    public function __construct(
        #[AutowireLocator(
            services: 'typo3.json-schema.dynamic-provider',
        )]
        private ServiceLocator $schemaProviders,
    ) {}

    public function has(string $schemaProvider): bool
    {
        return $this->schemaProviders->has($schemaProvider);
    }

    public function get(string $schemaProvider): DynamicSchemaProviderInterface
    {
        return $this->schemaProviders->get($schemaProvider);
    }

    public function getIterator(): \Traversable
    {
        return $this->schemaProviders->getIterator();
    }

    /**
     * @return list<string>
     */
    public function getIdentifiers(): array
    {
        return array_keys($this->schemaProviders->getProvidedServices());
    }
}
