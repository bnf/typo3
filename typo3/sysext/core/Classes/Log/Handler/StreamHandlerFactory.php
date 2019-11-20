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
use Monolog\Handler\StreamHandler;
use Psr\Log\LogLevel;
use TYPO3\CMS\Core\Core\Environment;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Core\Utility\PathUtility;

class StreamHandlerFactory implements HandlerFactoryInterface
{
    /**
     * Default log file path
     */
    protected string $defaultLogFileTemplate = '/log/typo3_%s.log';

    public function createHandler(string $identifier, string $channel, array $config): ?HandlerInterface
    {
        $logFile = $config['path'] ?? $this->getDefaultLogFileName($identifier === 'main' ? '' : $identifier);
        $this->createLogFileDirectory($logFile);

        return new StreamHandler(
            $logFile,
            $config['level'] ?? LogLevel::DEBUG,
            $config['bubble'] ?? true
        );
    }

    /**
     * Returns the path to the default log file.
     * Uses the defaultLogFileTemplate and replaces the %s placeholder with a short MD5 hash
     * based on a static string and the current encryption key.
     */
    protected function getDefaultLogFileName(string $logFileInfix): string
    {
        $namePart = substr(GeneralUtility::hmac($this->defaultLogFileTemplate, 'defaultLogFile'), 0, 10);
        if ($logFileInfix !== '') {
            $namePart = $logFileInfix . '_' . $namePart;
        }
        return Environment::getVarPath() . sprintf($this->defaultLogFileTemplate, $namePart);
    }

    /**
     * Creates the log file with correct permissions
     * and parent directories, if needed
     *
     * @todo: Copied from Log\Writer\FileWriter, share this code.
     */
    protected function createLogFileDirectory(string $logFile)
    {
        if (file_exists($logFile)) {
            return;
        }

        // skip mkdir if logFile refers to any scheme but vfs://, file:// or empty
        $scheme = parse_url($logFile, PHP_URL_SCHEME);
        if ($scheme === null || $scheme === 'file' || $scheme === 'vfs' || GeneralUtility::isAbsPath($logFile)) {
            // remove file:/ before creating the directory
            $logFileDirectory = PathUtility::dirname((string)preg_replace('#^file:/#', '', $logFile));
            if (!@is_dir($logFileDirectory)) {
                GeneralUtility::mkdir_deep($logFileDirectory);
                // create .htaccess file if log file is within the site path
                if (PathUtility::getCommonPrefix([Environment::getPublicPath() . '/', $logFileDirectory]) === (Environment::getPublicPath() . '/')) {
                    // only create .htaccess, if we created the directory on our own
                    $this->createHtaccessFile($logFileDirectory . '/.htaccess');
                }
            }
        }
    }

    /**
     * Creates .htaccess file inside a new directory to access protect it
     *
     * @param string $htaccessFile Path of .htaccess file
     * @todo: Copied from Log\Writer\FileWriter, share this code.
     */
    protected function createHtaccessFile($htaccessFile)
    {
        // write .htaccess file to protect the log file
        if (!empty($GLOBALS['TYPO3_CONF_VARS']['SYS']['generateApacheHtaccess']) && !file_exists($htaccessFile)) {
            $htaccessContent = <<<END
# Apache < 2.3
<IfModule !mod_authz_core.c>
	Order allow,deny
	Deny from all
	Satisfy All
</IfModule>

# Apache ≥ 2.3
<IfModule mod_authz_core.c>
	Require all denied
</IfModule>
END;
            GeneralUtility::writeFile($htaccessFile, $htaccessContent);
        }
    }
}
