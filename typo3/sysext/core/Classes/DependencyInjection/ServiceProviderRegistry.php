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

use Psr\Container\ContainerInterface;

/**
 * A class that holds the list of service providers of a project.
 * This class is designed so that service provider do not need to be instantiated each time the registry is filled.
 * They can be lazily instantiated if needed.
 * @internal
 */
class ServiceProviderRegistry implements \IteratorAggregate
{
    /**
     * The array with lazy values.
     *
     * @var array
     */
    private $lazyArray;

    /**
     * The array with constructed values.
     *
     * @var array
     */
    private $constructedArray = [];

    /**
     * An array of service factories (the result of the call to 'getFactories'),
     * indexed by service provider.
     *
     * @var array An array<key, array<servicename, callable>>
     */
    private $serviceFactories = [];

    /**
     * An array of service extensions (the result of the call to 'getExtensions'),
     * indexed by service provider.
     *
     * @var array An array<key, array<servicename, callable>>
     */
    private $serviceExtensions = [];

    private $position = 0;

    /**
     * Initializes the registry from a list of service providers.
     * This list of service providers can be passed as ServiceProvider instances, or simply class name,
     * or an array of [class name, [constructor params]].
     *
     * @param array          $lazyArray The array with lazy values
     */
    public function __construct(array $lazyArray = [])
    {
        $this->lazyArray = $lazyArray;
    }

    /**
     * Whether a offset exists.
     *
     * @param mixed $offset
     * @return bool true on success or false on failure.
     */
    public function has($offset)
    {
        return isset($this->lazyArray[$offset]);
    }

    /**
     * Offset to retrieve.
     *
     * @param mixed $offset
     * @return mixed Can return all value types.
     */
    public function get($offset)
    {
        if (isset($this->constructedArray[$offset])) {
            return $this->constructedArray[$offset];
        }
        $item = $this->lazyArray[$offset];
        if ($item instanceof ServiceProviderInterface) {
            $this->constructedArray[$offset] = $item;

            return $item;
        }

        if (is_array($item)) {
            $className = $item[0];
            $params = isset($item[1]) ? $item[1] : [];
        } elseif (is_string($item)) {
            $className = $item;
            $params = [];
        } else {
            throw new \InvalidArgumentException('lazyArray elements are expected to be a fully qualified class name or an instance of Interop\\Container\\ServiceProviderInterface', 1550092532);
        }

        $this->constructedArray[$offset] = new $className(...$params);

        return $this->constructedArray[$offset];
    }

    /**
     * Returns the result of the getFactories call on service provider whose key in the registry is $offset.
     * The result is cached in the registry so 2 successive calls will trigger `getFactories` only once.
     *
     * @param string $offset Key of the service provider in the registry
     *
     * @return array
     */
    public function getFactories($offset): array
    {
        if (!isset($this->serviceFactories[$offset])) {
            $this->serviceFactories[$offset] = $this->get($offset)->getFactories();
        }

        return $this->serviceFactories[$offset];
    }

    /**
     * Returns the result of the getExtensions call on service provider whose key in the registry is $offset.
     * The result is cached in the registry so 2 successive calls will trigger `getExtensions` only once.
     *
     * @param string $offset Key of the service provider in the registry
     *
     * @return array
     */
    public function getExtensions($offset): array
    {
        if (!isset($this->serviceExtensions[$offset])) {
            $this->serviceExtensions[$offset] = $this->get($offset)->getExtensions();
        }

        return $this->serviceExtensions[$offset];
    }

    /**
     * @param string             $offset      Key of the service provider in the registry
     * @param string             $serviceName Name of the service to fetch
     * @param ContainerInterface $container
     *
     * @return mixed
     */
    public function createService($offset, string $serviceName, ContainerInterface $container)
    {
        return call_user_func($this->getFactories($offset)[$serviceName], $container);
    }

    /**
     * @param string             $offset      Key of the service provider in the registry
     * @param string             $serviceName Name of the service to fetch
     * @param ContainerInterface $container
     * @param mixed              $previous
     *
     * @return mixed
     */
    public function extendService($offset, string $serviceName, ContainerInterface $container, $previous)
    {
        return call_user_func($this->getExtensions($offset)[$serviceName], $container, $previous);
    }

    /**
     * @return \Generator
     */
    public function getIterator(): \Generator
    {
        foreach ($this->lazyArray as $serviceProviderKey => $serviceProvider) {
            yield $serviceProviderKey => $this->get($serviceProviderKey);
        }
    }
}
