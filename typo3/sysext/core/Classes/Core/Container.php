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
use Psr\Log\LoggerAwareInterface;
use TYPO3\CMS\Core\Log\LogManager;

/**
 * A decorator container adding TYPO3 style LoggerAwareInterface logger injection
 * @internal
 */
class Container implements ContainerInterface
{
    /**
     * @var ContainerInterface
     */
    protected $childContainer = null;

    /**
     * @var
     */
    protected $hasLoggerInjected = [];

    /**
     */
    public function setChildContainer(ContainerInterface $childContainer)
    {
        $this->childContainer = $childContainer;
    }

    /**
     * @param string $id
     * @return bool
     */
    public function has($id)
    {
        return $this->childContainer->has($id);
    }

    /**
     * @param string $id
     * @return mixed
     */
    public function get($id)
    {
        // @todo at this point XCLASS support could be implemented
        // @todo fetch SingletonInstances from GeneralUtility (UGLY)?

        $entry = $this->childContainer->get($id);
        //
        // @todo push SingletonInstances to GeneralUtility (UGLY)?

        if ($entry instanceof LoggerAwareInterface && !isset($this->hasLoggerInjected[$id])) {
            $entry->setLogger($this->childContainer->get(LogManager::class)->getLogger(get_class($entry)));
            $this->hasLoggerInjected[$id] = true;
        }

        return $entry;
    }
}
