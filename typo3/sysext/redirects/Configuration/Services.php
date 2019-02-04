<?php
declare(strict_types = 1);
namespace TYPO3\CMS\Redirects;

use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;

return function (ContainerConfigurator $configurator) {
    $configurator = $configurator->services()->defaults()
        ->private()
        ->autoconfigure()
        ->autowire();

    $configurator
        ->load(__NAMESPACE__ . '\\', '../Classes/*');

    $configurator->set(Controller\ManagementController::class)
        ->tag('backend.module_controller');

    $configurator->set(Service\RedirectService::class)
        ->args(['$typolinkBuilderConfiguration' => '%TYPO3_CONF_VARS.FE.typolinkBuilder%']);
};
