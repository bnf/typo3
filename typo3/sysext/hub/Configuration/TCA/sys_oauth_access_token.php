<?php

return [
    'ctrl' => [
        'title' => 'LLL:EXT:hub/Resources/Private/Language/locallang_db.xlf:sys_oauth_access_token',
        'label' => 'name',
        'descriptionColumn' => 'description',
        'crdate' => 'createdon',
        'tstamp' => 'updatedon',
        'adminOnly' => true,
        'hideTable' => true,
        'rootLevel' => 1,
        'groupName' => 'system',
        'default_sortby' => 'name',
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
            'showitem' => 'app_type, --linebreak--, name, description, --linebreak--, identifier, identifier',
        ],
        'access' => [
            'label' => 'core.form.palettes:access',
            'showitem' => 'disabled, starttime, endtime',
        ],
    ],
    'columns' => [

        'identifier' => [
            'config' => [
                'type' => 'input',
                'eval' => 'unique',
            ],
        ],

        'expiry_date' => [
            'config' => [
                'type' => 'datetime',
                'dbType' => 'datetime',
            ],
        ],

        'client_identifier' => [
            'config' => [
                'type' => 'uuid',
            ],
        ],

        'user_identifier' => [
            'config' => [
                'type' => 'input',
            ],
        ],

        'revoked' => [
            'config' => [
                'type' => 'check',
            ],
        ],

        'scopes' => [
            'config' => [
                'type' => 'json',
            ],
        ],
    ],
];
