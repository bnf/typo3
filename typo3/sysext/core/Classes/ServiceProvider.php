<?php
declare(strict_types = 1);
namespace TYPO3\CMS\Core;

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

class ServiceProvider implements ServiceProviderInterface
{
    public function getFactories(): array
    {
        return [
            \Composer\Autoload\ClassLoader::class => [ static::class, 'getClassLoader' ],
        ];
    }

    public function getExtensions(): array
    {
        return [];
    }

    /**
     * @return void
     */
    public static function getClassLoader(): ClassLoader
    {
        throw new \Exception('The composer class loader needs to be passed to the container directly.', 1518115903);
    }
}
