<?php

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
        '1' => [
            'showitem' => '
                --div--;core.form.tabs:general,
                --palette--;;config,
                --div--;core.form.tabs:access,
                --palette--;;access',
        ],
    ],
    'palettes' => [
        'config' => [
            'label' => 'hub.db:palette.config',
            'description' => 'hub.db:palette.config.description',
            'showitem' => 'app_type, --linebreak--, name, description, --linebreak--, identifier, secret',
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
                'items' => [
                    //['label' => 'hub.db:sys_app.app_type.select', 'value' => ''],
                    ['label' => 'Static token', 'value' => 'static'],
                    ['label' => 'OAuth', 'value' => 'oauth'],
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
                            'passwordRules' => [
                                'length' => 40,
                                'random' => 'hex',
                            ],
                        ],
                    ],
                ],
            ],
        ],
        // "impersonate_user" is not referenced in this TCA but needs to be defined here since
        // EXT:hub relies on the field at some points, e.g. in the AppInstruction model.
        'impersonate_user' => [
            'label' => 'hub.db:sys_app.impersonate_user',
            'description' => 'hub.db:sys_app.impersonate_user.description',
            'config' => [
                'type' => 'group',
                'allowed' => 'be_users',
                'size' => 1,
                'relationship' => 'manyToOne',
            ],
        ],
    ],
];
