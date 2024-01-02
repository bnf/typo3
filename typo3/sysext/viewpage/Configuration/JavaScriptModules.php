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
        '@typo3/viewpage/' => 'EXT:viewpage/Resources/Public/JavaScript/',
    ],
];
