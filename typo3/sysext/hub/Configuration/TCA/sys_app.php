<?php

use TYPO3\CMS\Hub\Form\ItemsProcFunc\AppScopes;
use TYPO3\CMS\Hub\Type\AppType;

return [
    'ctrl' => [
        'title' => 'hub.db:sys_app',
        'label' => 'name',
        'descriptionColumn' => 'description',
        'crdate' => 'createdon',
        'tstamp' => 'updatedon',
        'adminOnly' => true,
        'hideTable' => true,
        'rootLevel' => 1,
        'groupName' => 'system',
        'default_sortby' => 'name',
        'type' => 'app_type',
        'typeicon_column' => 'app_type',
        'typeicon_classes' => [
            'default' => 'content-webhook', // @todo Change to "content-app" when available
        ],
        'delete' => 'deleted',
        'enablecolumns' => [
            'disabled' => 'disabled',
            'starttime' => 'starttime',
            'endtime' => 'endtime',
        ],
        'versioningWS_alwaysAllowLiveEdit' => true,
    ],
    'types' => [
        'static' => [
            'showitem' => '
                --div--;core.form.tabs:general,
                --palette--;;config,
                impersonate_user,
                --div--;core.form.tabs:access,
                --palette--;;access',
            'columnsOverrides' => [
                'impersonate_user' => [
                    'config' => [
                        'required' => true,
                    ],
                ],
            ],
        ],
        'oauth' => [
            'showitem' => '
                --div--;core.form.tabs:general,
                --palette--;;config,
                redirect_uri,
                --div--;core.form.tabs:access,
                --palette--;;access',
        ],
    ],
    'palettes' => [
        'config' => [
            'label' => 'hub.db:palette.config',
            'description' => 'hub.db:palette.config.description',
            'showitem' => 'app_type, --linebreak--, name, description, --linebreak--, identifier, secret, --linebreak--, scopes, --linebreak--, logo',
        ],
        'access' => [
            'label' => 'core.form.palettes:access',
            'showitem' => 'disabled, starttime, endtime',
        ],
    ],
    'columns' => [
        'app_type' => [
            'label' => 'hub.db:sys_app.app_type',
            'description' => 'hub.db:sys_app.app_type.description',
            'config' => [
                'type' => 'select',
                'renderType' => 'selectSingle',
                'required' => true,
                'default' => AppType::OAUTH->value,
                'items' => [
                    //['label' => 'hub.db:sys_app.app_type.select', 'value' => ''],
                    // @todo generate via `AppType::cases()` and add labels to enum
                    ['label' => 'Static token', 'value' => AppType::STATIC->value],
                    ['label' => 'OAuth', 'value' => AppType::OAUTH->value],
                    ['label' => 'Frontend', 'value' => 'frontend'],
                ],
                'dbFieldLength' => 255,
            ],
        ],
        'name' => [
            'label' => 'hub.db:sys_app.name',
            'description' => 'hub.db:sys_app.name.description',
            'config' => [
                'type' => 'input',
                'required' => true,
                'max' => 100,
                'eval' => 'trim',
            ],
        ],
        'identifier' => [
            'label' => 'hub.db:sys_app.identifier',
            'description' => 'hub.db:sys_app.identifier.description',
            'config' => [
                'type' => 'uuid',
            ],
        ],
        'secret' => [
            'label' => 'hub.db:sys_app.secret',
            'description' => 'hub.db:sys_app.secret.description',
            'config' => [
                'type' => 'password',
                'required' => true,
                'fieldControl' => [
                    'tokenGenerator' => [
                        'renderType' => 'tokenGenerator',
                        'options' => [
                            'title' => 'hub.db:sys_app.secret.passwordGenerator',
                            'allowEdit' => false,
                            'passwordPolicy' => 'secretToken',
                        ],
                    ],
                ],
            ],
        ],
        'scopes' => [
            'label' => 'hub.db:sys_app.scopes',
            'description' => 'hub.db:sys_app.scopes.description',
            'config' => [
                'type' => 'select',
                'renderType' => 'selectCheckBox',
                'itemsProcFunc' => AppScopes::class . '->provideTcaSelectItems',
            ],
        ],
        'logo' => [
            'label' => 'Logo',
            'config' => [
                'type' => 'file',
                'allowed' => 'common-image-types',
                'appearance' => [
                    'createNewRelationLinkTitle' => 'frontend.ttc:images.addFileReference',
                ],
            ],
        ],
        'redirect_uri' => [
            'label' => 'hub.db:sys_app.redirect_uri',
            'description' => 'hub.db:sys_app.redirect_uri.description',
            'config' => [
                'type' => 'link',
                'allowedTypes' => ['url'],
            ],
        ],
        'impersonate_user' => [
            'label' => 'hub.db:sys_app.impersonate_user',
            'description' => 'hub.db:sys_app.impersonate_user.description',
            'config' => [
                'type' => 'group',
                'allowed' => 'be_users',
                'size' => 1,
                'relationship' => 'manyToOne',
                'nullable' => true,
            ],
        ],
        // "table_name" is not referenced in this TCA but needs to be defined here to ensure extensions can
        // add their own table names in their TCA overrides (using the allowTableForCreateRecordApp() API)
        'table_name' => [
            'label' => 'LLL:EXT:hub/Resources/Private/Language/locallang_db.xlf:sys_app.table_name',
            'description' => 'LLL:EXT:hub/Resources/Private/Language/locallang_db.xlf:sys_app.table_name.description',
            'onChange' => 'reload',
            'config' => [
                'type' => 'select',
                'renderType' => 'selectSingle',
                'required' => true,
                'default' => '',
                'items' => [],
                'itemsProcFunc' => \TYPO3\CMS\Hub\Form\AppItemsProcFunc::class . '->validateAllowedTablesForExternalCreation',
                'dbFieldLength' => 255,
            ],
        ],
    ],
];
