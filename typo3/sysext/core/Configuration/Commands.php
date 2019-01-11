<?php

return [
    'dumpautoload' => [
        'class' => \TYPO3\CMS\Core\Command\DumpAutoloadCommand::class,
        'schedulable' => false,
    ],
    'cache:warmup' => [
        'class' => \TYPO3\CMS\Core\Command\CacheWarmupCommand::class,
        'schedulable' => false,
    ],
    'services:plot' => [
        'class' => \TYPO3\CMS\Core\Command\ServicesPlotCommand::class,
        'schedulable' => false,
    ],
    'swiftmailer:spool:send' => [
        'class' => \TYPO3\CMS\Core\Command\SendEmailCommand::class,
    ],
    'extension:list' => [
        'class' => \TYPO3\CMS\Core\Command\ExtensionListCommand::class,
        'schedulable' => false
    ],
    'site:list' => [
        'class' => \TYPO3\CMS\Core\Command\SiteListCommand::class,
        'schedulable' => false
    ],
    'site:show' => [
        'class' => \TYPO3\CMS\Core\Command\SiteShowCommand::class,
        'schedulable' => false
    ]
];
