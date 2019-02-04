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

use Symfony\Component\DependencyInjection\Compiler\AbstractRecursivePass;
use Symfony\Component\DependencyInjection\Definition;
use TYPO3\CMS\Core\Utility\GeneralUtility;

/**
 * Resolve a defined set of global variables names (parameter style using
 * %FOO.Bar%) to a factory that returns the value of the global variable.
 */
class ResolveGlobalVarsParameterPass extends AbstractRecursivePass
{
    /**
     * @param mixed $value
     * @param bool $isRoot
     * @return mixed
     */
    protected function processValue($value, $isRoot = false)
    {
        if (is_string($value) && substr($value, -1) === '%' && (
            substr($value, 0, 17) === '%TYPO3_CONF_VARS.' || $value === '%TYPO3_CONF_VARS%' ||
            substr($value, 0, 5) === '%TCA.' || $value === '%TCA%' ||
            substr($value, 0, 13) === '%T3_SERVICES.' || $value === '%T3_SERVICES%'
        )) {
            $path = substr($value, 1, -1);

            $definition = new Definition;
            $definition->setFactory([GeneralUtility::class, 'getGlobalArrayBySegments']);
            $definition->setArguments(explode('.', $path));

            return $definition;
        }

        $value = parent::processValue($value, $isRoot);

        return $value;
    }
}
