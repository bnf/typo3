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
        '@typo3/form/backend/' => 'EXT:form/Resources/Public/JavaScript/backend/',
    ],
];
