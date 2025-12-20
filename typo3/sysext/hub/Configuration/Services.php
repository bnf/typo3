<?php

declare(strict_types=1);

namespace TYPO3\CMS\Backend;

use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;
use TYPO3\CMS\Lowlevel\ConfigurationModuleProvider\ProviderRegistry;
use TYPO3\CMS\Hub\ConfigurationModuleProvider\HubProvider;
use TYPO3\CMS\Hub\App\AppInterface;

return static function (ContainerConfigurator $container, ContainerBuilder $containerBuilder) {
    $containerBuilder
        ->registerForAutoconfiguration(AppInterface::class)
        ->setPublic(true)
        ->setLazy(true)
        ->addTag('hub.app');

    if ($containerBuilder->hasDefinition(ProviderRegistry::class)) {
        $container->services()->defaults()->autowire()->autoconfigure()->public()
            ->set('lowlevel.configuration.module.provider.hub')
            ->class(HubProvider::class)
            ->tag(
                'lowlevel.configuration.module.provider',
                [
                    'identifier' => 'hub',
                    'label' => 'LLL:EXT:hub/Resources/Private/Language/locallang_db.xlf:hub',
                    'after' => 'mfaproviders',
                ]
            );
    }
};
