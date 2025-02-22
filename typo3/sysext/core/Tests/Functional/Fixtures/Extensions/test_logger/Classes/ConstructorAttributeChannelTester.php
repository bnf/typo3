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

namespace TYPO3Tests\TestLogger;

use Psr\Log\LoggerInterface;
use TYPO3\CMS\Core\Log\Channel;

class ConstructorAttributeChannelTester
{
    protected LoggerInterface $logger;

    public function __construct(
        #[Channel('beep')]
        LoggerInterface $logger
    ) {
        $this->logger = $logger;
    }

    public function run(): void
    {
        $this->logger->debug('beep beep');
    }
}
