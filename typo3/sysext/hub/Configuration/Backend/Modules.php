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
        'labels' => 'hub.module',
        'routes' => [
            '_default' => [
                'target' => ManagementController::class . '::overviewAction',
            ],
        ],
    ],
];
