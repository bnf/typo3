<?php

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

namespace TYPO3\CMS\Core\Log;

use Psr\Log\AbstractLogger;
use Psr\Log\LoggerInterface;

final class LoggerComponentClosure extends AbstractLogger
{
    private LoggerInterface $logger;
    private string $component;

    public function __construct(LoggerInterface $logger, string $component)
    {
        $this->logger = $logger;
        $this->component = $component;
    }

    public function log($level, $message, array $context = []) {
        $context['component'] = $this->component;
        $this->logger->log($level, $message, $context);
    }
}
