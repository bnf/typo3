<?php

defined('TYPO3') or die();

call_user_func(function () {
    // Add a field to pages table to identify styleguide demo pages.
    // Field is handled by DataHandler and is not needed to be shown in BE, so it is of type "passthrough"
    $additionalColumns = [
        'tx_styleguide_containsdemo' => [
            'config' => [
                'type' => 'passthrough',
            ],
        ],
    ];
    \TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addTCAcolumns('tt_content', $additionalColumns);
});

\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addTcaSelectItemGroup(
    'tt_content',
    'CType',
    'styleguide',
    'Styleguide Content Blocks'
);
