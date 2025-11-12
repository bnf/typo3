<?php

use TYPO3\CMS\Hub\Controller\ManagementController;

/**
 * Definitions for modules provided by EXT:hub
 */
return [
    'integrations_hub' => [
        'parent' => 'integrations',
        'access' => 'admin',
        'workspaces' => 'live',
        'path' => '/module/integrations/hub',
        'iconIdentifier' => 'module-hub',
        'labels' => [
            'title' => 'LLL:EXT:hub/Resources/Private/Language/Modules/hub.xlf:title',
            'description' => 'LLL:EXT:hub/Resources/Private/Language/Modules/hub.xlf:description',
            'shortDescription' => 'LLL:EXT:hub/Resources/Private/Language/Modules/hub.xlf:shortDescription',
        ],
        'aliases' => ['system_hub'],
        'routes' => [
            '_default' => [
                'target' => ManagementController::class . '::overviewAction',
            ],
            'swagger' => [
                'target' => ManagementController::class . '::swaggerAction',
            ],
        ],
    ],
];
