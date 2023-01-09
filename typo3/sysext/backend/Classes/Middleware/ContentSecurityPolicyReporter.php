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

namespace TYPO3\CMS\Backend\Middleware;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\RequestHandlerInterface;
use TYPO3\CMS\Core\Http\NullResponse;
use TYPO3\CMS\Core\Middleware\AbstractContentSecurityPolicyReporter;

/**
 * @internal
 */
class ContentSecurityPolicyReporter extends AbstractContentSecurityPolicyReporter
{
    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        if ($this->isCspReport($request)) {
            // @todo check/store headers `origin` + `referer`
            $this->persistCspReport('backend', (string)$request->getBody());
            return new NullResponse();
        }
        return $handler->handle($request);
    }
}
