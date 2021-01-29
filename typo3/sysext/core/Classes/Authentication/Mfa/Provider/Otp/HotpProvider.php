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
use TYPO3\CMS\Core\Authentication\AbstractUserAuthentication;
use TYPO3\CMS\Core\Authentication\Mfa\MfaProviderManifestInterface;
use TYPO3\CMS\Core\Context\Context;
use TYPO3\CMS\Core\Context\Exception\AspectNotFoundException;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Extbase\Mvc\View\ViewInterface;

/**
 * MFA provider for counter-based one-time password authentication
 *
 * @internal should only be used by the TYPO3 Core
 */
class HotpProvider extends AbstractOtpProvider
{
    /**
     * Verify the given OTP and update the provider properties
     * in case the OTP is valid.
     *
     * @param ServerRequestInterface $request
     * @param AbstractUserAuthentication $user
     * @return bool
     */
    public function verify(ServerRequestInterface $request, AbstractUserAuthentication $user): bool
    {
        $otp = $this->getOtp($request);
        $propertyManager = $user->getMfaProviderPropertyManager($this->getIdentifier());
        $secret = $propertyManager->getProperty('secret', '');
        $counter = $propertyManager->getProperty('counter');
        $hotp = GeneralUtility::makeInstance(Hotp::class, $secret, $counter);
        if (!$hotp->verifyOtp($otp)) {
            // Allow resynchronization, since if this is the only provider and the counter
            // is out of sync, there would be no possibility to access the account again.
            // window=2 means, one upcoming counter will also be accepted.
            $newCounter = $hotp->resyncCounter($otp, 2);
            if ($newCounter === null) {
                $attempts = $propertyManager->getProperty('attempts', 0);
                $propertyManager->updateProperties(['attempts' => ++$attempts]);
                return false;
            }
            $counter = $newCounter;
        }
        // If the update fails, we must return FALSE even if OTP authentication was successful
        // since the next attempt would then fail because the counter would be out of sync.
        return $propertyManager->updateProperties([
            'counter' => ++$counter,
            'lastUsed' => GeneralUtility::makeInstance(Context::class)->getPropertyFromAspect('date', 'timestamp')
        ]);
    }

    /**
     * Activate the provider by checking the necessary parameters,
     * verifying the OTP and storing the provider properties.
     *
     * @param ServerRequestInterface $request
     * @param AbstractUserAuthentication $user
     * @return bool
     */
    public function activate(ServerRequestInterface $request, AbstractUserAuthentication $user): bool
    {
        if ($this->isActive($user)) {
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

        $counter = 0;
        $hotp = GeneralUtility::makeInstance(Hotp::class, $secret, $counter);
        // No window here since the counters should be in sync on activation
        if (!$hotp->verifyOtp($this->getOtp($request))) {
            // Return since the given OTP could not be verified
            return false;
        }

        // If valid, prepare the provider properties to be stored
        $properties = ['secret' => $secret, 'counter' => ++$counter, 'active' => true];
        if (($name = (string)($request->getParsedBody()['name'] ?? '')) !== '') {
            $properties['name'] = $name;
        }

        $propertyManager = $user->getMfaProviderPropertyManager($this->getIdentifier());

        // Usually there should be no entry if the provider is not activated, but to prevent the
        // provider from being unable to activate again, we update the existing entry in such case.
        return $propertyManager->hasProviderEntry()
            ? $propertyManager->updateProperties($properties)
            : $propertyManager->createProviderEntry($properties);
    }

    /**
     * Update the provider data and also perform a resync if requested
     *
     * @param ServerRequestInterface $request
     * @param AbstractUserAuthentication $user
     * @return bool
     * @throws AspectNotFoundException
     */
    public function update(ServerRequestInterface $request, AbstractUserAuthentication $user): bool
    {
        $propertyManager = $user->getMfaProviderPropertyManager($this->getIdentifier());

        // Update the user sepcified name for this provider
        $name = (string)($request->getParsedBody()['name'] ?? '');
        if ($name !== '') {
            $updated = $propertyManager->updateProperties(['name' => $name]);
            if (!$updated) {
                return false;
            }
        }

        // Resync the counter if requested
        $otp = $this->getOtp($request);
        $secret = $propertyManager->getProperty('secret', '');
        $currentCounter = $propertyManager->getProperty('counter');
        if ($otp !== '' && $secret !== '' && $currentCounter !== null) {
            $hotp = GeneralUtility::makeInstance(Hotp::class, $secret, $currentCounter);
            $newCounter = $hotp->resyncCounter($otp);
            if ($newCounter === null) {
                // Return since the resync was not successful - maybe the client differs to much
                return false;
            }
            // If resync was successful save the new counter (increased by one for the next verification)
            $updated = $propertyManager->updateProperties(['counter' => ++$newCounter]);
            if (!$updated) {
                // Return since the properties could not be stored
                return false;
            }
        }

        // Provider successfully updated
        return true;
    }

    /**
     * Return the identifier for this provider
     *
     * @return string
     */
    public function getIdentifier(): string
    {
        return 'hotp';
    }

    /**
     * Reveal provider information, used in views
     *
     * @return MfaProviderManifestInterface
     */
    public function getManifest(): MfaProviderManifestInterface
    {
        return GeneralUtility::makeInstance(HotpProviderManifest::class);
    }

    /**
     * Generate a new shared secret and create a qr-code for improved usability.
     * Set template and assign necessary variables for the setup view.
     *
     * @param ViewInterface $view
     * @param AbstractUserAuthentication $user
     */
    protected function prepareSetupView(ViewInterface $view, AbstractUserAuthentication $user): void
    {
        $userData = $user->user ?? [];
        $secret = Hotp::generateEncodedSecret([(string)($userData['uid'] ?? ''), (string)($userData['username'] ?? '')]);
        $hotp = GeneralUtility::makeInstance(Hotp::class, $secret, 0);
        $view->setTemplate('Setup');
        $view->assignMultiple([
            'secret' => $secret,
            'qrCode' => $this->getSvgQrCode($hotp, $userData)
        ]);
    }

    /**
     * Set the template and assign necessary variables for the edit view
     *
     * @param ViewInterface $view
     * @param AbstractUserAuthentication $user
     */
    protected function prepareEditView(ViewInterface $view, AbstractUserAuthentication $user): void
    {
        $propertyManager = $user->getMfaProviderPropertyManager($this->getIdentifier());
        $view->setTemplate('Edit');
        $view->assignMultiple([
            'name' => $propertyManager->getProperty('name'),
            'lastUsed' => $propertyManager->getProperty('lastUsed'),
            'updated' => $propertyManager->getProperty('updated'),
            'resyncEnabled' => true
        ]);
    }

    /**
     * Set the template for the auth view where the user has to provide the OTP
     *
     * @param ViewInterface $view
     * @param AbstractUserAuthentication $user
     */
    protected function prepareAuthView(ViewInterface $view, AbstractUserAuthentication $user): void
    {
        $view->setTemplate('Auth');
        $view->assign('isLocked', $this->isLocked($user));
    }
}
