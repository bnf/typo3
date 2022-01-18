<?php

return [
    'dependencies' => [
        'backend',
    ],
    'imports' => [
        'TYPO3/CMS/T3editor/' => [
            'path' => 'EXT:t3editor/Resources/Public/JavaScript/',
            'exclude' => [
                'EXT:t3editor/Resources/Public/JavaScript/Addon/',
                'EXT:t3editor/Resources/Public/JavaScript/Contrib/',
                'EXT:t3editor/Resources/Public/JavaScript/Mode/',
            ],
        ],
        'crelt' => 'EXT:t3editor/Resources/Public/JavaScript/Contrib/crelt.js',
        'style-mod' => 'EXT:t3editor/Resources/Public/JavaScript/Contrib/style-mod.js',
        'w3c-keyname' => 'EXT:t3editor/Resources/Public/JavaScript/Contrib/w3c-keyname.js',
        '@lezer/common' => 'EXT:t3editor/Resources/Public/JavaScript/Contrib/@lezer/common.js',
        '@lezer/javascript' => 'EXT:t3editor/Resources/Public/JavaScript/Contrib/@lezer/javascript.js',
        '@lezer/lr' => 'EXT:t3editor/Resources/Public/JavaScript/Contrib/@lezer/lr.js',
        '@codemirror/autocomplete' => 'EXT:t3editor/Resources/Public/JavaScript/Contrib/@codemirror/autocomplete.js',
        '@codemirror/basic-setup' => 'EXT:t3editor/Resources/Public/JavaScript/Contrib/@codemirror/basic-setup.js',
        '@codemirror/closebrackets' => 'EXT:t3editor/Resources/Public/JavaScript/Contrib/@codemirror/closebrackets.js',
        '@codemirror/commands' => 'EXT:t3editor/Resources/Public/JavaScript/Contrib/@codemirror/commands.js',
        '@codemirror/comment' => 'EXT:t3editor/Resources/Public/JavaScript/Contrib/@codemirror/comment.js',
        '@codemirror/fold' => 'EXT:t3editor/Resources/Public/JavaScript/Contrib/@codemirror/fold.js',
        '@codemirror/gutter' => 'EXT:t3editor/Resources/Public/JavaScript/Contrib/@codemirror/gutter.js',
        '@codemirror/highlight' => 'EXT:t3editor/Resources/Public/JavaScript/Contrib/@codemirror/highlight.js',
        '@codemirror/history' => 'EXT:t3editor/Resources/Public/JavaScript/Contrib/@codemirror/history.js',
        '@codemirror/language' => 'EXT:t3editor/Resources/Public/JavaScript/Contrib/@codemirror/language.js',
        '@codemirror/lang-javascript' => 'EXT:t3editor/Resources/Public/JavaScript/Contrib/@codemirror/lang-javascript.js',
        '@codemirror/lint' => 'EXT:t3editor/Resources/Public/JavaScript/Contrib/@codemirror/lint.js',
        '@codemirror/matchbrackets' => 'EXT:t3editor/Resources/Public/JavaScript/Contrib/@codemirror/matchbrackets.js',
        '@codemirror/panel' => 'EXT:t3editor/Resources/Public/JavaScript/Contrib/@codemirror/panel.js',
        '@codemirror/rangeset' => 'EXT:t3editor/Resources/Public/JavaScript/Contrib/@codemirror/rangeset.js',
        '@codemirror/rectangular-selection' => 'EXT:t3editor/Resources/Public/JavaScript/Contrib/@codemirror/rectangular-selection.js',
        '@codemirror/search' => 'EXT:t3editor/Resources/Public/JavaScript/Contrib/@codemirror/search.js',
        '@codemirror/state' => 'EXT:t3editor/Resources/Public/JavaScript/Contrib/@codemirror/state.js',
        '@codemirror/text' => 'EXT:t3editor/Resources/Public/JavaScript/Contrib/@codemirror/text.js',
        '@codemirror/tooltip' => 'EXT:t3editor/Resources/Public/JavaScript/Contrib/@codemirror/tooltip.js',
        '@codemirror/view' => 'EXT:t3editor/Resources/Public/JavaScript/Contrib/@codemirror/view.js',
    ],
];
