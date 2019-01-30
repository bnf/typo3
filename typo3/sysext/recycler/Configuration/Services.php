<?php
declare(strict_types = 1);
namespace TYPO3\CMS\Recycler;

use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;

return function (ContainerConfigurator $configurator) {
    $configurator = $configurator->services()->defaults()
        ->private()
        ->autoconfigure()
        ->autowire();

    $configurator
        ->load(__NAMESPACE__ . '\\', '../Classes/*');

    $configurator->set(Task\CleanerTask::class)
        ->tag('scheduler.task', [
            'extension' => 'recycler',
            'title' => 'LLL:EXT:recycler/Resources/Private/Language/locallang_tasks.xlf:cleanerTaskTitle',
            'description' => 'LLL:EXT:recycler/Resources/Private/Language/locallang_tasks.xlf:cleanerTaskDescription',
            'additionalFields' => \TYPO3\CMS\Recycler\Task\CleanerFieldProvider::class
        ]);
};
