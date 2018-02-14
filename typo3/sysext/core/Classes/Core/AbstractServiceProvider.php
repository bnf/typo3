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

use Interop\Container\ServiceProviderInterface;

abstract class AbstractServiceProvider implements ServiceProviderInterface
{
    /**
     * @param string $extkey
     */
    public function __construct(string $extkey, string $path)
    {
        $this->extkey = $extkey;
        $this->path = $path;
    }

    public function getFactories(): array
    {
        return [
        ];
    }

    public function getExtensions(): array
    {
        return [];
    }
}
