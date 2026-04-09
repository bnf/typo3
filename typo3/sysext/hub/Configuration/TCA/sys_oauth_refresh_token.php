<?php

return [
    'ctrl' => [
        'title' => 'hub.db:sys_oauth_refresh_token',
        'label' => 'identifier',
        'crdate' => 'createdon',
        'tstamp' => 'updatedon',
        'adminOnly' => true,
        'hideTable' => true,
        'rootLevel' => 1,
        'groupName' => 'system',
        'default_sortby' => 'identifier',
        'versioningWS_alwaysAllowLiveEdit' => true,
    ],
    'types' => [
        '1' => [
            'showitem' => '
                --div--;core.form.tabs:general,
                --palette--;;config',
        ],
    ],
    'palettes' => [
        'config' => [
            'label' => 'hub.db:palette.config',
            'description' => 'hub.db:palette.config.description',
            'showitem' => 'identifier, --linebreak--, revoked, expiry_date, --linebreak--, access_token_identifier',
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

        'access_token_identifier' => [
            'config' => [
                'type' => 'input',
            ],
        ],

        'revoked' => [
            'config' => [
                'type' => 'check',
            ],
        ],
    ],
];
