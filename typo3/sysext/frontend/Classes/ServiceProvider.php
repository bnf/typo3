<?php
declare(strict_types = 1);
namespace TYPO3\CMS\Frontend;

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

use Composer\Autoload\ClassLoader;
use Interop\Container\ServiceProviderInterface;
use Psr\Container\ContainerInterface;
use TYPO3\CMS\Frontend\Http\Application;

class ServiceProvider implements ServiceProviderInterface
{
    public function getFactories(): array
    {
        return [
            Application::class => [ static::class, 'getApplication' ],
        ];
    }

    public function getExtensions(): array
    {
        return [];
    }

    /**
     * @return Application
     */
    public static function getApplication(ContainerInterface $container): Application
    {
        return new Application($container->get(ClassLoader::class));
    }
}
