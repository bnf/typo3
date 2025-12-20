<?php

/**
 * Definitions for routes provided by EXT:hub
 */
return [
    'api' => [
        //'path' => '/api/{handler?}',
        'path' => '/api',
        /*
        'requirements' => [
            'handler' => '.+',
        ],
         */
        'access' => 'public',
        'methods' => ['GET'],
        'target' => \TYPO3\CMS\Hub\Http\AppHandler::class . '::handleApiInBackendUserContext',
    ],
];
