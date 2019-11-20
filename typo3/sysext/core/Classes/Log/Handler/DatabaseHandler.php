<?php
declare(strict_types = 1);
namespace TYPO3\CMS\Core\Log\Handler;

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

use Monolog\Handler\AbstractProcessingHandler;
use Psr\Log\LogLevel;
use TYPO3\CMS\Core\Database\ConnectionPool;
use TYPO3\CMS\Core\Utility\GeneralUtility;

/**
 * A handler that writes log files into sys_log table of TYPO3.
 */
class DatabaseHandler extends AbstractProcessingHandler
{
    /**
     * @var array
     */
    private static $levels = [
        LogLevel::EMERGENCY => 0,
        LogLevel::ALERT => 1,
        LogLevel::CRITICAL => 2,
        LogLevel::ERROR => 3,
        LogLevel::WARNING => 4,
        LogLevel::NOTICE => 5,
        LogLevel::INFO => 6,
        LogLevel::DEBUG => 7,
    ];

    /**
     * Normalizes level by converting it from string to integer
     *
     * @param string $level
     * @return int
     */
    private static function normalizeLevel(string $level): int
    {
        if (!array_key_exists($level, self::$levels)) {
            throw new \InvalidArgumentException('Invalid Log Level ' . $level, 1575283921);
        }
        return self::$levels[$level];
    }

    /**
     * @param array $record
     */
    protected function write(array $record): void
    {
        $data = null;
        $context = $record['context'] ?? [];
        $context = is_array($context) ? $context : [];

        if (!empty($context)) {
            // According to PSR3 the exception-key may hold an \Exception
            // Since json_encode() does not encode an exception, we run the _toString() here
            if (isset($context['exception']) && $context['exception'] instanceof \Throwable) {
                $context['exception'] = (string)$context['exception'];
            }
            $data = '- ' . json_encode($context);
        }

        $timestamp = 0.0;
        if (($datetime = ($record['datetime'] ?? null)) instanceof \DateTimeInterface) {
            /** @var \DateTimeInterface $datetime */
            $timestamp = (float)$datetime->format('U.u');
        }

        $fieldValues = [
//            'request_id' => $record->getRequestId(),
            'time_micro' => $timestamp,
//            'component' => $record->getComponent(),
            'level' => self::normalizeLevel(strtolower($record['level_name'])),
            'message' => $record['message'] ?? null,
            'data' => $data
        ];

        GeneralUtility::makeInstance(ConnectionPool::class)
            ->getConnectionForTable('sys_log')
            ->insert('sys_log', $fieldValues)
        ;
    }
}
