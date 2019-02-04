<?php
declare(strict_types = 1);
namespace TYPO3\CMS\Core\DependencyInjection;

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

use Symfony\Component\DependencyInjection\EnvVarProcessorInterface;
use TYPO3\CMS\Core\Core\Environment;
use TYPO3\CMS\Core\Utility\ArrayUtility;

/**
 * @internal
 */
class GlobalsVarProcessor implements EnvVarProcessorInterface
{
    /**
     * @param string $prefix The namespace of the variable
     * @param string $name The name of the variable within the namespace
     * @param \Closure $getEnv A closure that allows fetching more env vars
     * @return mixed
     * @throws RuntimeException on error
     */
    public function getEnv($prefix, $name, \Closure $getEnv)
    {
        \TYPO3\CMS\Extbase\Utility\DebuggerUtility::var_dump($name);
        $val = ArrayUtility::getValueByPath($GLOBALS[$prefix], $name, ':');

        \TYPO3\CMS\Extbase\Utility\DebuggerUtility::var_dump($val);
        return $val;
    }

    /**
     * @return string[] The PHP-types managed by getEnv(), keyed by prefixes
     */
    public static function getProvidedTypes()
    {
        return [
            'TYPO3_CONF_VARS' => 'array|string|bool|int',
            'TCA' => 'array|string|bool|int',
            'T3_SERVICES' => 'array|string|bool|int',
        ];
    }
}
