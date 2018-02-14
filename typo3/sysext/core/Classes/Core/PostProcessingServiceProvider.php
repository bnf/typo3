<?php
declare(strict_types = 1);
namespace TYPO3\CMS\Core\Core;

/*
 * This file is part of the TYPO3 CMS project.
 *
 * It is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License, either version 2
 * of the License, or any later version.
 *
 * For the full copyright and license information, please read the
 * LICENSE.txt file that was distributed with this source code.
 *
 * The TYPO3 project - inspiring people to share!
 */

use Interop\Container\ServiceProviderInterface;
use Psr\Container\ContainerInterface;
use TYPO3\CMS\Core\Category\CategoryRegistry;
use TYPO3\CMS\Core\Migrations\TcaMigration;
use TYPO3\CMS\Core\Preparations\TcaPreparation;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Extbase\SignalSlot\Dispatcher as SignalSlotDispatcher;

class PostProcessingServiceProvider implements ServiceProviderInterface
{
    public function getFactories(): array
    {
        return [];
    }

    public function getExtensions(): array
    {
        return [
            'TCAConfiguration' => [ static::class, 'postProcessTcaConfiguration' ],
            'TCAOverrides' => [ static::class, 'postProcessTcaOverrides' ],
        ];
    }

    public static function postProcessTcaConfiguration(ContainerInterface $container, array $TCA): array
    {
        // Apply category stuff
        // @todo: CategoryRepository should take $TCA as argument
        $GLOBALS['TCA'] = $TCA;
        CategoryRegistry::getInstance()->applyTcaForPreRegisteredTables();
        $TCA = $GLOBALS['TCA'];
        // @todo: unset $GLOBALS['TCA'] at this point?

        return $TCA;
    }

    public static function postProcessTcaOverrides(ContainerInterface $container, array $TCA): array
    {
        // TCA migration
        // @deprecated since TYPO3 CMS 7. Not removed in TYPO3 CMS 8 though. This call will stay for now to allow further TCA migrations in 8.
        $tcaMigration = GeneralUtility::makeInstance(TcaMigration::class);
        $TCA = $tcaMigration->migrate($TCA);
        $messages = $tcaMigration->getMessages();
        if (!empty($messages)) {
            $context = 'Automatic TCA migration done during bootstrap. Please adapt TCA accordingly, these migrations'
                . ' will be removed. The backend module "Configuration -> TCA" shows the modified values.'
                . ' Please adapt these areas:';
            array_unshift($messages, $context);
            trigger_error(implode(LF, $messages), E_USER_DEPRECATED);
        }

        // TCA preparation
        $tcaPreparation = GeneralUtility::makeInstance(TcaPreparation::class);
        $TCA = $tcaPreparation->prepare($TCA);

        // todo @deprecated, signal is not required. extensions may use
        // the service provider to get notified.
        list($TCA) =  GeneralUtility::makeInstance(SignalSlotDispatcher::class)->dispatch(
            \TYPO3\CMS\Core\Utility\ExtensionManagementUtility::class,
            'tcaIsBeingBuilt',
            [$TCA]
        );

        return $TCA;
    }
}
