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
            'showitem' => 'app_type, --linebreak--, name, description, --linebreak--, identifier, identifier',
        ],
        'access' => [
            'label' => 'core.form.palettes:access',
            'showitem' => 'disabled, starttime, endtime',
        ],
    ],
    'columns' => [

        /*
             'identifier' => $accessToken->getIdentifier(),
             'expirty_date' => $accessToken->getExpiryDateTime(),
             'client_identifier' => $accessToken->getClient()->getIdentifier(),
             'user_identifier' => $accessToken->getUserIdentifier(),
             'revoked' => false,
             'scopes' => array_values($accessTokenEntity->getScopes()),
         */

        'identifier' => [
            'config' => [
                'type' => 'input',
                'eval' => 'unique',
            ],
        ],
        'name' => [
            'label' => 'LLL:EXT:hub/Resources/Private/Language/locallang_db.xlf:sys_oauth_access_token.name',
            'description' => 'LLL:EXT:hub/Resources/Private/Language/locallang_db.xlf:sys_oauth_access_token.name.description',
            'config' => [
                'type' => 'input',
                'required' => true,
                'max' => 100,
                'eval' => 'trim',
            ],
        ],
        'identifier' => [
            'label' => 'LLL:EXT:hub/Resources/Private/Language/locallang_db.xlf:sys_oauth_access_token.identifier',
            'description' => 'LLL:EXT:hub/Resources/Private/Language/locallang_db.xlf:sys_oauth_access_token.identifier.description',
            'config' => [
                'type' => 'uuid',
            ],
        ],
        'identifier' => [
            'label' => 'LLL:EXT:hub/Resources/Private/Language/locallang_db.xlf:sys_oauth_access_token.identifier',
            'description' => 'LLL:EXT:hub/Resources/Private/Language/locallang_db.xlf:sys_oauth_access_token.identifier.description',
            'config' => [
                'type' => 'password',
                'required' => true,
                'fieldControl' => [
                    'passwordGenerator' => [
                        'renderType' => 'passwordGenerator',
                        'options' => [
                            'title' => 'LLL:EXT:hub/Resources/Private/Language/locallang_db.xlf:sys_oauth_access_token.identifier.passwordGenerator',
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
            'label' => 'LLL:EXT:hub/Resources/Private/Language/locallang_db.xlf:sys_oauth_access_token.impersonate_user',
            'description' => 'LLL:EXT:hub/Resources/Private/Language/locallang_db.xlf:sys_oauth_access_token.impersonate_user.description',
            'config' => [
                'type' => 'group',
                'allowed' => 'be_users',
                'size' => 1,
                'relationship' => 'manyToOne',
            ],
        ],
        // "table_name" is not referenced in this TCA but needs to be defined here to ensure extensions can
        // add their own table names in their TCA overrides (using the allowTableForCreateRecordApp() API)
        'table_name' => [
            'label' => 'LLL:EXT:hub/Resources/Private/Language/locallang_db.xlf:sys_oauth_access_token.table_name',
            'description' => 'LLL:EXT:hub/Resources/Private/Language/locallang_db.xlf:sys_oauth_access_token.table_name.description',
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
