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
final class PseudoServiceProvider extends AbstractServiceProvider
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
        $packagePath = $this->package->getPackagePath();
        $extensions = parent::getExtensions();

        // AbstractServiceProviders configure*() methods use a PATH
        // class constant to read the package path.
        // We can not use that for pseudo service providers and therefore
        // dynamically inject the package path to service extensions.
        // AbstractServiceProvider configure methods are aware of that and
        // provide an optional thrid parameter which is used if invoked
        // from the PseudoServiceProvider.
        foreach ($extensions as $serviceName => $previousCallable) {
            $extensions[$serviceName] = function (ContainerInterface $container, $value) use ($previousCallable, $packagePath) {
                return ($previousCallable)($container, $value, $packagePath);
            };
        }

        return $extensions;
    }
}
