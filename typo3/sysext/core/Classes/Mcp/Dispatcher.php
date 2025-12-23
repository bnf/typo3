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

namespace TYPO3\CMS\Core\Mcp;

use Symfony\Component\DependencyInjection\Attribute\AutowireLocator;
use Symfony\Component\DependencyInjection\ServiceLocator;

final readonly class Dispatcher
{
    /**
     * @param ServiceLocator<RequestHandlerInterface> $requestHandlers
     * @param ServiceLocator<NotificationHandlerInterface> $notificationHandlers
     */
    public function __construct(
        #[AutowireLocator(
            services: 'typo3.mcp.request_handler',
            defaultIndexMethod: 'getName',
        )]
        private ServiceLocator $requestHandlers,
        #[AutowireLocator(
            services: 'typo3.mcp.notification_handler',
            defaultIndexMethod: 'getName',
        )]
        private ServiceLocator $notificationHandlers,
    ) {}

    public function dispatch(Request|Notification $message): Response|Error|null
    {
        if ($message instanceof Notification) {
            $this->dispatchNotification($message);
            return null;
        }
        return $this->dispatchRequest($message);
    }

    private function dispatchRequest(Request $request): Response|Error
    {
        if (!$this->requestHandlers->has($request->method)) {
            return new Error($request->id, [
                'code' => -32601,
                'message' => 'Request not found: ' . $request->method,
            ]);
        }
        return $this->requestHandlers->get($request->method)->handle($request);
    }

    private function dispatchNotification(Notification $notification): void
    {
        if (!$this->notificationHandlers->has($notification->method)) {
            // @todo log debug
            return;
        }
        $this->notificationHandlers->get($notification->method)->handle($notification);
    }
}
