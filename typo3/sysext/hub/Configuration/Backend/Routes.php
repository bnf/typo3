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
        'target' => \TYPO3\CMS\Hub\Http\AppHandler::class . '::dummyAction',
    ],
    'oauth_authorize' => [
        'path' => '/oauth/authorize',
        'access' => 'public',
        'methods' => ['GET', 'POST'],
        'target' => \TYPO3\CMS\Hub\Controller\AuthorizationController::class . '::authorizeAction',
        'standalone' => true,
        'redirect' => [
            'enable' => true,
            'parameters' => [
                'client_id' => true,
                'code_challenge' => true,
                'code_challenge_method' => true,
                'nonce' => true,
                'redirect_uri' => true,
                // Currently not supported
                //'response_mode' => true,
                'response_type' => true,
                'scope' => true,
                'state' => true,
            ],
        ],
    ],
    'oauth_token' => [
        'path' => '/oauth/token',
        'access' => 'public',
        'methods' => ['POST', 'OPTIONS'],
        'target' => \TYPO3\CMS\Hub\Controller\TokenController::class . '::handle',
    ],
];
