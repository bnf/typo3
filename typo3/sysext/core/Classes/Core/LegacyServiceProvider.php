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

use Psr\Container\ContainerInterface;

final class LegacyServiceProvider extends AbstractServiceProvider
{
    /**
     * @var string
     */
    private $extkey;

    /**
     * @var string
     */
    private $path;

    /**
     * @param string $extkey
     * @param string $path
     */
    public function __construct(string $extkey, string $path)
    {
        $this->extkey = $extkey;
        $this->path = $path;
    }

    public function getExtensions(): array
    {
        $extensions = parent::getExtensions();

        // dynamically inject the extension path as
        // we can not use a constant for legacy extensions
        // (which do not have an own ServiceProvider)
        foreach ($extensions as $service => $callable) {
            $extensions[$service] = function (ContainerInterface $container, $value) use ($callable) {
                return ($callable)($container, $value, $this->path);
            };
        }

        return $extensions;
    }
}
