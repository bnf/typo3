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

use Exception;
use Psr\Container\ContainerExceptionInterface;
use Psr\Container\ContainerInterface;
use Psr\Container\NotFoundExceptionInterface;

/**
 * @internal
 */
class Container implements ContainerInterface
{
    /**
     * @var array
     */
    protected $entries = [];

    /**
     * @var array
     */
    protected $factories = [];

    /**
     * Instantiate the container.
     *
     * Objects and parameters can be passed as argument to the constructor.
     *
     * @param array $providers The service providers to register.
     * @param array $entires The default parameters or objects.
     */
    public function __construct(array $providers = [], array $entries = [])
    {
        $this->entries = $entries;

        foreach ($providers as $provider) {
            // @todo sanity check if $provider implements ServiceProviderInterface?
            // @todo sanity check if factory is callable
            $factories = $provider->getFactories();
            foreach ($factories as $id => $factory) {
                $this->factories[$id] = $factory;
            }
        }

        foreach ($providers as $provider) {
            $extensions = $provider->getExtensions();
            foreach ($extensions as $id => $extension) {
                if (isset($this->factories[$id])) {
                    $previousFactory = $this->factories[$id];
                    $this->factories[$id] = function (ContainerInterface $container) use ($extension, $previousFactory) {
                        $previous = ($previousFactory)($container);
                        return ($extension)($container, $previous);
                    };
                } else {
                    // calling extension as a regular factory means the second parameter is null
                    // If the extension declares a non-nullable type  for the second parameter the
                    // call will fail – by intent.
                    $this->factories[$id] = $extension;
                }
            }
        }
    }

    /**
     * @param string $id
     * @return bool
     */
    public function has($id)
    {
        return isset($this->entries[$id]) || isset($this->factories[$id]);
    }

    /**
     * @param string $id
     * @return mixed
     * @throws NotFoundException
     */
    public function get($id)
    {
        if (!$this->has($id)) {
            throw new class($id . ' not found', 1519978105) extends Exception implements NotFoundExceptionInterface {
            };
        }

        if (!isset($this->entries[$id])) {
            $factory = $this->factories[$id];
            if ($factory === false) {
                throw new class('Container entry "' . $id . '" is part of a cyclic dependency chain.', 1520175002) extends Exception implements ContainerExceptionInterface {
                };
            }

            // Remove factory as it is no longer required.
            // Set factory to false to be able to detect
            // cyclic dependency loops.
            $this->factories[$id] = false;

            $this->entries[$id] = ($factory)($this);
        }

        return $this->entries[$id];
    }
}
