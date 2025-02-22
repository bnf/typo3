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

namespace TYPO3\CMS\FrontendLogin\Tests\Unit\Redirect;

use Generator;
use Prophecy\Prophecy\ObjectProphecy;
use Psr\Http\Message\ServerRequestInterface;
use TYPO3\CMS\Core\Context\Context;
use TYPO3\CMS\Core\Http\ServerRequest;
use TYPO3\CMS\Extbase\Mvc\ExtbaseRequestParameters;
use TYPO3\CMS\Extbase\Mvc\Request;
use TYPO3\CMS\Frontend\Controller\TypoScriptFrontendController;
use TYPO3\CMS\FrontendLogin\Configuration\RedirectConfiguration;
use TYPO3\CMS\FrontendLogin\Redirect\RedirectHandler;
use TYPO3\CMS\FrontendLogin\Redirect\RedirectMode;
use TYPO3\CMS\FrontendLogin\Redirect\RedirectModeHandler;
use TYPO3\CMS\FrontendLogin\Redirect\ServerRequestHandler;
use TYPO3\CMS\FrontendLogin\Validation\RedirectUrlValidator;
use TYPO3\TestingFramework\Core\Unit\UnitTestCase;

/**
 * Test case
 */
class RedirectHandlerTest extends UnitTestCase
{
    use \Prophecy\PhpUnit\ProphecyTrait;
    /**
     * If set to true, tearDown() will purge singleton instances created by the test.
     *
     * @var bool
     */
    protected $resetSingletonInstances = true;

    /**
     * @var RedirectHandler
     */
    protected $subject;

    /**
     * @var ServerRequestInterface
     */
    protected $typo3Request;

    /** @var ObjectProphecy<ServerRequestHandler> */
    protected ObjectProphecy $serverRequestHandler;

    /** @var ObjectProphecy<RedirectModeHandler> */
    protected ObjectProphecy $redirectModeHandler;

    /** @var ObjectProphecy<Context> */
    protected ObjectProphecy $context;

    /** @var ObjectProphecy<RedirectUrlValidator> */
    protected ObjectProphecy $redirectUrlValidator;

    protected function setUp(): void
    {
        parent::setUp();

        $this->serverRequestHandler = $this->prophesize(ServerRequestHandler::class);
        $this->redirectModeHandler = $this->prophesize(RedirectModeHandler::class);
        $this->context = $this->prophesize(Context::class);
        $this->redirectUrlValidator = $this->prophesize(RedirectUrlValidator::class);

        $GLOBALS['TSFE'] = $this->prophesize(TypoScriptFrontendController::class)->reveal();

        $this->subject = new RedirectHandler(
            $this->serverRequestHandler->reveal(),
            $this->redirectModeHandler->reveal(),
            $this->context->reveal(),
            $this->redirectUrlValidator->reveal()
        );
    }

    /**
     * @test
     * @dataProvider loginTypeLogoutDataProvider
     */
    public function processShouldReturnStringForLoginTypeLogout(string $expect, string $redirectMode): void
    {
        $this->redirectModeHandler->redirectModeLogout(0)->willReturn('');

        self::assertEquals($expect, $this->subject->processRedirect('logout', new RedirectConfiguration($redirectMode, '', 0, '', 0, 0), ''));
    }

    public function loginTypeLogoutDataProvider(): Generator
    {
        yield 'empty string on empty redirect mode' => ['', ''];
        yield 'empty string on redirect mode logout' => ['', 'logout'];
    }

    /**
     * @test
     * @dataProvider getLogoutRedirectUrlDataProvider
     */
    public function getLogoutRedirectUrlShouldReturnAlternativeRedirectUrl(
        string $expected,
        array $redirectModes,
        array $body,
        bool $userLoggedIn
    ): void {
        $this->setUserLoggedIn($userLoggedIn);

        $this->serverRequestHandler
            ->getRedirectUrlRequestParam()
            ->willReturn($body['return_url'] ?? '');

        $configuration = RedirectConfiguration::fromSettings(['redirectMode' => $redirectModes]);
        self::assertEquals($expected, $this->subject->getLogoutFormRedirectUrl($configuration, 13, false));
    }

    public function getLogoutRedirectUrlDataProvider(): Generator
    {
        yield 'empty redirect mode should return empty returnUrl' => ['', [], [], false];
        yield 'redirect mode getpost should return param return_url' => [
            'https://dummy.url',
            ['getpost'],
            ['return_url' => 'https://dummy.url'],
            false,
        ];
        yield 'redirect mode getpost,logout should return param return_url on not logged in user' => [
            'https://dummy.url/3',
            ['getpost', 'logout'],
            ['return_url' => 'https://dummy.url/3'],
            false,
        ];
    }

    /**
     * @test
     */
    public function getLogoutRedirectUrlShouldReturnAlternativeRedirectUrlForLoggedInUserAndRedirectPageLogoutSet(): void
    {
        $this->setUserLoggedIn(true);

        $this->subject = new RedirectHandler(
            $this->serverRequestHandler->reveal(),
            $this->redirectModeHandler->reveal(),
            $this->context->reveal(),
            $this->redirectUrlValidator->reveal()
        );

        $this->serverRequestHandler
            ->getRedirectUrlRequestParam()
            ->willReturn([]);

        $this->redirectModeHandler
            ->redirectModeLogout(3)
            ->willReturn('https://logout.url');

        $configuration = RedirectConfiguration::fromSettings(['redirectMode' => ['logout']]);
        self::assertEquals('https://logout.url', $this->subject->getLogoutFormRedirectUrl($configuration, 3, false));
    }

    protected function setUserLoggedIn(bool $userLoggedIn): void
    {
        $this->context
            ->getPropertyFromAspect('frontend.user', 'isLoggedIn')
            ->willReturn($userLoggedIn);
    }

    public function getLoginFormRedirectUrlDataProvider(): array
    {
        return [
            'redirect disabled' => [
                'no url',
                'getpost',
                true,
                '',
            ],
            'redirect enabled, GET/POST redirect mode not configured' => [
                'https://redirect.url',
                'login',
                false,
                '',
            ],
            'redirect enabled, GET/POST redirect mode configured' => [
                'https://redirect.url',
                'login,getpost',
                false,
                'https://redirect.url',
            ],
        ];
    }

    /**
     * @test
     * @dataProvider getLoginFormRedirectUrlDataProvider
     */
    public function getLoginFormRedirectUrlReturnsExpectedValue(
        string $redirectUrl,
        string $redirectMode,
        bool $redirectDisabled,
        string $expected
    ) {
        $this->subject = new RedirectHandler(
            $this->serverRequestHandler->reveal(),
            $this->redirectModeHandler->reveal(),
            $this->context->reveal(),
            $this->redirectUrlValidator->reveal()
        );

        $this->serverRequestHandler->getRedirectUrlRequestParam()->willReturn($redirectUrl);
        $configuration = RedirectConfiguration::fromSettings(['redirectMode' => $redirectMode]);
        self::assertEquals($expected, $this->subject->getLoginFormRedirectUrl($configuration, $redirectDisabled));
    }

    /**
     * @test
     */
    public function getReferrerForLoginFormReturnsEmptyStringIfRedirectModeReferrerDisabled(): void
    {
        $serverRequest = (new ServerRequest())->withAttribute('extbase', new ExtbaseRequestParameters());
        $request = new Request($serverRequest);
        $settings = ['redirectMode' => RedirectMode::LOGIN];
        self::assertEquals('', $this->subject->getReferrerForLoginForm($request, $settings));
    }

    /**
     * @test
     */
    public function getReferrerForLoginFormReturnsReferrerGetParameter(): void
    {
        $expectedReferrer = 'https://example.com/page-referrer';
        $serverRequest = (new ServerRequest())->withAttribute('extbase', new ExtbaseRequestParameters())
            ->withQueryParams(['referer' => $expectedReferrer]);
        $request = new Request($serverRequest);
        $this->redirectUrlValidator->isValid($expectedReferrer)->willReturn(true);
        $settings = ['redirectMode' => RedirectMode::REFERRER];
        self::assertEquals($expectedReferrer, $this->subject->getReferrerForLoginForm($request, $settings));
    }

    /**
     * @test
     */
    public function getReferrerForLoginFormReturnsReferrerPostParameter(): void
    {
        $expectedReferrer = 'https://example.com/page-referrer';
        $serverRequest = (new ServerRequest())->withAttribute('extbase', new ExtbaseRequestParameters())
            ->withParsedBody(['referer' => $expectedReferrer]);
        $request = new Request($serverRequest);
        $this->redirectUrlValidator->isValid($expectedReferrer)->willReturn(true);
        $settings = ['redirectMode' => RedirectMode::REFERRER];
        self::assertEquals($expectedReferrer, $this->subject->getReferrerForLoginForm($request, $settings));
    }

    /**
     * @test
     */
    public function getReferrerForLoginFormReturnsHttpReferrerParameter(): void
    {
        $expectedReferrer = 'https://example.com/page-referrer';
        $serverRequest = (new ServerRequest('/login', 'GET', 'php://input', [], ['HTTP_REFERER' => $expectedReferrer]))
            ->withAttribute('extbase', new ExtbaseRequestParameters());
        $request = new Request($serverRequest);
        $this->redirectUrlValidator->isValid($expectedReferrer)->willReturn(true);
        $settings = ['redirectMode' => RedirectMode::REFERRER];
        self::assertEquals($expectedReferrer, $this->subject->getReferrerForLoginForm($request, $settings));
    }

    /**
     * @test
     */
    public function getReferrerForLoginFormReturnsOriginalRequestUrlIfCalledBySubRequest(): void
    {
        $expectedReferrer = 'https://example.com/original-page';
        $serverRequest = (new ServerRequest())->withAttribute('extbase', new ExtbaseRequestParameters())
            ->withAttribute('originalRequest', new ServerRequest($expectedReferrer));
        $request = new Request($serverRequest);
        $this->redirectUrlValidator->isValid($expectedReferrer)->willReturn(true);
        $settings = ['redirectMode' => RedirectMode::REFERRER];
        self::assertEquals($expectedReferrer, $this->subject->getReferrerForLoginForm($request, $settings));
    }
}
