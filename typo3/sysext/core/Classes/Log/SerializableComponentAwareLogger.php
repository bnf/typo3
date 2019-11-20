<?php

declare(strict_types=1);
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

use Psr\Container\ContainerInterface;
use Psr\Log\AbstractLogger;
use Psr\Log\LoggerInterface;
use Psr\Log\NullLogger;
use TYPO3\CMS\Core\Utility\GeneralUtility;

final class SerializableComponentAwareLogger extends AbstractLogger
{
    private LoggerInterface $logger;
    private string $component;
    private ?string $service;

    public function __construct(LoggerInterface $logger, string $component, ?string $service)
    {
        $this->logger = $logger;
        $this->component = $component;
        $this->service = $service;
    }

    public function log($level, $message, array $context = [])
    {
        $context['__TYPO3_COMPONENT'] = $this->component;
        $this->logger->log($level, $message, $context);
    }

    public function __sleep(): array
    {
        // Remove everything except the name and service, to be able to restore on wakeup
        return ['component', 'service'];
    }

    public function __wakeup()
    {
        if ($this->service !== null) {
            $logger = GeneralUtility::getContainer()->get($this->service);
            if (!$logger instanceof LoggerInterface) {
                throw new \InvalidArgumentException('Unserialized Logger service with name ' . $this->service . ' does not implement ' . LoggerInterface::class, 1631590239);
            }
            $this->logger = $logger;
        } else {
            $this->logger = new NullLogger();
        }
    }
}
