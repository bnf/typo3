<?php
namespace TYPO3\CMS\Frontend\Http;

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

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\RequestHandlerInterface;
use TYPO3\CMS\Core\Core\ApplicationInterface;
use TYPO3\CMS\Core\Core\Bootstrap;
use TYPO3\CMS\Core\Http\MiddlewareDispatcher;
use TYPO3\CMS\Core\Http\MiddlewareStackResolver;
use TYPO3\CMS\Core\Utility\GeneralUtility;

/**
 * Entry point for the TYPO3 Frontend
 */
class Application implements ApplicationInterface, RequestHandlerInterface
{
    /**
     * @var Bootstrap
     */
    protected $bootstrap;

    /**
     * Number of subdirectories where the entry script is located, relative to PATH_site
     * Usually this is equal to PATH_site = 0
     * @var int
     */
    protected $entryPointLevel = 0;

    /**
     * Constructor setting up legacy constant and register available Request Handlers
     *
     * @param \Composer\Autoload\ClassLoader $classLoader an instance of the class loader
     */
    public function __construct($classLoader)
    {
        $this->defineLegacyConstants();

        $this->bootstrap = Bootstrap::getInstance()
            ->initializeClassLoader($classLoader)
            ->setRequestType(TYPO3_REQUESTTYPE_FE)
            ->baseSetup($this->entryPointLevel);

        // Redirect to install tool if base configuration is not found
        if (!$this->bootstrap->checkIfEssentialConfigurationExists()) {
            $this->bootstrap->redirectToInstallTool($this->entryPointLevel);
        }

        $this->bootstrap->configure();
    }

    /**
     * @param ServerRequestInterface $request
     * @return ResponseInterface
     */
    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        $requestHandler = GeneralUtility::makeInstance(\TYPO3\CMS\Frontend\Http\RequestHandler::class, $this->bootstrap);

        $resolver = new MiddlewareStackResolver(
            GeneralUtility::makeInstance(\TYPO3\CMS\Core\Package\PackageManager::class),
            GeneralUtility::makeInstance(\TYPO3\CMS\Core\Service\DependencyOrderingService::class),
            GeneralUtility::makeInstance(\TYPO3\CMS\Core\Cache\CacheManager::class)->getCache('cache_core')
        );
        $middlewares = $resolver->resolve('frontend');
        $dispatcher = new MiddlewareDispatcher($requestHandler, $middlewares);

        return $dispatcher->handle($request);
    }

    /**
     * Starting point
     *
     * @param callable $execute
     */
    public function run(callable $execute = null)
    {
        $response = $this->handle(\TYPO3\CMS\Core\Http\ServerRequestFactory::fromGlobals());

        if ($execute !== null) {
            call_user_func($execute);
        }

        $this->bootstrap->sendResponse($response);
    }

    /**
     * Define constants and variables
     */
    protected function defineLegacyConstants()
    {
        define('TYPO3_MODE', 'FE');
    }
}
