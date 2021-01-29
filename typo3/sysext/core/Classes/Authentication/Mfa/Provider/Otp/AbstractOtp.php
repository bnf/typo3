<?php

declare(strict_types=1);

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

namespace TYPO3\CMS\Core\Authentication\Mfa\Provider\Otp;

use Base32\Base32;
use TYPO3\CMS\Core\Context\Exception\AspectNotFoundException;
use TYPO3\CMS\Core\Crypto\Random;
use TYPO3\CMS\Core\Utility\GeneralUtility;

/**
 * To be used by OTP implementations
 *
 * @internal should only be used by the TYPO3 Core
 */
abstract class AbstractOtp
{
    private const ALLOWED_ALGOS = ['sha1', 'sha256', 'sha512'];
    private const MIN_LENGTH = 6;
    private const MAX_LENGTH = 8;

    protected string $secret;
    protected string $algo;
    protected int $length;

    public function __construct(string $secret, string $algo = 'sha1', int $length = 6)
    {
        $this->secret = $secret;

        if (!in_array($algo, self::ALLOWED_ALGOS, true)) {
            throw new \InvalidArgumentException(
                $algo . ' is not allowed. Allowed algos are: ' . implode(',', self::ALLOWED_ALGOS),
                1611748791
            );
        }
        $this->algo = $algo;

        if ($length < self::MIN_LENGTH || $length > self::MAX_LENGTH) {
            throw new \InvalidArgumentException(
                $length . ' is not allowed as OTP length. Must be between ' . self::MIN_LENGTH . ' and ' . self::MAX_LENGTH,
                1611748792
            );
        }
        $this->length = $length;
    }

    /**
     * Is called in case no counter is given
     *
     * @return int
     */
    abstract protected function handleEmptyCounter(): int;

    /**
     * Verify a given OTP
     *
     * @param string $otp
     * @return bool
     */
    abstract public function verifyOtp(string $otp): bool;

    /**
     * Return the otpauth:// url to be useed directly in
     * OTP applications or for generating qr codes.
     *
     * @param string $issuer
     * @param string $account
     * @param array  $additionalParameters
     *
     * @return string
     */
    abstract public function getOtpAuthUrl(string $issuer, string $account = '', array $additionalParameters = []): string;

    /**
     * Generate a one-time password for the given counter according to rfc4226
     *
     * @param int|null $counter Can be a counter according to rfc4226 or a timestamp according to rfc6238
     * @return string The generated OTP
     * @throws AspectNotFoundException
     */
    public function generateOtp(int $counter = null): string
    {
        // If no counter is given, let the implementation decide. E.g. TOTP should return the current timestamp.
        $counter ??= $this->handleEmptyCounter();
        // Generate a 8-byte counter value (C) from the given counter input
        $binary = [];
        while ($counter !== 0) {
            $binary[] = pack('C*', $counter);
            $counter >>= 8;
        }
        // Implode and fill with NULL values
        $binary = str_pad(implode(array_reverse($binary)), 8, "\000", STR_PAD_LEFT);
        // Create a 20-byte hash string (HS) with given algo and decoded shared secret (K)
        $hash = hash_hmac($this->algo, $binary, $this->getDecodedSecret());
        // Convert hash into hex and generate an array with the decimal values of the hash
        $hmac = [];
        foreach (str_split($hash, 2) as $hex) {
            $hmac[] = hexdec($hex);
        }
        // Generate a 4-byte string with dynamic truncation (DT)
        $offset = $hmac[\count($hmac) - 1] & 0xf;
        $bits = ((($hmac[$offset + 0] & 0x7f) << 24) | (($hmac[$offset + 1] & 0xff) << 16) | (($hmac[$offset + 2] & 0xff) << 8) | ($hmac[$offset + 3] & 0xff));
        // Compute the HOTP value by reducing the bits modulo 10^Digits and filling it with zeros '0'
        return str_pad((string)($bits % (10 ** $this->length)), $this->length, '0', STR_PAD_LEFT);
    }

    /**
     * Compare given one-time password with a one-time password
     * generated from the known $counter (the moving factor).
     *
     * @param string $otp The one-time password to verify
     * @param int $counter The counter value, the moving factor
     * @return bool
     * @throws AspectNotFoundException
     */
    protected function compare(string $otp, int $counter): bool
    {
        return hash_equals($this->generateOtp($counter), $otp);
    }

    /**
     * Generate the shared secret (K) by using a random and applying
     * additional authentication factors like username or email address.
     *
     * @param array $additionalAuthFactors
     * @return string
     */
    public static function generateEncodedSecret(array $additionalAuthFactors = []): string
    {
        $secret = implode($additionalAuthFactors) . GeneralUtility::makeInstance(Random::class)->generateRandomHexString(32);
        // @todo This substr was done since GoogleAuthenticator complained about longer keys.
        // @todo This must be investigated further, because this is not an appropriate length.
        return Base32::encode(substr(GeneralUtility::hmac($secret), 0, 10));
    }

    protected function getDecodedSecret(): string
    {
        return Base32::decode($this->secret);
    }
}
