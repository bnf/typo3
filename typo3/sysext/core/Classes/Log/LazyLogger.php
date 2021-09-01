<?php

namespace TYPO3\CMS\Core\Log;

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

use Psr\Log\LoggerInterface;
use Psr\Log\AbstractLogger;

/**
 * @internal
 */
class LazyLogger extends AbstractLogger
{
    protected LogManager $logManager;

    protected string $name;

    protected ?LoggerInterface $logger = null;

    public function __construct(LogManager $logManager, string $name)
    {
        $this->name = $name;
        $this->logManager = $logManager;
    }

    private function getLogger(): LoggerInterface
    {
        return $this->logger = $this->logManager->getLoggerInstance($this->name);
    }

    public function log($level, $message, array $context = []) {
        $logger = $this->logger ?? $this->getLogger();
        $logger->log($level, $message, $context);
    }
}
