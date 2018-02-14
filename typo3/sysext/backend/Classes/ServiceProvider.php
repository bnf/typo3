<?php
declare(strict_types = 1);
namespace TYPO3\CMS\Backend;

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
use TYPO3\CMS\Core\Configuration\ConfigurationManager;
use TYPO3\CMS\Core\Package\AbstractServiceProvider;

/**
 * @internal
 */
class ServiceProvider extends AbstractServiceProvider
{
    const PATH = __DIR__ . '/../';

    public function getFactories(): array
    {
        return [
            Http\Application::class => [ static::class, 'getApplication' ],
        ];
    }

    public static function getApplication(ContainerInterface $container): Http\Application
    {
        // Load base TCA
        $GLOBALS['TCA'] = $container->get('tca');

        return new Http\Application($container->get(ConfigurationManager::class));
    }
}
