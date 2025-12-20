<?php

defined('TYPO3') or die();

\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addTcaSelectItem(
    'sys_app',
    'app_type',
    [
        'label' => \T3docs\Examples\App\ExampleAppType::getDescription(),
        'value' => \T3docs\Examples\App\ExampleAppType::getType(),
        'icon' => \T3docs\Examples\App\ExampleAppType::getIconIdentifier(),
    ]
);
