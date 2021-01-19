<?php

return [
    'dependencies' => [
        'backend',
        'core',
    ],
    'tags' => [
        'backend.module',
    ],
    'imports' => [
        '@typo3/lowlevel/' => 'EXT:lowlevel/Resources/Public/JavaScript/',
    ],
];
