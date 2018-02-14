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

use Psr\Container\ContainerInterface;

/**
 * @internal
 */
final class LegacyServiceProvider extends AbstractServiceProvider
{
    /**
     * @var PackageInterface
     */
    private $package;

    /**
     * @param PackageInterface $package
     */
    public function __construct(PackageInterface $package)
    {
        $this->package = $package;
    }

    public function getExtensions(): array
    {
        $extensions = parent::getExtensions();

        // dynamically inject the extension path as
        // we can not use a constant for legacy extensions
        // (which do not have an own ServiceProvider)
        foreach ($extensions as $service => $callable) {
            $extensions[$service] = function (ContainerInterface $container, $value) use ($callable) {
                return ($callable)($container, $value, $this->package->getPackagePath());
            };
        }

        return $extensions;
    }
}
