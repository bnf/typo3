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

namespace TYPO3\CMS\Core\Action;

use Psr\Http\Message\ResponseFactoryInterface;
use Psr\Http\Message\StreamFactoryInterface;
use Psr\Log\LoggerInterface;
use TYPO3\CMS\Core\Context\Context;

/**
 * @internal
 */
final readonly class RequestHandlerFactory
{
    public function __construct(
        private ActionRegistry $actionRegistry,
        private ActionInvoker $actionInvoker,
        private ResponseFactoryInterface $responseFactory,
        private StreamFactoryInterface $streamFactory,
        private Context $context,
        private LoggerInterface $logger,
    ) {}

    public function createRequestHandler(
        string $actionName,
    ): RequestHandler {
        if (!$this->actionRegistry->hasAction($actionName)) {
            throw new \RuntimeException('Action "' . $actionName . '" does not exist.', 1772299654);
        }
        $action = $this->actionRegistry->getAction($actionName);
        return new RequestHandler(
            $action,
            $this->actionRegistry,
            $this->actionInvoker,
            $this->responseFactory,
            $this->streamFactory,
            $this->context,
            $this->logger,
        );
    }
}
