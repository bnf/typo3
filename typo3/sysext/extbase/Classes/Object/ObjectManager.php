<?php
declare(strict_types = 1);

namespace TYPO3\CMS\Extbase\Object;

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

use Bnf\Di\Container as NullContainer;
use Psr\Container\ContainerInterface;
use TYPO3\CMS\Extbase\Object\Container\Container;

/**
 * Implementation of the default Extbase Object Manager
 */
class ObjectManager implements ObjectManagerInterface
{
    /**
     * @var \Psr\Containter\ContainerInterface
     */
    private $container;

    /**
     * @var \TYPO3\CMS\Extbase\Object\Container\Container
     */
    protected $objectContainer;

    /**
     * Constructs a new Object Manager
     *
     * @param ContainerInterface $container
     * @param Container $objectContainer
     */
    public function __construct(ContainerInterface $container = null, Container $objectContainer = null)
    {
        // The fallback to NullContainer is currently required for unit tests
        $this->container = $container ?? new NullContainer;
        // The fallback to GeneralUtility::makeInstance is currently required for unit tests
        $this->objectContainer = $objectContainer ?? \TYPO3\CMS\Core\Utility\GeneralUtility::makeInstance(Container::class, $this->container);
    }

    /**
     * Serialization (sleep) helper.
     *
     * Removes properties of this object from serialization.
     * This action is necessary, since there might be closures used
     * in the accordant content objects (e.g. in FLUIDTEMPLATE) which
     * cannot be serialized. It's fine to reset $this->contentObjects
     * since elements will be recreated and are just a local cache,
     * but not required for runtime logic and behaviour.
     *
     * @see http://forge.typo3.org/issues/36820
     * @return array Names of the properties to be serialized
     * @internal only to be used within Extbase, not part of TYPO3 Core API.
     */
    public function __sleep()
    {
        // Use get_objects_vars() instead of
        // a much more expensive Reflection:
        $properties = get_object_vars($this);
        unset($properties['objectContainer']);
        return array_keys($properties);
    }

    /**
     * Unserialization (wakeup) helper.
     *
     * Initializes the properties again that have been removed by
     * a call to the __sleep() method on serialization before.
     *
     * @see http://forge.typo3.org/issues/36820
     * @internal only to be used within Extbase, not part of TYPO3 Core API.
     */
    public function __wakeup()
    {
        $this->__construct();
    }

    /**
     * Returns TRUE if an object with the given name is registered
     *
     * @param string $objectName Name of the object
     * @return bool TRUE if the object has been registered, otherwise FALSE
     * @internal only to be used within Extbase, not part of TYPO3 Core API.
     */
    public function isRegistered(string $objectName): bool
    {
        return class_exists($objectName, true);
    }

    /**
     * Returns a fresh or existing instance of the object specified by $objectName.
     *
     * @param string $objectName The name of the object to return an instance of
     * @param array $constructorArguments
     * @return object The object instance
     */
    public function get(string $objectName, ...$constructorArguments): object
    {
        list($childClass, $caller) = debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 2);
        file_put_contents('./objectManager_get.log', $objectName . PHP_EOL . '    ' . $caller['class'] . '::' . $caller['function'] . PHP_EOL . '        ' . $childClass['file'] . ' (' . $childClass['line'] . ')' . PHP_EOL, FILE_APPEND);

        if ($objectName === 'DateTime') {
            $instance = \TYPO3\CMS\Core\Utility\GeneralUtility::makeInstance($objectName, ...$constructorArguments);
        } else {
            if ($this->container->has($objectName)) {
                if (empty($constructorArguments)) {
                    $instance = $this->container->get($objectName);
                    // Ignore non objects and instanciate ourselves
                    if (is_object($instance)) {
                        return $instance;
                    }
                } else {
                    trigger_error($objectName . ' is available in the PSR-11 container. That means you should not try to instanciate it using constructor arguments. Falling back to legacy extbase based injection.', E_USER_DEPRECATED);
                }
            }
            $instance = $this->objectContainer->getInstance($objectName, $constructorArguments);
        }
        return $instance;
    }

    /**
     * Returns the scope of the specified object.
     *
     * @param string $objectName The object name
     * @return int One of the Container::SCOPE_ constants
     * @throws \TYPO3\CMS\Extbase\Object\Container\Exception\UnknownObjectException
     */
    public function getScope(string $objectName): int
    {
        if (!$this->isRegistered($objectName)) {
            throw new \TYPO3\CMS\Extbase\Object\Container\Exception\UnknownObjectException('Object "' . $objectName . '" is not registered.', 1265367590);
        }
        return $this->objectContainer->isSingleton($objectName) ? Container::SCOPE_SINGLETON : Container::SCOPE_PROTOTYPE;
    }

    /**
     * Create an instance of $className without calling its constructor
     *
     * @param string $className
     * @return object
     */
    public function getEmptyObject(string $className): object
    {
        return $this->objectContainer->getEmptyObject($className);
    }
}
