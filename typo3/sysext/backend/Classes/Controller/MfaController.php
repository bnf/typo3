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

namespace TYPO3\CMS\Backend\Controller;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use TYPO3\CMS\Backend\ContextMenu\ItemProviders\ProviderInterface;
use TYPO3\CMS\Backend\Routing\Exception\RouteNotFoundException;
use TYPO3\CMS\Backend\Routing\UriBuilder;
use TYPO3\CMS\Backend\Template\ModuleTemplate;
use TYPO3\CMS\Core\Authentication\BackendUserAuthentication;
use TYPO3\CMS\Core\Authentication\Mfa\MfaContentType;
use TYPO3\CMS\Core\Authentication\Mfa\MfaProviderInterface;
use TYPO3\CMS\Core\Authentication\Mfa\MfaProviderRegistry;
use TYPO3\CMS\Core\Http\HtmlResponse;
use TYPO3\CMS\Core\Http\RedirectResponse;
use TYPO3Fluid\Fluid\View\ViewInterface;

/**
 * Controller to provide MFA authentication
 *
 * @internal This class is a specific Backend controller implementation and is not considered part of the Public TYPO3 API.
 */
class MfaController
{
    private const ALLOWED_ACTIONS = ['auth', 'verify', 'cancel'];

    protected ModuleTemplate $moduleTemplate;
    protected UriBuilder $uriBuilder;
    protected MfaProviderRegistry $mfaProviderRegistry;
    protected ?MfaProviderInterface $mfaProvider = null;
    protected ?MfaProviderManifestInterface $mfaProviderManifest = null;
    protected ?ViewInterface $view = null;

    public function __construct(
        ModuleTemplate $moduleTemplate,
        UriBuilder $uriBuilder,
        MfaProviderRegistry $mfaProviderRegistry
    ) {
        $this->moduleTemplate = $moduleTemplate;
        $this->uriBuilder = $uriBuilder;
        $this->mfaProviderRegistry = $mfaProviderRegistry;
    }

    /**
     * Main entry point, checking prerequisite, initializing and setting
     * up the view and finally dispatching to the requested action.
     *
     * @param ServerRequestInterface $request
     * @return ResponseInterface
     */
    public function handleRequest(ServerRequestInterface $request): ResponseInterface
    {
        $action = $request->getQueryParams()['action'] ?? $request->getParsedBody()['action'] ?? 'auth';

        if (!in_array($action, self::ALLOWED_ACTIONS, true)) {
            throw new \InvalidArgumentException('Action not allowed', 1611879243);
        }

        $this->initializeAction($request);
        // All actions expect "cancel" require a provider to deal with.
        // If non is found at this point, throw an exception since this should never happen.
        if ($this->mfaProvider === null && $action !== 'cancel') {
            throw new \InvalidArgumentException('No active MFA provider was found!', 1611879242);
        }

        $this->view = $this->moduleTemplate->getView();
        $this->view->setTemplateRootPaths(['EXT:backend/Resources/Private/Templates/Mfa']);
        $this->view->setTemplate('Auth');
        $this->view->assign('hasAuthError', $request->getQueryParams()['failure'] ?? false);

        $result = $this->{$action . 'Action'}($request);
        if ($result instanceof ResponseInterface) {
            return $result;
        }
        $this->moduleTemplate->setTitle('TYPO3 CMS Login: ' . $GLOBALS['TYPO3_CONF_VARS']['SYS']['sitename']);
        return new HtmlResponse($this->moduleTemplate->renderContent());
    }

    /**
     * Setup the authentication view for the provider by using provider specific content
     *
     * @param ServerRequestInterface $request
     */
    public function authAction(ServerRequestInterface $request): void
    {
        $this->view->assignMultiple([
            'provider' => $this->mfaProvider,
            'alternativeProviders' => $this->getAlternativeProviders(),
            'isLocked' => $this->mfaProvider->isLocked($this->getBackendUser()),
            'providerContent' => $this->mfaProvider->renderContent($request, $this->getBackendUser(), MfaContentType::AUTH)
        ]);
    }

    /**
     * Handle verification request, receiving from the auth view
     * by forwarding the request to the appropriate provider.
     *
     * @param ServerRequestInterface $request
     * @return ResponseInterface
     * @throws RouteNotFoundException
     */
    public function verifyAction(ServerRequestInterface $request): ResponseInterface
    {
        $propertyManager = $this->getBackendUser()->getMfaProviderPropertyManager($this->mfaProvider->getIdentifier());
        $providernstance = $this->mfaProvider->getInstance();

        // Check if the provider can process the request and is not temporarily blocked
        if (!$this->mfaProvider->canProcess($request) || $this->mfaProvider->isLocked($this->getBackendUser())) {
            // If this fails, cancel the authentication
            return $this->cancelAction($request);
        }
        // Call the provider to verify the request
        if (!$this->mfaProvider->verify($request, $this->getBackendUser())) {
            // If failed, initiate a redirect back to the auth view
            return new RedirectResponse($this->uriBuilder->buildUriFromRoute(
                'auth_mfa',
                [
                    'identifier' => $this->mfaProvider->getIdentifier(),
                    'failure' => true
                ]
            ));
        }
        // If verified, store this information in the session
        // and initiate a redirect back to the login view.
        $this->getBackendUser()->setAndSaveSessionData('mfa', true);
        return new RedirectResponse($this->uriBuilder->buildUriFromRoute('login'));
    }

    /**
     * Allow the user to cancel the multi-factor authentication by
     * calling logoff on the user object, to destroy the session and
     * other already gathered information and finally initiate a
     * redirect back to the login.
     *
     * @param ServerRequestInterface $request
     * @return ResponseInterface
     * @throws RouteNotFoundException
     */
    public function cancelAction(ServerRequestInterface $request): ResponseInterface
    {
        $this->getBackendUser()->logoff();
        return new RedirectResponse($this->uriBuilder->buildUriFromRoute('login'));
    }

    /**
     * Initialize the action by fetching the requested provider by its identifier
     *
     * @param ServerRequestInterface $request
     */
    protected function initializeAction(ServerRequestInterface $request): void
    {
        $identifier = $request->getQueryParams()['identifier'] ?? $request->getParsedBody()['identifier'] ?? '';
        if ($identifier !== '' && $this->mfaProviderRegistry->hasProvider($identifier)) {
            $provider = $this->mfaProviderRegistry->getProvider($identifier);
            // Only add provider if it is activated for the current user
            if ($provider->isActive($this->getBackendUser())) {
                $this->mfaProvider = $provider;
            }
        }
    }

    /**
     * Fetch alternative (activated) providers for the user to chose from
     *
     * @return ProviderInterface[]
     */
    protected function getAlternativeProviders(): array
    {
        $alternativeProviders = [];
        foreach ($this->mfaProviderRegistry->getProviders() as $provider) {
            if ($provider !== $this->mfaProvider && $provider->isActive($this->getBackendUser())) {
                $alternativeProviders[$provider->getIdentifier()] = $provider;
            }
        }
        return $alternativeProviders;
    }

    protected function getBackendUser(): BackendUserAuthentication
    {
        return $GLOBALS['BE_USER'];
    }
}
