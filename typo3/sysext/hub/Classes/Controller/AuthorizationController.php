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

namespace TYPO3\CMS\Hub\Controller;

use League\OAuth2\Server\AuthorizationServer;
use League\OAuth2\Server\Exception\OAuthServerException;
use League\OAuth2\Server\RequestTypes\AuthorizationRequestInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Log\LoggerInterface;
use TYPO3\CMS\Backend\Attribute\AsController;
use TYPO3\CMS\Backend\Template\PageRendererBackendSetupTrait;
use TYPO3\CMS\Backend\View\AuthenticationStyleInformation;
use TYPO3\CMS\Backend\View\BackendViewFactory;
use TYPO3\CMS\Core\Authentication\BackendUserAuthentication;
use TYPO3\CMS\Core\Configuration\ExtensionConfiguration;
use TYPO3\CMS\Core\FormProtection\AbstractFormProtection;
use TYPO3\CMS\Core\FormProtection\FormProtectionFactory;
use TYPO3\CMS\Core\Http\ResponseFactory;
use TYPO3\CMS\Core\Localization\LanguageService;
use TYPO3\CMS\Core\Page\PageRenderer;
use TYPO3\CMS\Core\Type\File\ImageInfo;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Core\Utility\PathUtility;
use TYPO3\CMS\Core\View\ViewInterface;
use TYPO3\CMS\Hub\Model\User;
use TYPO3\CMS\Hub\Repository\OAuth\ScopeRepository;

#[AsController]
final readonly class AuthorizationController
{
    use PageRendererBackendSetupTrait;

    public function __construct(
        private PageRenderer $pageRenderer,
        private BackendViewFactory $backendViewFactory,
        private ExtensionConfiguration $extensionConfiguration,
        private AuthenticationStyleInformation $authenticationStyleInformation,
        private LoggerInterface $logger,
        private FormProtectionFactory $formProtectionFactory,
        private ResponseFactory $responseFactory,
        private AuthorizationServer $authorizationServer,
        private ScopeRepository $scopeRepository,
    ) {}

    public function authorizeAction(ServerRequestInterface $request): ResponseInterface
    {
        $this->logger->error('authorize');

        try {
            // Validate the HTTP request and return an AuthorizationRequest object.
            // The auth request object can be serialized into a user's session
            $authRequest = $this->authorizationServer->validateAuthorizationRequest($request);
        } catch (OAuthServerException $exception) {
            // @todo present understandable error message, if oauth callback is wrong
            return $exception->generateHttpResponse($this->responseFactory->createResponse());
        }

        $formProtection = $this->formProtectionFactory->createFromRequest($request);

        return match ($request->getMethod()) {
            'POST' => $this->handleAuthorizationAttempt($request, $formProtection, $authRequest),
            'GET' => $this->renderAuthorizationView($request, $formProtection, $authRequest),
            default => throw new \LogicException('Only POST or GET methods allowed', 1770211622),
        };
    }

    private function handleAuthorizationAttempt(
        ServerRequestInterface $request,
        AbstractFormProtection $formProtection,
        AuthorizationRequestInterface $authRequest,
    ): ResponseInterface {
        $parsedBody = $request->getParsedBody();
        if (!$formProtection->validateToken((string)($parsedBody['formToken'] ?? ''), 'oauth', 'authorize')) {
            return $this->responseFactory
                ->createResponse(400, 'Invalid request token given');
        }

        $authorize = (bool)(int)($parsedBody['authorize'] ?? 0);
        // @todo fill in real user data
        $authRequest->setUser(new User('be_users:' . (string)$this->getBackendUser()->user['uid']));
        $authRequest->setAuthorizationApproved($authorize);

        try {
            return $this->authorizationServer->completeAuthorizationRequest($authRequest, $this->responseFactory->createResponse());
        } catch (OAuthServerException $exception) {
            return $exception->generateHttpResponse($this->responseFactory->createResponse());
        }
    }

    private function renderAuthorizationView(
        ServerRequestInterface $request,
        AbstractFormProtection $formProtection,
        AuthorizationRequestInterface $authRequest,
    ): ResponseInterface {
        $this->setUpBasicPageRendererForBackend($this->pageRenderer, $this->extensionConfiguration, $request, $this->getLanguageService());

        $this->pageRenderer->setTitle(sprintf(
            'TYPO3 – Authorize %s on %s',
            $authRequest->getClient()->getName(),
            $GLOBALS['TYPO3_CONF_VARS']['SYS']['sitename'] ?? ''
        ));

        $scopes = $this->scopeRepository->finalizeScopes(
            $authRequest->getScopes(),
            $authRequest->getGrantTypeId(),
            $authRequest->getClient(),
            'be_users:' . $this->getBackendUser()->user['uid'],
            null, /* auth code id */
        );

        $view = $this->backendViewFactory->create($request);
        $view->assign('formUrl', (string)$request->getUri());
        $view->assign('authRequest', $authRequest);
        $view->assign('scopes', $scopes);
        $view->assign('sitename', $GLOBALS['TYPO3_CONF_VARS']['SYS']['sitename'] ?? '');
        $view->assign('user', $this->getBackendUser());
        $view->assign('formToken', $formProtection->generateToken('oauth', 'authorize'));

        $this->provideCustomLoginStyling($request, $view);
        $this->pageRenderer->setBodyContent('<body>' . $view->render('OAuth/Authorize'));
        return $this->pageRenderer->renderResponse();
    }

    protected function getLanguageService(): LanguageService
    {
        return $GLOBALS['LANG'];
    }

    protected function getBackendUser(): BackendUserAuthentication
    {
        return $GLOBALS['BE_USER'];
    }

    protected function provideCustomLoginStyling(
        ServerRequestInterface $request,
        ViewInterface $view,
    ): void {
        if (($backgroundImageStyles = $this->authenticationStyleInformation->getBackgroundImageStyles($request)) !== '') {
            $this->pageRenderer->addCssInlineBlock('loginBackgroundImage', $backgroundImageStyles, useNonce: true);
        }
        if (($footerNote = $this->authenticationStyleInformation->getFooterNote()) !== '') {
            $view->assign('loginFootnote', $footerNote);
        }
        if (($highlightColorStyles = $this->authenticationStyleInformation->getHighlightColorStyles()) !== '') {
            $this->pageRenderer->addCssInlineBlock('loginHighlightColor', $highlightColorStyles, useNonce: true);
        }

        // Code taken from BackendController::assignTopbarDetailsToView()
        // @todo share code
        $extConf = $this->extensionConfiguration->get('backend');
        $logoPath = '';
        $logoUrl = '';
        $logoWidth = 22;
        $logoHeight = 22;
        if (!empty($extConf['backendLogo'])) {
            $configuredLogo = ltrim($extConf['backendLogo'], '/');
            $customBackendLogo = GeneralUtility::getFileAbsFileName($configuredLogo);
            if ($customBackendLogo !== '' && file_exists($customBackendLogo)) {
                $logoPath = $customBackendLogo;
                $logoUrl = (string)PathUtility::getSystemResourceUri($configuredLogo, $request);
                // set width/height for custom logo
                $imageInfo = GeneralUtility::makeInstance(ImageInfo::class, $logoPath);
                $logoWidth = $imageInfo->getWidth() ?: $logoWidth;
                $logoHeight = $imageInfo->getHeight() ?: $logoHeight;

                // High-resolution?
                if (str_contains($logoPath, '@2x.')) {
                    $logoWidth /= 2;
                    $logoHeight /= 2;
                }
            }
        }
        // if no custom logo was set or the path is invalid, use the original one
        if ($logoPath === '') {
            $logoUrl = (string)PathUtility::getSystemResourceUri('EXT:backend/Resources/Public/Images/typo3_logo_orange.svg', $request);
        }

        $view->assign('logoUrl', $logoUrl);
        $view->assign('logoRatio', $logoWidth / $logoHeight);
        $view->assign('logoWidth', $logoWidth);
        $view->assign('logoHeight', $logoHeight);
    }
}
