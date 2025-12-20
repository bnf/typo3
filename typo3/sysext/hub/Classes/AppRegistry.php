<?php

declare(strict_types=1);

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

namespace TYPO3\CMS\Hub;

use TYPO3\CMS\Hub\App\AppInterface;

/**
 * Registry contains all possible app types which are available to the system
 *
 * @internal
 */
class AppRegistry
{
    /**
     * @param \IteratorAggregate<AppInterface> $registeredHub
     */
    public function __construct(
        private readonly \IteratorAggregate $registeredHub
    ) {}

    /**
     * @return \IteratorAggregate<AppInterface>
     */
    public function getAvailableAppTypes(): \IteratorAggregate
    {
        return $this->registeredHub;
    }

    public function getAppByType(string $type): ?AppInterface
    {
        return iterator_to_array($this->registeredHub->getIterator())[$type] ?? null;
    }
}
