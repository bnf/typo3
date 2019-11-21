<?php
declare(strict_types = 1);
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
use Psr\Log\LoggerInterface;
use Psr\Log\NullLogger;
use TYPO3\CMS\Core\Core\Environment;

class LoggerFactory
{
    public static function getLogger(ContainerInterface $container, string $name): LoggerInterface
    {
        // Demo for possible opt-out in install-tool
        if ($container instanceof \TYPO3\CMS\Core\DependencyInjection\FailsafeContainer) {
            return new NullLogger();
        }

        $log = new \Monolog\Logger($name);
        // TODO: Read handlers from $GLOBALS['TYPO3_CONF_VARS]['LOG']['channels'][$name] instead.
        $log->pushHandler(new \Monolog\Handler\StreamHandler(Environment::getVarPath() . '/log/monolog-' . $name . '.log', \Monolog\Logger::WARNING));

        return $log;
    }
}
