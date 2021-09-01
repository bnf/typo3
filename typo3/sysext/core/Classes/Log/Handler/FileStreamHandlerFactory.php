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

use Monolog\Handler\HandlerInterface;
use Monolog\Handler\NoopHandler;
use Monolog\Handler\StreamHandler;
use Psr\Log\LogLevel;
use TYPO3\CMS\Core\Core\Environment;

class FileStreamHandlerFactory implements HandlerFactoryInterface
{
    public function createHandler(string $channel): HandlerInterface
    {
        $config = $GLOBALS['TYPO3_CONF_VARS']['monolog']['channels'][$channel]['handlers']['file'] ?? null;

        if ($config === null || ($config['disabled'] ?? false)) {
            return new NoopHandler();
        }

        return new StreamHandler(
            $config['path'] ?? Environment::getVarPath() . '/log/' . $channel . '.log',
            $config['logLevel'] ?? LogLevel::DEBUG,
            $config['bubble'] ?? true
        );
    }
}
