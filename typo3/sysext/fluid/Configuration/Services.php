<?php
declare(strict_types = 1);
namespace TYPO3\CMS\Fluid;

use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;
use TYPO3Fluid\Fluid\Core\ViewHelper\ViewHelperInterface;

return function (ContainerConfigurator $configurator, ContainerBuilder $containerBuilder) {
    $containerBuilder->registerForAutoconfiguration(ViewHelperInterface::class)->addTag('fluid.viewhelper');

    $containerBuilder->addCompilerPass(new class implements CompilerPassInterface {
        public function process(ContainerBuilder $container)
        {
            foreach ($container->findTaggedServiceIds('fluid.viewhelper') as $id => $tags) {
                $container->findDefinition($id)->setPublic(true)->setShared(false);
            }
        }
    });

    /* ContainerConfigurator based configuration */
    $configurator = $configurator->services()->defaults()
        ->private()
        ->autoconfigure()
        ->autowire();

    $configurator
        ->load(__NAMESPACE__ . '\\', '../Classes/*');

    // Templateview has $context = null, symfony auto-injects in that case,
    // extbase did not, force passing `null`
    $configurator->set(View\TemplateView::class)
        ->args(['$context' => null]);

    // Configuration for typo3fluid/fluid
    $configurator
        ->load('TYPO3Fluid\\Fluid\\', '%path.vendor%/typo3fluid/fluid/src/*');

    $configurator->set(\TYPO3Fluid\Fluid\View\TemplateView::class)
        ->args(['$context' => null]);
};
