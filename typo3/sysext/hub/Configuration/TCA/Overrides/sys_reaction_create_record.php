<?php

\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addTCAcolumns(
    'sys_app',
    [
        'storage_pid' => [
            'label' => 'LLL:EXT:hub/Resources/Private/Language/locallang_db.xlf:sys_app.storage_pid',
            'description' => 'LLL:EXT:hub/Resources/Private/Language/locallang_db.xlf:sys_app.storage_pid.description',
            'config' => [
                'type' => 'group',
                'allowed' => 'pages',
                'size' => 1,
                'relationship' => 'manyToOne',
            ],
        ],
        'fields' => [
            'label' => 'LLL:EXT:hub/Resources/Private/Language/locallang_db.xlf:sys_app.fields',
            'description' => 'LLL:EXT:hub/Resources/Private/Language/locallang_db.xlf:sys_app.fields.description',
            'displayCond' => 'FIELD:table_name:REQ:true',
            'config' => [
                'type' => 'json',
                'renderType' => 'fieldMap',
                'default' => '{}',
            ],
        ],
    ]
);

\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addTcaSelectItem(
    'sys_app',
    'app_type',
    [
        'label' => \TYPO3\CMS\Hub\App\CreateRecordApp::getDescription(),
        'value' => \TYPO3\CMS\Hub\App\CreateRecordApp::getType(),
        'icon' => \TYPO3\CMS\Hub\App\CreateRecordApp::getIconIdentifier(),
    ]
);

\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addTcaSelectItem(
    'sys_app',
    'table_name',
    [
        'label' => ($GLOBALS['TCA']['pages']['ctrl']['title'] ?? '') ?: 'pages',
        'value' => 'pages',
        'icon' => 'apps-pagetree-page-default',
    ]
);
\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addTcaSelectItem(
    'sys_app',
    'table_name',
    [
        'label' => ($GLOBALS['TCA']['sys_category']['ctrl']['title'] ?? '') ?: 'sys_category',
        'value' => 'sys_category',
        'icon' => 'mimetypes-x-sys_category',
    ]
);
\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addTcaSelectItem(
    'sys_app',
    'table_name',
    [
        'label' => ($GLOBALS['TCA']['sys_file_collection']['ctrl']['title'] ?? '') ?: 'sys_file_collection',
        'value' => 'sys_file_collection',
        'icon' => 'apps-filetree-folder-media',
    ]
);

$GLOBALS['TCA']['sys_app']['ctrl']['typeicon_classes'][\TYPO3\CMS\Hub\App\CreateRecordApp::getType()] = \TYPO3\CMS\Hub\App\CreateRecordApp::getIconIdentifier();

$GLOBALS['TCA']['sys_app']['palettes']['createRecord'] = [
    'label' => 'hub.db:palette.additional',
    'showitem' => 'table_name, --linebreak--, storage_pid, impersonate_user, --linebreak--, fields',
];

$GLOBALS['TCA']['sys_app']['types'][\TYPO3\CMS\Hub\App\CreateRecordApp::getType()] = [
    'showitem' => '
        --div--;core.form.tabs:general,
        --palette--;;config,
        --palette--;;createRecord,
        --div--;core.form.tabs:access,
        --palette--;;access',
    'columnsOverrides' => [
        'impersonate_user' => [
            'config' => [
                'minitems' => 1,
            ],
        ],
    ],
];
