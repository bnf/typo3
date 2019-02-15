<?php
declare(strict_types = 1);
namespace TYPO3\CMS\Info;

use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;

return function (ContainerConfigurator $configurator) {
    $configurator = $configurator->services()->defaults()
        ->private()
        ->autoconfigure()
        ->autowire();

    $configurator
        ->load(__NAMESPACE__ . '\\', '../Classes/*');

    $configurator->set(Controller\InfoModuleController::class)
        ->tag('backend.module_controller');
};
