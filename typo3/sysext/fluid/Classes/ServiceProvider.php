<?php
declare(strict_types = 1);
namespace TYPO3\CMS\Fluid;

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
    const PATH = __DIR__ . '/../';

    public function getFactories(): array
    {
        return [
            Core\Widget\AjaxWidgetContextHolder::class => [ static::class, 'getAjaxWidgetContextHolder' ],
        ];
    }

    public static function getAjaxWidgetContextHolder(ContainerInterface $container): Core\Widget\AjaxWidgetContextHolder
    {
        return GeneralUtility::makeInstance(Core\Widget\AjaxWidgetContextHolder::class);
    }
}
