<?php

declare(strict_types=1);

use TYPO3\CMS\Hub\Form\FieldControl\TokenGenerator;
use TYPO3\CMS\Hub\Form\Element\FieldMapElement;

defined('TYPO3') or die();

$GLOBALS['TYPO3_CONF_VARS']['SYS']['formEngine']['nodeRegistry'][1766577484] = [
    'nodeName' => 'tokenGenerator',
    'priority' => 40,
    'class' => TokenGenerator::class,
];

$GLOBALS['TYPO3_CONF_VARS']['SYS']['formEngine']['nodeRegistry'][1660911089] = [
    'nodeName' => 'fieldMap',
    'priority' => 40,
    'class' => FieldMapElement::class,
];
