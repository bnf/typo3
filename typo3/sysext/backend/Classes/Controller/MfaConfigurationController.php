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
use Psr\Http\Message\UriInterface;
use TYPO3\CMS\Backend\Routing\UriBuilder;
use TYPO3\CMS\Backend\Template\Components\ButtonBar;
use TYPO3\CMS\Backend\Template\ModuleTemplate;
use TYPO3\CMS\Core\Authentication\BackendUserAuthentication;
use TYPO3\CMS\Core\Authentication\Mfa\MfaContentType;
use TYPO3\CMS\Core\Authentication\Mfa\MfaProviderInterface;
use TYPO3\CMS\Core\Authentication\Mfa\MfaProviderRegistry;
use TYPO3\CMS\Core\Http\HtmlResponse;
use TYPO3\CMS\Core\Http\RedirectResponse;
use TYPO3\CMS\Core\Imaging\Icon;
use TYPO3\CMS\Core\Localization\LanguageService;
use TYPO3\CMS\Core\Messaging\FlashMessage;
use TYPO3\CMS\Core\Messaging\FlashMessageService;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Extbase\Mvc\View\ViewInterface;
use TYPO3\CMS\Fluid\View\StandaloneView;

/**
 * Controller to configure MFA providers in the backend
 *
 * @internal This class is a specific Backend controller implementation and is not considered part of the Public TYPO3 API.
 */
class MfaConfigurationController
{
    private const ALLOWED_ACTIONS = ['overview', 'setup', 'activate', 'deactivate', 'unlock', 'edit', 'save'];

    protected ModuleTemplate $moduleTemplate;
    protected UriBuilder $uriBuilder;
    protected MfaProviderRegistry $mfaProviderRegistry;
    protected ?MfaProviderInterface $mfaProvider = null;
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
        $action = $request->getQueryParams()['action'] ?? $request->getParsedBody()['action'] ?? 'overview';

        if (!in_array($action, self::ALLOWED_ACTIONS, true)) {
            return new HtmlResponse('Action not allowed', 400);
        }

        $this->initializeAction($request);
        // All actions expect "overview" require a provider to deal with.
        // If non is found at this point, initiate a redirect to the overview.
        if ($this->mfaProvider === null && $action !== 'overview') {
            $this->addFlashMessage($this->getLanguageService()->sL('LLL:EXT:backend/Resources/Private/Language/locallang_mfa.xlf:setup.noProvider'), '', FlashMessage::ERROR);
            return new RedirectResponse($this->getActionUri('overview'));
        }
        $this->initializeView($action);

        $result = $this->{$action . 'Action'}($request);
        if ($result instanceof ResponseInterface) {
            return $result;
        }
        $this->moduleTemplate->setContent($this->view->render());
        return new HtmlResponse($this->moduleTemplate->renderContent());
    }

    /**
     * Setup the overview with all available MFA providers
     *
     * @param ServerRequestInterface $request
     */
    public function overviewAction(ServerRequestInterface $request): void
    {
        $this->addOverviewButtons($request);
        $this->view->assignMultiple([
            'providers' => $this->mfaProviderRegistry->getProviders(),
            'defaultProvider' => $this->getDefaultProvider()
        ]);
    }

    /**
     * Render form to setup a provider by using provider specific content
     *
     * @param ServerRequestInterface $request
     * @return ResponseInterface
     */
    public function setupAction(ServerRequestInterface $request): ResponseInterface
    {
        $this->addFormButtons();
        $this->view->assignMultiple([
            'provider' => $this->mfaProvider,
            'providerContent' => $this->mfaProvider->renderContent($request, $this->getBackendUser(), MfaContentType::SETUP)
        ]);
        $this->moduleTemplate->setContent($this->view->render());
        return new HtmlResponse($this->moduleTemplate->renderContent());
    }

    /**
     * Handle activate request, receiving from the setup view by
     * forwarding the request to the appropriate provider. Furthermore,
     * add the provider as default provider in case no default provider
     * is yet defined, the newly activated provider is allowed to be a
     * default provider and there are no other providers which would
     * suite as default provider, too.
     *
     * @param ServerRequestInterface $request
     * @return ResponseInterface
     */
    public function activateAction(ServerRequestInterface $request): ResponseInterface
    {
        if (!$this->mfaProvider->activate($request, $this->getBackendUser())) {
            $this->addFlashMessage(sprintf($this->getLanguageService()->sL('LLL:EXT:backend/Resources/Private/Language/locallang_mfa.xlf:activate.failure'), $this->mfaProvider->getManifest()->getTitle()), '', FlashMessage::ERROR);
            return new RedirectResponse($this->getActionUri('setup', ['identifier' => $this->mfaProvider->getIdentifier()]));
        }
        if ($this->getDefaultProvider() === ''
            && !$this->hasSuitableDefaultProviders([$this->mfaProvider->getIdentifier()])
            && $this->mfaProvider->getManifest()->isDefaultProviderAllowed()
        ) {
            $this->setDefaultProdiver();
        }
        $this->addFlashMessage(sprintf($this->getLanguageService()->sL('LLL:EXT:backend/Resources/Private/Language/locallang_mfa.xlf:activate.success'), $this->mfaProvider->getManifest()->getTitle()), '', FlashMessage::OK);
        return new RedirectResponse($this->getActionUri('overview'));
    }

    /**
     * Handle deactivate request by forwarding the request to the
     * appropriate provider. Also remove the provider as default
     * provider from user UC, if set.
     *
     * @param ServerRequestInterface $request
     * @return ResponseInterface
     */
    public function deactivateAction(ServerRequestInterface $request): ResponseInterface
    {
        if (!$this->mfaProvider->deactivate($request, $this->getBackendUser())) {
            $this->addFlashMessage(sprintf($this->getLanguageService()->sL('LLL:EXT:backend/Resources/Private/Language/locallang_mfa.xlf:deactivate.failure'), $this->mfaProvider->getManifest()->getTitle()), '', FlashMessage::ERROR);
        } else {
            if ($this->isDefaultProvider()) {
                $this->removeDefaultProvider();
            }
            $this->addFlashMessage(sprintf($this->getLanguageService()->sL('LLL:EXT:backend/Resources/Private/Language/locallang_mfa.xlf:deactivate.success'), $this->mfaProvider->getManifest()->getTitle()), '', FlashMessage::OK);
        }
        return new RedirectResponse($this->getActionUri('overview'));
    }

    /**
     * Handle unlock request by forwarding the request to the appropriate provider
     *
     * @param ServerRequestInterface $request
     * @return ResponseInterface
     */
    public function unlockAction(ServerRequestInterface $request): ResponseInterface
    {
        if (!$this->mfaProvider->unlock($request, $this->getBackendUser())) {
            $this->addFlashMessage(sprintf($this->getLanguageService()->sL('LLL:EXT:backend/Resources/Private/Language/locallang_mfa.xlf:unlock.failure'), $this->mfaProvider->getManifest()->getTitle()), '', FlashMessage::ERROR);
        } else {
            $this->addFlashMessage(sprintf($this->getLanguageService()->sL('LLL:EXT:backend/Resources/Private/Language/locallang_mfa.xlf:unlock.success'), $this->mfaProvider->getManifest()->getTitle()), '', FlashMessage::OK);
        }
        return new RedirectResponse($this->getActionUri('overview'));
    }

    /**
     * Render form to edit a provider by using provider specific content
     *
     * @param ServerRequestInterface $request
     * @return ResponseInterface
     */
    public function editAction(ServerRequestInterface $request): ResponseInterface
    {
        $this->addFormButtons();
        $this->view->assignMultiple([
            'provider' => $this->mfaProvider,
            'providerContent' => $this->mfaProvider->renderContent($request, $this->getBackendUser(), MfaContentType::EDIT),
            'isDefaultProvider' => $this->isDefaultProvider()
        ]);
        $this->moduleTemplate->setContent($this->view->render());
        return new HtmlResponse($this->moduleTemplate->renderContent());
    }

    /**
     * Handle save request, receiving from the edit view by
     * forwarding the request to the appropriate provider.
     *
     * @param ServerRequestInterface $request
     * @return ResponseInterface
     */
    public function saveAction(ServerRequestInterface $request): ResponseInterface
    {
        if (!$this->mfaProvider->update($request, $this->getBackendUser())) {
            $this->addFlashMessage(sprintf($this->getLanguageService()->sL('LLL:EXT:backend/Resources/Private/Language/locallang_mfa.xlf:save.failure'), $this->mfaProvider->getManifest()->getTitle()), '', FlashMessage::ERROR);
        } else {
            if ((bool)($request->getParsedBody()['defaultProvider'] ?? false)) {
                $this->setDefaultProdiver();
            } elseif ($this->isDefaultProvider()) {
                $this->removeDefaultProvider();
            }
            $this->addFlashMessage(sprintf($this->getLanguageService()->sL('LLL:EXT:backend/Resources/Private/Language/locallang_mfa.xlf:save.success'), $this->mfaProvider->getManifest()->getTitle()), '', FlashMessage::OK);
        }
        return new RedirectResponse($this->getActionUri('edit', ['identifier' => $this->mfaProvider->getIdentifier()]));
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
            $this->mfaProvider = $this->mfaProviderRegistry->getProvider($identifier);
        }
    }

    protected function initializeView(string $templateName): void
    {
        $this->view = GeneralUtility::makeInstance(StandaloneView::class);
        $this->view->setTemplateRootPaths(['EXT:backend/Resources/Private/Templates/Mfa']);
        $this->view->setPartialRootPaths(['EXT:backend/Resources/Private/Partials']);
        $this->view->setLayoutRootPaths(['EXT:backend/Resources/Private/Layouts']);
        $this->view->setTemplate($templateName);
    }

    protected function addOverviewButtons(ServerRequestInterface $request): void
    {
        $buttonBar = $this->moduleTemplate->getDocHeaderComponent()->getButtonBar();

        $button = $buttonBar
            ->makeLinkButton()
            ->setHref((string)$this->uriBuilder->buildUriFromRoute('user_setup'))
            ->setIcon($this->moduleTemplate->getIconFactory()->getIcon('actions-view-go-back', Icon::SIZE_SMALL))
            ->setTitle($this->getLanguageService()->sL('LLL:EXT:core/Resources/Private/Language/locallang_core.xlf:labels.goBack'))
            ->setShowLabelText(true);
        $buttonBar->addButton($button);

        $reloadButton = $buttonBar
            ->makeLinkButton()
            ->setHref($request->getAttribute('normalizedParams')->getRequestUri())
            ->setTitle($this->getLanguageService()->sL('LLL:EXT:core/Resources/Private/Language/locallang_core.xlf:labels.reload'))
            ->setIcon($this->moduleTemplate->getIconFactory()->getIcon('actions-refresh', Icon::SIZE_SMALL));
        $buttonBar->addButton($reloadButton, ButtonBar::BUTTON_POSITION_RIGHT);
    }

    protected function addFormButtons(): void
    {
        $buttonBar = $this->moduleTemplate->getDocHeaderComponent()->getButtonBar();
        $lang = $this->getLanguageService();

        $closeButton = $buttonBar
            ->makeLinkButton()
            ->setHref($this->uriBuilder->buildUriFromRoute('mfa', ['action' => 'overview']))
            ->setClasses('t3js-editform-close')
            ->setTitle($lang->sL('LLL:EXT:core/Resources/Private/Language/locallang_core.xlf:rm.closeDoc'))
            ->setShowLabelText(true)
            ->setIcon($this->moduleTemplate->getIconFactory()->getIcon('actions-close', Icon::SIZE_SMALL));
        $buttonBar->addButton($closeButton);

        $saveButton = $buttonBar
            ->makeInputButton()
            ->setTitle($lang->sL('LLL:EXT:core/Resources/Private/Language/locallang_core.xlf:rm.saveDoc'))
            ->setName('save')
            ->setValue('1')
            ->setShowLabelText(true)
            ->setForm('mfaController')
            ->setIcon($this->moduleTemplate->getIconFactory()->getIcon('actions-document-save', Icon::SIZE_SMALL));
        $buttonBar->addButton($saveButton, ButtonBar::BUTTON_POSITION_LEFT, 2);
    }

    protected function addFlashMessage(string $message, string $title = '', int $severity = FlashMessage::INFO): void
    {
        $flashMessage = GeneralUtility::makeInstance(FlashMessage::class, $message, $title, $severity, true);
        $flashMessageService = GeneralUtility::makeInstance(FlashMessageService::class);
        $defaultFlashMessageQueue = $flashMessageService->getMessageQueueByIdentifier();
        $defaultFlashMessageQueue->enqueue($flashMessage);
    }

    protected function getActionUri(string $action, array $additionalParameters = []): UriInterface
    {
        if (!in_array($action, self::ALLOWED_ACTIONS, true)) {
            $action = 'overview';
        }
        return $this->uriBuilder->buildUriFromRoute('mfa', array_merge(['action' => $action], $additionalParameters));
    }

    protected function setDefaultProdiver(): void
    {
        $this->getBackendUser()->uc['mfa']['defaultProvider'] = $this->mfaProvider->getIdentifier();
        $this->getBackendUser()->writeUC();
    }

    protected function removeDefaultProvider(): void
    {
        $this->getBackendUser()->uc['mfa']['defaultProvider'] = '';
        $this->getBackendUser()->writeUC();
    }

    protected function isDefaultProvider(): bool
    {
        return $this->getDefaultProvider() === $this->mfaProvider->getIdentifier();
    }

    protected function getDefaultProvider(): string
    {
        return (string)($this->getBackendUser()->uc['mfa']['defaultProvider'] ?? '');
    }

    protected function hasSuitableDefaultProviders(array $excludedProviders = []): bool
    {
        $user = $this->getBackendUser();
        foreach ($this->mfaProviderRegistry->getProviders() as $identifier => $provider) {
            if ($provider->isActive($user)
                && !in_array($identifier, $excludedProviders, true)
                && $provider->getManifest()->isDefaultProviderAllowed()
            ) {
                return true;
            }
        }
        return false;
    }

    protected function getBackendUser(): BackendUserAuthentication
    {
        return $GLOBALS['BE_USER'];
    }

    protected function getLanguageService(): LanguageService
    {
        return $GLOBALS['LANG'];
    }
}
