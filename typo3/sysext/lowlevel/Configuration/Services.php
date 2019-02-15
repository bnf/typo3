<?php
declare(strict_types = 1);
namespace TYPO3\CMS\Lowlevel;

use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;

return function (ContainerConfigurator $configurator) {
    $configurator = $configurator->services()->defaults()
        ->private()
        ->autoconfigure()
        ->autowire();

    $configurator
        ->load(__NAMESPACE__ . '\\', '../Classes/*');

    $configurator->set(Controller\DatabaseIntegrityController::class)
        ->tag('backend.module_controller');

    $configurator->set(Controller\ConfigurationController::class)
        ->tag('backend.module_controller');
};
