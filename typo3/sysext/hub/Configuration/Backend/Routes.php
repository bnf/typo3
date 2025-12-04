<?php

/**
 * Definitions for routes provided by EXT:hub
 */
return [
    'api' => [
        'path' => '/api/{handler?}',
        'requirements' => [
            'handler' => '.+',
        ],
        'access' => 'public',
        'methods' => ['GET', 'POST'],
        'target' => \TYPO3\CMS\Hub\Http\AppHandler::class . '::handleApiInBackendUserContext',
    ],
];
