<?php

declare(strict_types=1);

$EM_CONF[$_EXTKEY] = [
    'title' => 'This extension contains profile fixtures.',
    'description' => 'This extension contains profile fixture.',
    'category' => 'example',
    'version' => '13.1.0',
    'state' => 'beta',
    'author' => 'Benjamin Franzke',
    'author_email' => 'ben@bnf.dev',
    'author_company' => '',
    'constraints' => [
        'depends' => [
            'typo3' => '13.1.0',
        ],
        'conflicts' => [],
        'suggests' => [],
    ],
];
