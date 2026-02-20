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
        '@typo3/install/' => 'EXT:install/Resources/Public/JavaScript/',
        '~labels/core.core' => 'VIRTUAL:install-labels/core.core',
        '~labels/core.mod_web_list' => 'VIRTUAL:install-labels/core.mod_web_list',
    ],
];
