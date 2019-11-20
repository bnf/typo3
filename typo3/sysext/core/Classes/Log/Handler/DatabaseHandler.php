<?php

declare(strict_types=1);
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
use Psr\Container\ContainerInterface;
use TYPO3\CMS\Core\Core\RequestId;
use TYPO3\CMS\Core\Database\ConnectionPool;
use TYPO3\CMS\Core\Log\LogLevel;
use TYPO3\CMS\Core\Utility\GeneralUtility;

/**
 * A handler that writes log files into sys_log table of TYPO3.
 */
class DatabaseHandler extends AbstractProcessingHandler
{
    private ContainerInterface $container;

    public function __construct(ContainerInterface $container, string $level, bool $bubble = true)
    {
        parent::__construct($level, $bubble);
        $this->container = $container;
    }

    /**
     * @inheritDoc
     */
    protected function write(array $record): void
    {
        if (!$this->container->get('boot.state')->complete) {
            // ConnectionPool usage must not be used during TCA loading, use a NullHandler for this service
            return;
        }

        $context = $record['context'];
        $context += $record['extra'];
        // Stringify an exception into context so it can be jsonified.
        if (isset($context['exception']) && $context['exception'] instanceof \Throwable) {
            $context['exception'] = (string)$context['exception'];
        }

        // We're deliberately not using the formatted string here, because
        // we want to format it ourselves on the display side.
        $insert = [
            'request_id' => (string)GeneralUtility::getContainer()->get(RequestId::class),
            'details' => $record['message'],
            // traditional database writer used to write into message
            // @todo: remove?
            'message' => $record['message'],
            'channel' => $record['channel'],
            'level' => LogLevel::normalizeLevel($record['level_name']),
            'data' => json_encode($context, \JSON_THROW_ON_ERROR),
            /** @var \DateTimeImmutable $record['datetime'] */
            'tstamp' => $record['datetime']->format('U'),
        ];

        $conn = $this->container->get(ConnectionPool::class)->getConnectionForTable('sys_log');
        $conn->insert('sys_log', $insert);
    }
}
