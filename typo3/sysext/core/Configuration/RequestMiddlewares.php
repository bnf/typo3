<?php
/**
 * An array consisting of implementations of middlewares for a middleware stack to be registered
 *
 *  'stackname' => [
 *      'middleware-identifier' => [
 *         'target' => classname or callable
 *         'before/after' => array of dependencies
 *      ]
 *   ]
 */
return [
    'frontend' => [
        'typo3/cms-core/content-security-policy' => [
            'target' => \TYPO3\CMS\Core\Middleware\ContentSecurityPolicy::class,
        ],
    ],
    'backend' => [
        'typo3/cms-core/content-security-policy' => [
            'target' => \TYPO3\CMS\Core\Middleware\ContentSecurityPolicy::class,
        ],
    ],
];
