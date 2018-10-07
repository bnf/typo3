<?php
declare(strict_types = 1);
namespace TYPO3\CMS\Frontend;

use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;

return function (ContainerConfigurator $configurator) {
    $configurator = $configurator->services()->defaults()
        ->private()
        ->autoconfigure()
        ->autowire();

    $configurator
        ->load(__NAMESPACE__ . '\\', '../Classes/*');

    $configurator->set(Controller\TypoScriptFrontendController::class)
        ->factory([Controller\TypoScriptFrontendController::class, 'getGlobalInstance'])
        ->share(false)
        ->autoconfigure(false)
        ->autowire(false);

    $configurator->set(ContentObject\ContentObjectRenderer::class)
        ->share(false)
        ->public();

    $configurator->set(Aspect\FileMetadataOverlayAspect::class)
        ->tag('signal.slot', [
            'method' => 'languageAndWorkspaceOverlay',
            'signalClass' => \TYPO3\CMS\Core\Resource\Index\MetaDataRepository::class,
            'signalName' => 'recordPostRetrieval',
        ]);
};
