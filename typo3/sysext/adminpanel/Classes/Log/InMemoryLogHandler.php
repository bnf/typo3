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

namespace TYPO3\CMS\Adminpanel\Log;

use Psr\Http\Message\ServerRequestInterface;
use TYPO3\CMS\Adminpanel\Utility\MemoryUtility;
use TYPO3\CMS\Core\Core\Environment;
use TYPO3\CMS\Core\Http\ApplicationType;
use TYPO3\CMS\Core\Log\LogLevel;
use TYPO3\CMS\Core\Log\LogRecord;
use TYPO3\CMS\Core\Log\Writer\AbstractWriter;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use Monolog\Handler\AbstractHandler;
use Psr\Container\ContainerInterface;
use TYPO3\CMS\Core\Database\ConnectionPool;

/**
 * Log handler that writes the log records into a  class variable
 * for InMemory processing.
 */
class InMemoryLogHandler extends AbstractHandler
{
    private ContainerInterface $container;

    protected array $log = [];

    public function __construct(ContainerInterface $container, string $level, bool $bubble = true)
    {
        parent::__construct($level, $bubble);
        $this->container = $container;
    }

    public function handle(array $record): bool
    {
        if (!$this->isHandling($record)) {
            return false;
        }

        // Do not log if CLI, if not frontend, or memory limit has been reached.
        if (Environment::isCli()
            || !(($GLOBALS['TYPO3_REQUEST'] ?? null) instanceof  ServerRequestInterface)
            || !ApplicationType::fromRequest($GLOBALS['TYPO3_REQUEST'])->isFrontend()
            || self::$memoryLock === true
        ) {
            return false;
        }

        // Guard: Memory Usage
        if (MemoryUtility::isMemoryConsumptionTooHigh()) {
            $this->lockWriter();
            return false;
        }

        $this->log[] = $record;

        return $this->bubble === false;
    }

    public function reset(): void
    {
        parent::reset();

        $this->resetProcessors();
    }

    /**
     * Lock writer and add an info message that there may potentially be more entries.
     */
    protected function lockWriter(): void
    {
        self::$memoryLock = true;
        /** @var LogRecord $record */
        /*
        $record = GeneralUtility::makeInstance(
            LogRecord::class,
            LogLevel::INFO,
            'extra' => [
                'TYPO3.CMS.AdminPanel.Log.InMemoryLogWriter',
            ],
            '... Further log entries omitted, memory usage too high.'
        );
        self::$log[] = $record;
         */
    }
}
