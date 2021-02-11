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

use Psr\Http\Message\ServerRequestInterface;
use TYPO3\CMS\Core\Authentication\Mfa\MfaProviderPropertyManager;
use TYPO3\CMS\Core\Context\Context;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Extbase\Mvc\View\ViewInterface;

/**
 * MFA provider for time-based one-time password authentication
 *
 * @internal should only be used by the TYPO3 Core
 */
class TotpProvider extends AbstractOtpProvider
{
    /**
     * Verify the given OTP and update the provider properties
     * in case the OTP is valid.
     *
     * @param ServerRequestInterface $request
     * @param MfaProviderPropertyManager $propertyManager
     * @return bool
     */
    public function verify(ServerRequestInterface $request, MfaProviderPropertyManager $propertyManager): bool
    {
        $otp = $this->getOtp($request);
        $secret = $propertyManager->getProperty('secret', '');
        $verified = GeneralUtility::makeInstance(Totp::class, $secret)->verifyOtp($otp, 2);
        if (!$verified) {
            $attempts = $propertyManager->getProperty('attempts', 0);
            $propertyManager->updateProperties(['attempts' => ++$attempts]);
            return false;
        }
        $propertyManager->updateProperties([
            'lastUsed' => GeneralUtility::makeInstance(Context::class)->getPropertyFromAspect('date', 'timestamp')
        ]);
        return true;
    }

    /**
     * Activate the provider by checking the necessary parameters,
     * verifying the OTP and storing the provider properties.
     *
     * @param ServerRequestInterface $request
     * @param MfaProviderPropertyManager $propertyManager
     * @return bool
     */
    public function activate(ServerRequestInterface $request, MfaProviderPropertyManager $propertyManager): bool
    {
        if ($this->isActive($propertyManager)) {
            // Return since the user already activated this provider
            return true;
        }

        if (!$this->canProcess($request)) {
            // Return since the request can not be processed by this provider
            return false;
        }

        $secret = (string)($request->getParsedBody()['secret'] ?? '');
        if ($secret === '') {
            // Return since no secret to activate is given
            return false;
        }

        $totp = GeneralUtility::makeInstance(Totp::class, $secret);
        if (!$totp->verifyOtp($this->getOtp($request), 2)) {
            // Return since the given OTP could not be verified
            return false;
        }

        // If valid, prepare the provider properties to be stored
        $properties = ['secret' => $secret, 'active' => true];
        if (($name = (string)($request->getParsedBody()['name'] ?? '')) !== '') {
            $properties['name'] = $name;
        }

        // Usually there should be no entry if the provider is not activated, but to prevent the
        // provider from being unable to activate again, we update the existing entry in such case.
        return $propertyManager->hasProviderEntry()
            ? $propertyManager->updateProperties($properties)
            : $propertyManager->createProviderEntry($properties);
    }

    /**
     * Generate a new shared secret, generate the otpauth URL and create a qr-code
     * for improved usability. Set template and assign necessary variables for the
     * setup view.
     *
     * @param ViewInterface $view
     * @param MfaProviderPropertyManager $propertyManager
     */
    protected function prepareSetupView(ViewInterface $view, MfaProviderPropertyManager $propertyManager): void
    {
        $userData = $propertyManager->getUser()->user ?? [];
        $secret = Totp::generateEncodedSecret([(string)($userData['uid'] ?? ''), (string)($userData['username'] ?? '')]);
        $totp = GeneralUtility::makeInstance(Totp::class, $secret);
        $view->setTemplate('Setup');
        $view->assignMultiple([
            'secret' => $secret,
            'qrCode' => $this->getSvgQrCode($totp, $userData)
        ]);
    }

    /**
     * Set the template and assign necessary variables for the edit view
     *
     * @param ViewInterface $view
     * @param MfaProviderPropertyManager $propertyManager
     */
    protected function prepareEditView(ViewInterface $view, MfaProviderPropertyManager $propertyManager): void
    {
        $view->setTemplate('Edit');
        $view->assignMultiple([
            'name' => $propertyManager->getProperty('name'),
            'lastUsed' => $propertyManager->getProperty('lastUsed'),
            'updated' => $propertyManager->getProperty('updated')
        ]);
    }

    /**
     * Set the template for the auth view where the user has to provide the OTP
     *
     * @param ViewInterface $view
     * @param MfaProviderPropertyManager $propertyManager
     */
    protected function prepareAuthView(ViewInterface $view, MfaProviderPropertyManager $propertyManager): void
    {
        $view->setTemplate('Auth');
        $view->assign('isLocked', $this->isLocked($propertyManager));
    }
}
