<?php

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

declare(strict_types=1);

namespace TYPO3\CMS\Core\Authentication\Mfa\Provider;

use TYPO3\CMS\Core\Crypto\PasswordHashing\PasswordHashFactory;
use TYPO3\CMS\Core\Crypto\PasswordHashing\PasswordHashInterface;
use TYPO3\CMS\Core\Crypto\Random;
use TYPO3\CMS\Core\Utility\GeneralUtility;

/**
 * Implementation for generation and validation of recovery codes
 *
 * @internal should only be used by the TYPO3 Core
 */
class RecoveryCodes
{
    protected PasswordHashInterface $hashInstance;

    public function __construct(string $mode)
    {
        $this->hashInstance = GeneralUtility::makeInstance(PasswordHashFactory::class)->getDefaultHashInstance($mode);
    }

    /**
     * Generate given amount of plain recovery codes with the given length
     *
     * @param int $length
     * @param int $quantity
     * @return string[]
     */
    public function generatePlainRecoveryCodes(int $length = 8, int $quantity = 8): array
    {
        $codes = [];
        $random = GeneralUtility::makeInstance(Random::class);

        while (count($codes) < $quantity) {
            $number = (int)hexdec($random->generateRandomHexString(16));
            // We only want to work with positive integers
            if ($number < 0) {
                continue;
            }
            // Create a $length long string from the random number
            $code = str_pad((string)($number % (10 ** $length)), $length, '0', STR_PAD_LEFT);
            // Prevent duplicate codes which is however very unlikely to happen
            if (!in_array($code, $codes, true)) {
                $codes[] = $code;
            }
        }

        return $codes;
    }

    /**
     * Hash the given plain recovery codes with the default hash instance and return them
     *
     * @param array $codes
     * @return array
     */
    public function generatedHashedRecoveryCodes(array $codes): array
    {
        foreach ($codes as &$code) {
            $code = $this->hashInstance->getHashedPassword($code);
        }
        unset($code);
        return $codes;
    }

    /**
     * Generate plain and hashed recovery codes and return them as key/value
     *
     * @return array
     */
    public function generateRecoveryCodes(): array
    {
        $plainCodes = $this->generatePlainRecoveryCodes();
        return array_combine($plainCodes, $this->generatedHashedRecoveryCodes($plainCodes));
    }

    /**
     * Compare given recovery code against all hashed codes and
     * unset the corresponding code on success.
     *
     * @param string $recoveryCode
     * @param array $codes
     * @return bool
     */
    public function verifyRecoveryCode(string $recoveryCode, array &$codes): bool
    {
        foreach ($codes as $key => $code) {
            // Compare hashed codes
            if ($this->hashInstance->checkPassword($recoveryCode, $code)) {
                // Unset the matching code
                unset($codes[$key]);
                return true;
            }
        }
        return false;
    }
}
