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

final readonly class Initialize implements RequestHandlerInterface
{
    public static function getName(): string
    {
        return 'initialize';
    }

    public function handle(Request $request): Response
    {
        return new Response($request->id, [
            'protocolVersion' => '2025-06-18',
            'capabilities' => [
                'tools' => (object)[],
            ],
            'serverInfo' => [
                'name' => 'TYPO3 CMS',
                // @todo decide when to expose this information
                'version' => '0.0.0',
            ],
            'instructions' => 'Optional instructions for the client',
        ]);
    }
}
