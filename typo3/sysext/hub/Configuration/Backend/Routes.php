<?php

use TYPO3\CMS\Hub\Controller\AuthorizationController;
use TYPO3\CMS\Hub\Controller\TokenController;

/**
 * Definitions for routes provided by EXT:hub
 */
return [
    'oauth_authorize' => [
        'path' => '/oauth/authorize',
        'access' => 'authenticated-without-token',
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
        'access' => 'anonymous',
        'methods' => ['POST', 'OPTIONS'],
        'target' => TokenController::class . '::handle',
    ],
];
