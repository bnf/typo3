<?php

return [
    'dependencies' => [
        'backend',
        'core',
    ],
    'imports' => [
        'TYPO3/CMS/Dashboard/' => [
            'path' => 'EXT:dashboard/Resources/Public/JavaScript/',
            'exclude' => [
                'EXT:dashboard/Resources/Public/JavaScript/Contrib/',
            ],
        ],
        '@typo3/dashboard/contrib/chartjs.js' => 'EXT:dashboard/Resources/Public/JavaScript/Contrib/chartjs.js',
        'muuri' => 'EXT:dashboard/Resources/Public/JavaScript/Contrib/muuri.js',
        'web-animate' => 'EXT:dashboard/Resources/Public/JavaScript/Contrib/web-animate.js',
    ],
];
