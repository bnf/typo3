<?php
declare(strict_types = 1);
namespace TYPO3\CMS\T3editor;

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
use TYPO3\CMS\Core\Core\AbstractServiceProvider;
use TYPO3\CMS\Core\Utility\GeneralUtility;

class ServiceProvider extends AbstractServiceProvider
{
    public function getFactories(): array
    {
        return [
            Registry\AddonRegistry::class => [ static::class, 'getAddonRegistry' ],
            Registry\ModeRegistry::class => [ static::class, 'getModeRegistry' ],
            T3editor::class => [ static::class, 'getT3editor' ],
        ];
    }

    public static function getAddonRegistry(ContainerInterface $container): Registry\AddonRegistry
    {
        return GeneralUtility::makeInstance(Registry\AddonRegistry::class);
    }

    public static function getModeRegistry(ContainerInterface $container): Registry\ModeRegistry
    {
        return GeneralUtility::makeInstance(Registry\ModeRegistry::class);
    }

    public static function getT3editor(ContainerInterface $container): T3editor
    {
        return GeneralUtility::makeInstance(T3editor::class);
    }
}
