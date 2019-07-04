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

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Symfony\Component\DependencyInjection\Compiler\AbstractRecursivePass;
use Symfony\Component\DependencyInjection\Definition;
use TYPO3\CMS\Core\Utility\StringUtility;

/**
 * Make an educated guess on controller classes and mark them as public.
 *
 * @internal
 */
class ControllerWithPsr7ActionMethodsPass extends AbstractRecursivePass
{
    /**
     * @param mixed $value
     * @param bool $isRoot
     * @return mixed
     */
    protected function processValue($value, $isRoot = false)
    {
        $value = parent::processValue($value, $isRoot);

        if (!$value instanceof Definition || !$value->isAutoconfigured() || $value->isAbstract() || !$value->getClass()) {
            return $value;
        }

        if (!StringUtility::endsWith($value->getClass(), 'Controller')) {
            return $value;
        }
        if (!$reflectionClass = $this->container->getReflectionClass($value->getClass(), false)) {
            return $value;
        }

        foreach ($reflectionClass->getMethods() as $reflectionMethod) {
            $r = $reflectionMethod;

            // Only treat public methods
            if (!$reflectionMethod->isPublic()) {
                continue;
            }

            $parameters = $reflectionMethod->getParameters();
            $hasRequestTypeParameterOnly = (
                count($parameters) === 1 &&
                isset($parameters[0]) &&
                $parameters[0]->hasType() &&
                (string)$parameters[0]->getType() === ServerRequestInterface::class
            );

            $hasResponseReturnType = (
                $reflectionMethod->hasReturnType() &&
                (
                    (string)$reflectionMethod->getReturnType() === ResponseInterface::class ||
                    in_array(ResponseInterface::class, @class_implements((string)$reflectionMethod->getReturnType()) ?: [])
                )
                && $reflectionMethod->getReturnType()->allowsNull() === false
            );

            if ($hasRequestTypeParameterOnly && $hasResponseReturnType) {
                $value->setPublic(true);
                return $value;
            }
            // Also handle actions that do not use the PSR-7 request argument – it's hard to detect them
            // So they need to have an 'Action' suffix or need to be called 'handleRequest'
            if ((StringUtility::endsWith($r->name, 'Action') || $r->name === 'handleRequest') && $hasResponseReturnType) {
                $value->setPublic(true);
                return $value;
            }
        }

        return $value;
    }
}
