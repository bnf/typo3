<?php

return [
    'backend' => [
        'imports' => [
            'TYPO3/CMS/Dashboard/' => [
                'path' => 'EXT:dashboard/Resources/Public/JavaScript/',
                'exclude' => [
                    'EXT:dashboard/Resources/Public/JavaScript/Contrib/',
                ],
            ],
            'muuri' => 'EXT:dashboard/Resources/Public/JavaScript/Contrib/muuri.esm.js',
            'web-animate' => 'EXT:dashboard/Resources/Public/JavaScript/Contrib/web-animate.esm.js',
        ],
    ],
];
