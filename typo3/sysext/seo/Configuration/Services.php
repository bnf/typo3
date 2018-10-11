<?php
declare(strict_types = 1);
namespace TYPO3\CMS\Seo;

use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;

return function (ContainerConfigurator $configurator) {
    $configurator = $configurator->services()->defaults()
        ->private()
        ->autoconfigure()
        ->autowire();

    $configurator
        ->load(__NAMESPACE__ . '\\', '../Classes/*');

    $configurator->set(MetaTag\OpenGraphMetaTagManager::class)
        ->tag('metatag.manager', ['identifier' => 'opengraph']);

    $configurator->set(MetaTag\TwitterCardMetaTagManager::class)
        ->tag('metatag.manager', ['identifier' => 'twitter']);
};
