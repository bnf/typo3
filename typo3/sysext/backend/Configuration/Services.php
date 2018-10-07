<?php
declare(strict_types = 1);
namespace TYPO3\CMS\Backend;

use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;
use TYPO3\CMS\Core\DependencyInjection\PublicServicePass;

return function (ContainerConfigurator $configurator, ContainerBuilder $containerBuilder) {
    $containerBuilder->addCompilerPass(new PublicServicePass('backend.controller'));

    /* ContainerConfigurator based configuration */
    $configurator = $configurator->services()->defaults()
        ->private()
        ->autoconfigure()
        ->autowire();

    $configurator
        ->load(__NAMESPACE__ . '\\', '../Classes/*');

    $configurator->set(Template\ModuleTemplate::class)
        ->share(false)
        ->public();

    $configurator->set(Controller\PageLayoutController::class)
        ->tag('backend.module_controller');

    $configurator->set(Controller\SiteConfigurationController::class)
        ->tag('backend.module_controller');

    $configurator->set(Controller\HelpController::class)
        ->tag('backend.module_controller');

    $configurator->set(Security\CategoryPermissionsAspect::class)
        ->tag('signal.slot', [
            'method' => 'addUserPermissionsToCategoryTreeData',
            'signalClass' => \TYPO3\CMS\Core\Tree\TableConfiguration\DatabaseTreeDataProvider::class,
            'signalName' => \TYPO3\CMS\Core\Tree\TableConfiguration\DatabaseTreeDataProvider::SIGNAL_PostProcessTreeData,
        ]);

    // Temporary workaround until testing framework loads EXT:fluid in functional test
    // @todo: Fix typo3/testing-framework and remove this
    $configurator->set(View\BackendTemplateView::class)
        ->autoconfigure(false);
};
