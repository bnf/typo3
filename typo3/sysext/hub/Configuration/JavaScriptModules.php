<?php

return [
    'dependencies' => [
        'backend',
        'core',
    ],
    'imports' => [
        '@typo3/hub/' => 'EXT:hub/Resources/Public/JavaScript/',
        '@typo3/core/action/request.js' => 'EXT:hub/Resources/Public/JavaScript/action/request.js',
        '@typo3/backend/element/swagger-element.js' => 'EXT:hub/Resources/Public/JavaScript/element/swagger-element.js',
        'swagger-ui-dist' => 'EXT:hub/Resources/Public/JavaScript/Contrib/swagger-ui-dist.js'
    ],
];
