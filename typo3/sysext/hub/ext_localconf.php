<?php

declare(strict_types=1);

use TYPO3\CMS\Hub\Form\FieldControl\TokenGenerator;

defined('TYPO3') or die();

$GLOBALS['TYPO3_CONF_VARS']['SYS']['formEngine']['nodeRegistry'][1766577484] = [
    'nodeName' => 'tokenGenerator',
    'priority' => 40,
    'class' => TokenGenerator::class,
];
