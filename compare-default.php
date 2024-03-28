<?php

declare(strict_types=1);
require 'vendor/autoload.php';
use Symfony\Component\Yaml\Yaml;
use TYPO3\CMS\Core\Utility\ArrayUtility;

$fileName = 'typo3/sysext/core/Configuration/Settings.schema.yaml';
$data = Yaml::parseFile($fileName);

var_dump($data);
exit;

$defaultConfiguration = require('typo3/sysext/core/Configuration/DefaultConfiguration.php');

$default = [];

//var_dump($data);
foreach ($data['system']['settings'] as $propertyName => $setting) {
    $default = ArrayUtility::setValueByPath($default, $propertyName, $setting['default'] ?? null, '.');
}

//var_dump($default);

var_dump(arrayRecursiveDiff($defaultConfiguration, $default));

//echo Yaml::dump($schema, 99, 2, Yaml::DUMP_OBJECT | Yaml::DUMP_OBJECT_AS_MAP);

function arrayRecursiveDiff($aArray1, $aArray2)
{
    $aReturn = [];

    foreach ($aArray1 as $mKey => $mValue) {
        if (array_key_exists($mKey, $aArray2)) {
            if (is_array($mValue)) {
                $aRecursiveDiff = arrayRecursiveDiff($mValue, $aArray2[$mKey]);
                if (count($aRecursiveDiff)) {
                    $aReturn[$mKey] = $aRecursiveDiff;
                }
            } else {
                if ($mValue != $aArray2[$mKey]) {
                    $aReturn[$mKey] = $mValue;
                }
            }
        } else {
            $aReturn[$mKey] = $mValue;
        }
    }
    return $aReturn;
}
