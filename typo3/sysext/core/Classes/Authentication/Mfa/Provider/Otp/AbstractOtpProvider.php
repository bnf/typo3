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

use Endroid\QrCode\QrCode;
use Psr\Http\Message\ServerRequestInterface;
use TYPO3\CMS\Core\Authentication\Mfa\MfaProviderPropertyManager;
use TYPO3\CMS\Core\Authentication\Mfa\MfaContentType;
use TYPO3\CMS\Core\Authentication\Mfa\MfaProviderInterface;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Extbase\Mvc\View\ViewInterface;
use TYPO3\CMS\Fluid\View\StandaloneView;

/**
 * To be used by OTP implementations
 *
 * @internal should only be used by the TYPO3 Core
 */
abstract class AbstractOtpProvider implements MfaProviderInterface
{
    private const MAX_ATTEMPTS = 3;

    /**
     * Check if a OTP is given in the current request
     *
     * @param ServerRequestInterface $request
     * @return bool
     */
    public function canProcess(ServerRequestInterface $request): bool
    {
        return $this->getOtp($request) !== '';
    }

    /**
     * Evaluate if the provider is activated by checking
     * the active state from the provider properties.
     *
     * @param MfaProviderPropertyManager $propertyManager
     * @return bool
     */
    public function isActive(MfaProviderPropertyManager $propertyManager): bool
    {
        return (bool)$propertyManager->getProperty('active');
    }

    /**
     * Evaluate if the provider is temporarily locked by checking
     * the current attempts state from the provider properties.
     *
     * @param MfaProviderPropertyManager $propertyManager
     * @return bool
     */
    public function isLocked(MfaProviderPropertyManager $propertyManager): bool
    {
        $attempts = (int)$propertyManager->getProperty('attempts', 0);

        // Assume the provider is locked in case the maximum attempts are exceeded.
        // A provider however can only be locked if set up - an entry exists in database.
        return $propertyManager->hasProviderEntry() && $attempts >= self::MAX_ATTEMPTS;
    }

    /**
     * Initialize view and forward to the appropriate implementation
     * based on the content type to be displayed.
     *
     * @param ServerRequestInterface $request
     * @param MfaProviderPropertyManager $propertyManager
     * @param string $type
     * @return string
     */
    public function renderContent(
        ServerRequestInterface $request,
        MfaProviderPropertyManager $propertyManager,
        string $type
    ): string {
        $view = GeneralUtility::makeInstance(StandaloneView::class);
        $view->setTemplateRootPaths(['EXT:core/Resources/Private/Templates/Authentication/MfaProvider/Otp']);
        switch ($type) {
            case MfaContentType::SETUP:
                $this->prepareSetupView($view, $propertyManager);
                break;
            case MfaContentType::EDIT:
                $this->prepareEditView($view, $propertyManager);
                break;
            case MfaContentType::AUTH:
                $this->prepareAuthView($view, $propertyManager);
                break;
        }
        return $view->assign('provider', $this)->render();
    }

    /**
     * Prepare the setup view where the user can activate the provider
     *
     * @param ViewInterface $view
     * @param MfaProviderPropertyManager $propertyManager
     */
    abstract protected function prepareSetupView(ViewInterface $view, MfaProviderPropertyManager $propertyManager): void;

    /**
     * Prepare the edit view where the user can change the settings of the provider
     *
     * @param ViewInterface $view
     * @param MfaProviderPropertyManager $propertyManager
     */
    abstract protected function prepareEditView(ViewInterface $view, MfaProviderPropertyManager $propertyManager): void;

    /**
     * Prepare the auth view where the user has to provide the OTP
     *
     * @param ViewInterface $view
     * @param MfaProviderPropertyManager $propertyManager
     */
    abstract protected function prepareAuthView(ViewInterface $view, MfaProviderPropertyManager $propertyManager): void;

    /**
     * Handle the unlock action by resetting the attempts provider property
     *
     * @param ServerRequestInterface $request
     * @param MfaProviderPropertyManager $propertyManager
     * @return bool
     */
    public function unlock(ServerRequestInterface $request, MfaProviderPropertyManager $propertyManager): bool
    {
        if (!$this->isLocked($user)) {
            // Return since this provider is not locked
            return false;
        }

        // Reset the attempts
        return $user->getMfaProviderPropertyManager($this->getIdentifier())->updateProperties(['attempts' => 0]);
    }

    /**
     * Handle the deactivate action. For security reasons, the provider entry
     * is completely deleted and setting up this provider again, will therefore
     * create a brand new entry.
     *
     * @param ServerRequestInterface $request
     * @param MfaProviderPropertyManager $propertyManager
     * @return bool
     */
    public function deactivate(ServerRequestInterface $request, MfaProviderPropertyManager $propertyManager): bool
    {
        if (!$this->isActive($propertyManager)) {
            // Return since this provider is not activated
            return false;
        }

        // @todo Should this also delete a possible recovery codes entry?

        // Delete the provider entry
        return $propertyManager->deleteProviderEntry();
    }

    /**
     * Handle the save action by updating the provider properties
     *
     * @param ServerRequestInterface $request
     * @param MfaProviderPropertyManager $propertyManager
     * @return bool
     */
    public function update(ServerRequestInterface $request, MfaProviderPropertyManager $propertyManager): bool
    {
        $name = (string)($request->getParsedBody()['name'] ?? '');
        if ($name !== '') {
            return $propertyManager->updateProperties(['name' => $name]);
        }

        // Provider properties successfully updated
        return true;
    }

    /**
     * Internal helper method for fetching the OTP from the request
     *
     * @param ServerRequestInterface $request
     * @return string
     */
    protected function getOtp(ServerRequestInterface $request): string
    {
        return trim((string)($request->getQueryParams()['otp'] ?? $request->getParsedBody()['otp'] ?? ''));
    }

    /**
     * Internal helper method for generating a svg QR-code for OTP applications
     *
     * @param AbstractOtp $otp
     * @param array $userData
     * @return string
     */
    protected function getSvgQrCode(AbstractOtp $otp, array $userData): string
    {
        $qrCode = new QrCode(
            $otp->getOtpAuthUrl(
                (string)($GLOBALS['TYPO3_CONF_VARS']['SYS']['sitename'] ?? 'TYPO3'),
                (string)($userData['email'] ?? '') ?: (string)($userData['username'] ?? '')
            )
        );
        $qrCode->setBackgroundColor(['r' => 250, 'g' => 250, 'b' => 250, 'a' => 0]);
        $qrCode->setForegroundColor(['r' => 254, 'g' => 125, 'b' => 35, 'a' => 0]);
        $qrCode->setWriterByName('svg');

        return $qrCode->writeString();
    }
}
