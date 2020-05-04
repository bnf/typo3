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

namespace TYPO3\CMS\Core\Http;

use Psr\Container\ContainerInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;
use TYPO3\CMS\Core\Utility\GeneralUtility;

/**
 * MiddlewareDispatcher
 *
 * This class manages and dispatches a PSR-15 middleware stack.
 *
 * @internal
 */
class MiddlewareDispatcher implements RequestHandlerInterface
{
    /**
     * Tip of the middleware call stack
     *
     * @var RequestHandlerInterface
     */
    protected $tip;

    /**
     * @var RequestStack
     */
    protected $requestStack;

    /**
     * @var ContainerInterface
     */
    protected $container;

    public function __construct(
        RequestHandlerInterface $kernel,
        RequestStack $requestStack,
        iterable $middlewares = [],
        ContainerInterface $container = null
    ) {
        $this->requestStack = $requestStack;
        $this->container = $container;
        $this->seedMiddlewareStack($kernel);

        foreach ($middlewares as $middleware) {
            if (is_string($middleware)) {
                $this->lazy($middleware);
            } else {
                $this->add($middleware);
            }
        }
    }

    /**
     * Invoke the middleware stack
     *
     * @param ServerRequestInterface $request
     * @return ResponseInterface
     */
    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        return $this->tip->handle($request);
    }

    /**
     * Seed the middleware stack with the inner request handler
     *
     * @param RequestHandlerInterface $kernel
     */
    protected function seedMiddlewareStack(RequestHandlerInterface $kernel)
    {
        $this->tip = $kernel;
    }

    /**
     * Add a new middleware to the stack
     *
     * Middlewares are organized as a stack. That means middlewares
     * that have been added before will be executed after the newly
     * added one (last in, first out).
     *
     * @param MiddlewareInterface $middleware
     */
    public function add(MiddlewareInterface $middleware)
    {
        $next = $this->tip;
        $this->tip = new class($middleware, $next, $this->requestStack) implements RequestHandlerInterface {
            /**
             * @var MiddlewareInterface
             */
            private $middleware;

            /**
             * @var RequestHandlerInterface
             */
            private $next;

            /**
             * @var RequestStack
             */
            private $requestStack;

            public function __construct(MiddlewareInterface $middleware, RequestHandlerInterface $next, RequestStack $requestStack)
            {
                $this->middleware = $middleware;
                $this->next = $next;
                $this->requestStack = $requestStack;
            }

            public function handle(ServerRequestInterface $request): ResponseInterface
            {
                $oldRequest = $this->requestStack->getCurrentRequest();
                $this->requestStack->push($request);
                $response = $this->middleware->process($request, $this->next);
                $this->requestStack->revertTo($oldRequest);
            }
        };
    }

    /**
     * Add a new middleware by class name
     *
     * Middlewares are organized as a stack. That means middlewares
     * that have been added before will be executed after the newly
     * added one (last in, first out).
     *
     * @param string $middleware
     */
    public function lazy(string $middleware): void
    {
        $next = $this->tip;
        $this->tip = new class($middleware, $next, $this->container) implements RequestHandlerInterface {
            /**
             * @var string
             */
            private $middleware;

            /**
             * @var RequestHandlerInterface
             */
            private $next;

            /**
             * @var RequestStack
             */
            private $requestStack;

            /**
             * @var ContainerInterface|null
             */
            private $container;

            public function __construct(string $middleware, RequestHandlerInterface $next, RequestStack $requestStack, ContainerInterface $container = null)
            {
                $this->middleware = $middleware;
                $this->next = $next;
                $this->requestStack = $requestStack;
                $this->container = $container;
            }

            public function handle(ServerRequestInterface $request): ResponseInterface
            {
                if ($this->container !== null && $this->container->has($this->middleware)) {
                    $middleware = $this->container->get($this->middleware);
                } else {
                    $middleware = GeneralUtility::makeInstance($this->middleware);
                }

                if (!$middleware instanceof MiddlewareInterface) {
                    throw new \InvalidArgumentException(get_class($middleware) . ' does not implement ' . MiddlewareInterface::class, 1516821342);
                }
                $oldRequest = $this->requestStack->getCurrentRequest();
                $this->requestStack->push($request);
                $response = $middleware->process($request, $this->next);
                $this->requestStack->revertTo($oldRequest);
                return $response;
            }
        };
    }
}
