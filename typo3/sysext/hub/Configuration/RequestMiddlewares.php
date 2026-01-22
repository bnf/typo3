<?php

/**
 * Definitions for middlewares provided by EXT:hub
 */

use TYPO3\CMS\Hub\Http\Middleware\AppResolver;
use TYPO3\CMS\Hub\Http\Middleware\FrontendAppResolver;
use TYPO3\CMS\Hub\Http\Middleware\Metadata;

return [
    'core' => [
        'typo3/cms-hub/metadata' => [
            'target' => Metadata::class,
            'after' => [
                'typo3/cms-core/normalized-params-attribute',
            ],
        ],
    ],
    'backend' => [
        'typo3/cms-hub/resolver' => [
            'target' => AppResolver::class,
            'before' => [
                'typo3/cms-backend/authentication',
            ],
        ],
    ],
    'frontend' => [
        'typo3/cms-hub/frontend-resolver' => [
            'target' => FrontendAppResolver::class,
            'after' => [
                'typo3/cms-frontend/site',
            ],
            'before' => [
                'typo3/cms-core/request-token-middleware',
                'typo3/cms-frontend/backend-user-authentication',
                'typo3/cms-frontend/authentication',
                'typo3/cms-frontend/page-resolver',
            ],
        ],
    ],
];
