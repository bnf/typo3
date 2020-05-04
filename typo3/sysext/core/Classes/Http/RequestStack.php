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

use Psr\Http\Message\ServerRequestInterface;

class RequestStack
{

    /**
     * @var \SplStack
     */
    private $stack;

    public function __construct()
    {
        $this->stack = new \SplStack();
    }

    /**
     * @return RequestInterface
     */
    public function getCurrentRequest(): ?ServerRequestInterface
    {
        $request = $this->stack->top();
        if ($request instanceof RequestInterface) {
            return $request;
        }

        return null;
    }

    public function push(ServerRequestInterface $request): void
    {
        if ($request === $this->getCurrentRequest()) {
            return;
        }

        $this->stack->push($request);

        /* Backwards compatibility */
        $this->resetGlobalsToCurrentRequest($request);
    }

    public function revertTo(ServerRequestInterface $request): void
    {
        $reset = false;
        foreach ($this->stack as $deletionCandidate) {
            if ($deletionCandidate === $request) {
                break;
            }
            $this->stack->pop();
            $reset = true;
        }
        if ($reset) {
            $this->resetGlobalsToCurrentRequest($request);
        }
    }

    /**
     * Sets the global GET and POST to the values, so if people access $_GET and $_POST
     * Within hooks starting NOW (e.g. cObject), they get the "enriched" data from query params.
     *
     * This needs to be run after the request object has been enriched with modified GET/POST variables.
     *
     * @param ServerRequestInterface $request
     * @internal this safety net will be removed in TYPO3 v10.0.
     */
    protected function resetGlobalsToCurrentRequest(?ServerRequestInterface $request)
    {
        if ($request && $request->getQueryParams() !== $_GET) {
            $queryParams = $request->getQueryParams();
            $_GET = $queryParams;
            $GLOBALS['HTTP_GET_VARS'] = $_GET;
        }
        if ($request && $request->getMethod() === 'POST') {
            $parsedBody = $request->getParsedBody();
            if (is_array($parsedBody) && $parsedBody !== $_POST) {
                $_POST = $parsedBody;
                $GLOBALS['HTTP_POST_VARS'] = $_POST;
            }
        }
        $GLOBALS['TYPO3_REQUEST'] = $request;
    }
}
