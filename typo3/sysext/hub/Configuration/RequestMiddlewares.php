<?php

/**
 * Definitions for middlewares provided by EXT:hub
 */

use TYPO3\CMS\Hub\Http\Middleware\AppResolver;

return [
    'backend' => [
        'typo3/cms-hub/resolver' => [
            'target' => AppResolver::class,
            'before' => [
                'typo3/cms-backend/authentication',
            ],
        ],
    ],
];
