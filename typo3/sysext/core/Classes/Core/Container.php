<?php
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

class Container extends \Simplex\Container
{
    protected static $instance = null;

    /**
     * Instantiate the container.
     *
     * Objects and parameters can be passed as argument to the constructor.
     *
     * @param array $providers The service providers to register.
     * @param array $values The parameters or objects.
     * @param ContainerInterface $rootContainer Container from which to fetch dependencies. If null, this container
     *                                          will be considered the root container.
     */
    public function __construct(array $providers = [], array $values = [], ContainerInterface $rootContainer = null)
    {
        parent::__construct($providers, $values, $rootContainer);
        static::$instance = $this;
    }

    /**
     * Return 'this' as singleton
     *
     * DO NOT USE FOR NEW CODE, this is to preserve compatibility
     * for (to be) deprecated methods that do not have
     * access to the container
     *
     * @return Container
     * @internal This is not a public API method, do not use in own extensions
     * @deprecated will be removed with TYPO3 v10
     */
    public static function getInstance()
    {
        // @todo trigger E_USER_DEPRECATED
        return static::$instance;
    }
}
