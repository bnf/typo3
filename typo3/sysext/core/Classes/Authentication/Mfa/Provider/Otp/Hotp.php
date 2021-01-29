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

namespace TYPO3\CMS\Core\Authentication\Mfa\Provider\Otp;

use TYPO3\CMS\Core\Context\Exception\AspectNotFoundException;

/**
 * Hmac-based one-time password (HOTP) implementation according to rfc4226
 *
 * @internal should only be used by the TYPO3 Core
 */
class Hotp extends AbstractOtp
{
    protected int $counter;

    public function __construct(string $secret, int $counter, string $algo = 'sha1', int $length = 6)
    {
        parent::__construct($secret, $algo, $length);
        $this->counter = $counter;
    }

    /**
     * Verify the given counter-based one-time password
     *
     * @param string $otp The counter-based one-time password to be verified
     * @param int|null $counter The counter value (moving factor) for the HOTP
     * @return bool
     * @throws AspectNotFoundException
     */
    public function verifyOtp(string $otp, int $counter = null): bool
    {
        $counter ??= $this->handleEmptyCounter();
        return $this->compare($otp, $counter);
    }

    /**
     * The drawback of HOTP in contrary to TOTP is that the counter can
     * become out of sync. Therefore, this method allows to resync the
     * counter based on the given window. This means, all OTPs in the
     * given window are accepted. If one is valid, this counter should
     * be stored in the database, to be back in sync.
     *
     * @param string $otp
     * @param int $window
     * @param int|null $counter
     * @return int|null
     * @throws \TYPO3\CMS\Core\Context\Exception\AspectNotFoundException
     */
    public function resyncCounter(string $otp, int $window = 3, int $counter = null): ?int
    {
        $counter ??= $this->handleEmptyCounter();

        for ($i = 0; $i < $window; ++$i) {
            $next = $counter + $i;
            if ($this->compare($otp, $next)) {
                return $next;
            }
        }

        // Counter could not be resynchronized
        return null;
    }

    /**
     * Generate and return the otpauth URL for HOTP
     *
     * @param string $issuer
     * @param string $account
     * @param array  $additionalParameters
     * @return string
     */
    public function getOtpAuthUrl(string $issuer, string $account = '', array $additionalParameters = []): string
    {
        $parameters = [
            'secret' => $this->secret,
            'issuer' => $issuer,
            // We include the current counter in the URL. Note: Not all OTP applications
            // evaluate this parameter, but just start with a counter value of "0".
            'counter' => $this->counter
        ];

        // Common HOTP applications expect the following parameters:
        // - algo: sha1
        // - digits 6
        // Only if we differ from these assumption, the exact values must be provided.
        if ($this->algo !== 'sha1') {
            $parameters['algorithm'] = $this->algo;
        }
        if ($this->length !== 6) {
            $parameters['digits'] = $this->length;
        }

        // Generate the otpauth URL by providing information like issuer and account
        return sprintf(
            'otpauth://hotp/%s?%s',
            rawurlencode($issuer . ($account !== '' ? ':' . $account : '')),
            http_build_query(array_merge($parameters, $additionalParameters), '', '&', PHP_QUERY_RFC3986)
        );
    }

    protected function handleEmptyCounter(): int
    {
        return $this->counter;
    }
}
