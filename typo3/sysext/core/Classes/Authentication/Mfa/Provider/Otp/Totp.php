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

use TYPO3\CMS\Core\Context\Context;
use TYPO3\CMS\Core\Context\Exception\AspectNotFoundException;
use TYPO3\CMS\Core\Utility\GeneralUtility;

/**
 * Time-based one-time password (TOTP) implementation according to rfc6238
 *
 * @internal should only be used by the TYPO3 Core
 */
class Totp extends AbstractOtp
{
    protected int $step;
    protected int $epoch;

    public function __construct(
        string $secret,
        string $algo = 'sha1',
        int $length = 6,
        int $step = 30,
        int $epoch = 0
    ) {
        parent::__construct($secret, $algo, $length);
        $this->step = $step;
        $this->epoch = $epoch;
    }

    /**
     * Verify the given time-based one-time password
     *
     * @param string $otp The time-based one-time password to be verified
     * @param int|null $gracePeriod The grace period for the TOTP +- (mainly to circumvent transmission delays)
     * @return bool
     * @throws AspectNotFoundException
     */
    public function verifyOtp(string $otp, int $gracePeriod = null): bool
    {
        $counter = $this->handleEmptyCounter();

        // If no grace period is given, only check once
        if ($gracePeriod === null) {
            return $this->compare($otp, $this->getTimeCounter($counter));
        }

        // Check the token within the given grace period till it can be verified or the grace period is exhausted
        for ($i = 0; $i < $gracePeriod; ++$i) {
            $next = $i * $this->step + $counter;
            $prev = -$i * $this->step + $counter;
            if ($this->compare($otp, $this->getTimeCounter($next))
                || $this->compare($otp, $this->getTimeCounter($prev))
            ) {
                return true;
            }
        }

        return false;
    }

    /**
     * Generate and return the otpauth URL for TOTP
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
            'issuer' => $issuer
        ];

        // Common TOTP applications expect the following parameters:
        // - algo: sha1
        // - period: 30 (in seconds)
        // - digits 6
        // - epoch: 0
        // Only if we differ from these assumption, the exact values must be provided.
        if ($this->algo !== 'sha1') {
            $parameters['algorithm'] = $this->algo;
        }
        if ($this->step !== 30) {
            $parameters['period'] = $this->step;
        }
        if ($this->length !== 6) {
            $parameters['digits'] = $this->length;
        }
        if ($this->epoch !== 0) {
            $parameters['epoch'] = $this->epoch;
        }

        // Generate the otpauth URL by providing information like issuer and account
        return sprintf(
            'otpauth://totp/%s?%s',
            rawurlencode($issuer . ($account !== '' ? ':' . $account : '')),
            http_build_query(array_merge($parameters, $additionalParameters), '', '&', PHP_QUERY_RFC3986)
        );
    }

    /**
     * Generate the counter value (moving factor) from the given timestamp
     *
     * @param int $timestamp
     * @return int
     */
    protected function getTimeCounter(int $timestamp): int
    {
        return (int)floor(($timestamp - $this->epoch) / $this->step);
    }

    protected function handleEmptyCounter(): int
    {
        return GeneralUtility::makeInstance(Context::class)->getPropertyFromAspect('date', 'timestamp');
    }
}
