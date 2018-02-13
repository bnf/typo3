<?php
declare(strict_types = 1);
namespace TYPO3\CMS\Rsaauth;

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

use Psr\Container\ContainerInterface;
use TYPO3\CMS\Core\Core\AbstractServiceProvider;
use TYPO3\CMS\Core\Utility\GeneralUtility;

class ServiceProvider extends AbstractServiceProvider
{
    const PATH = __DIR__ . '/../';

    public function getFactories(): array
    {
        return [
            Keypair::class => [ static::class, 'getKeypair' ],
            RsaEncryptionDecoder::class => [ static::class, 'getRsaEncryptionDecoder' ],
            RsaEncryptionEncoder::class => [ static::class, 'getRsaEncryptionEncoder' ],
        ];
    }

    public static function getKeypair(ContainerInterface $container): Keypair
    {
        return GeneralUtility::makeInstance(Keypair::class);
    }

    public static function getRsaEncryptionDecoder(ContainerInterface $container): RsaEncryptionDecoder
    {
        return GeneralUtility::makeInstance(RsaEncryptionDecoder::class);
    }

    public static function getRsaEncryptionEncoder(ContainerInterface $container): RsaEncryptionEncoder
    {
        return GeneralUtility::makeInstance(RsaEncryptionEncoder::class);
    }
}
