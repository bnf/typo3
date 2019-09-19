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


use Doctrine\Common\Annotations\AnnotationReader;
use Symfony\Component\DependencyInjection\Compiler\AbstractRecursivePass;
use Symfony\Component\DependencyInjection\Definition;
use TYPO3\CMS\Extbase\Annotation\Inject;


/**
 * Looks for definitions with autowiring enabled and registers their corresponding "@Inject" properties.
 */
class AutowireInjectPropertiesPass extends AbstractRecursivePass
{
    /**
     * @var AnnotationReader
     */
    private $annotationReader;

    public function __construct()
    {
        $this->annotationReader = new AnnotationReader();
    }

    /**
     * @param mixed $value
     * @param bool $isRoot
     * @return mixed
     */
    protected function processValue($value, $isRoot = false)
    {
        $value = parent::processValue($value, $isRoot);

        if (!$value instanceof Definition || !$value->isAutowired() || $value->isAbstract() || !$value->getClass()) {
            return $value;
        }
        if (!$reflectionClass = $this->container->getReflectionClass($value->getClass(), false)) {
            return $value;
        }

        $alreadyDefinedProperties = [];

        foreach ($value->getProperties() as $propertyName => $value) {
            $alreadyDefinedProperties[$propertyName] = true;
        }


        foreach ($reflectionClass->getProperties(\ReflectionProperty::IS_PUBLIC) as $reflectionProperty) {
            $r = $reflectionProperty;

            if (isset($alreadDefinedProperties[$r->name])) {
                continue;
            }

            $isInjectProperty = $propertyName !== 'settings' && ($this->annotationReader->getPropertyAnnotation($reflectionProperty, Inject::class) instanceof Inject);
            if (!$isInjectProperty) {
                continue;
            }

            $value->addProperty($r->name, null);
        }

        return $value;
    }
}
