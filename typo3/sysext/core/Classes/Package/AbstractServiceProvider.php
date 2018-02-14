<?php
declare(strict_types = 1);
namespace TYPO3\CMS\Core\Package;

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

use Interop\Container\ServiceProviderInterface;
use Psr\Container\ContainerInterface;
use Psr\Log\LoggerAwareInterface;
use TYPO3\CMS\Core\Log\LogManager;

/**
 * @internal
 */
abstract class AbstractServiceProvider implements ServiceProviderInterface
{
    public function getFactories(): array
    {
        return [];
    }

    public function getExtensions(): array
    {
        return [];
    }

    /**
     * Create an instance of a class. Supports auto injection of the logger.
     *
     * @param ContainerInterface $container
     * @param string $className name of the class to instantiate, must not be empty and not start with a backslash
     * @param array $constructorArguments Arguments for the constructor
     */
    protected static function new(ContainerInterface $container, string $className, array $constructorArguments = [])
    {
        $instance = new $className(...$constructorArguments);
        if ($instance instanceof LoggerAwareInterface) {
            $instance->setLogger($container->get(LogManager::class)->getLogger($className));
        }
        return $instance;
    }
}
