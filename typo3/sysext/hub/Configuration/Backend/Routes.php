<?php

use TYPO3\CMS\Hub\Controller\AuthorizationController;
use TYPO3\CMS\Hub\Controller\TokenController;
use TYPO3\CMS\Hub\Http\AppHandler;

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
        'target' => AppHandler::class . '::dummyAction',
    ],
    'oauth_authorize' => [
        'path' => '/oauth/authorize',
        'access' => 'public',
        'methods' => ['GET', 'POST'],
        'target' => AuthorizationController::class . '::authorizeAction',
        'referrer' => 'required,refresh-always',
        'redirect' => [
            'enable' => true,
            'standalone' => true,
            'parameters' => array_fill_keys(
                AuthorizationController::getParameters(),
                true,
            ),
        ],
    ],
    'oauth_token' => [
        'path' => '/oauth/token',
        'access' => 'public',
        'methods' => ['POST', 'OPTIONS'],
        'target' => TokenController::class . '::handle',
    ],
];
