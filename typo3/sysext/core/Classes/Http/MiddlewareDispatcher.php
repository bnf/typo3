<?php
namespace TYPO3\CMS\Core\Http;

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
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;
use TYPO3\CMS\Core\Utility\GeneralUtility;

/**
 * MiddlewareDispatcher
 *
 * This class manages and dispatches a PSR-15 middleware stack.
 */
class MiddlewareDispatcher implements RequestHandlerInterface
{
    /**
     * Tip of the middleware call stack
     *
     * @var callable
     */
    protected $tip = null;

    /**
     * @param RequestHandlerInterface $kernel
     * @param array $middlewares
     */
    public function __construct(
        RequestHandlerInterface $kernel,
        array $middlewares = []
    ) {
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
        return ($this->tip)($request);
    }

    /**
     * See the middleware stack with the inner callable
     *
     * @param RequestHandlerInterface $kernel
     */
    protected function seedMiddlewareStack(RequestHandlerInterface $kernel)
    {
        $this->tip = function (ServerRequestInterface $request) use ($kernel): ResponseInterface {
            return $kernel->handle($request);
        };
    }

    /**
     * Add a new middleware to the stack
     *
     * Middlewares are added as outer middleware. That means
     * every middleware that has been added before will be executed
     * after the newly added one.
     *
     * @param ServerRequestInterface $request
     * @return ResponseInterface
     */
    public function add(MiddlewareInterface $middleware)
    {
        $next = $this->tip;
        $this->tip = new class($middleware, $next) implements RequestHandlerInterface {
            private $middleware;
            private $next;

            public function __construct($middleware, callable $next)
            {
                $this->middleware = $middleware;
                $this->next = $next;
            }

            public function __invoke(ServerRequestInterface $request): ResponseInterface
            {
                /* By passing `$this` as RequestHandler the middleware will call our
                 * handle() methd to dispatch the `$next` middleware */
                return $this->middleware->process($request, $this);
            }

            public function handle(ServerRequestInterface $request): ResponseInterface
            {
                return ($this->next)($request);
            }
        };
    }


    /**
     * Add a new middleware by class name
     *
     * @param ServerRequestInterface $request
     * @return ResponseInterface
     */
    public function lazy(string $middleware)
    {
        $this->add(new class($middleware) implements MiddlewareInterface {
            private $middleware;

            public function __construct(string $middleware)
            {
                $this->middleware = $middleware;
            }

            public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
            {
                $middleware = GeneralUtility::makeInstance($this->middleware);

                if (!$middleware instanceof MiddlewareInterface) {
                    throw new \Exception(get_class($middleware) . ' does not implement ' . MiddlewareInterface::class, 1516821342);
                }

                return $middleware->process($request, $handler);
            }
        });
    }
}
