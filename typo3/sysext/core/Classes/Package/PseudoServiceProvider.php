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

    /**
     * @return string
     */
    protected static function getPackagePath($computedPath = null): string
    {
        return $computedPath;
    }

    /**
     * @return array
     */
    public function getFactories(): array
    {
        return [];
    }

    /**
     * @return array
     */
    public function getExtensions(): array
    {
        $packagePath = $this->package->getPackagePath();
        $extensions = parent::getExtensions();

        // AbstractServiceProviders static configure*() methods call the static
        // method getPackagePath() to read the packages path.
        // We can not use that for pseudo service providers, therefore we
        // dynamically inject the package path to service extensions.
        // AbstractServiceProvider configure methods are aware of that and
        // provide an optional thrid parameter which passed to getPackagePath()
        foreach ($extensions as $serviceName => $previousCallable) {
            $extensions[$serviceName] = function (ContainerInterface $container, $value) use ($previousCallable, $packagePath) {
                return ($previousCallable)($container, $value, $packagePath);
            };
        }

        return $extensions;
    }
}
