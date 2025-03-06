<?php

declare(strict_types=1);

use TYPO3\CMS\Kai\Form\FieldControl\KaiSuggest;

defined('TYPO3') or die();

$GLOBALS['TYPO3_CONF_VARS']['SYS']['formEngine']['nodeRegistry'][1741035432] = [
    'nodeName' => 'kaiSuggest',
    'priority' => 40,
    'class' => KaiSuggest::class,
];
