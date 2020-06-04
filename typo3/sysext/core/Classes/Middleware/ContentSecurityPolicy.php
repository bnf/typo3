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

namespace TYPO3\CMS\Core\Middleware;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

class ContentSecurityPolicy implements MiddlewareInterface
{
    /**
     * @var array
     */
    private $hashes = [];

    public function addInlineJavascriptHash(?string $hash, string $content)
    {
        if ($hash === null) {
            $hash = $this->calculateHashForInlineJavascript($content);
            if ($hash === null) {
                return;
            }
        }
        $this->hashes[$hash] = $content;
    }

    private function calculateHashForInlineJavascript(string $inlineScriptTag): ?string
    {
        $script = $inlineScriptTag;
        //$script = preg_replace('#</script>$#', '', preg_replace('#^<script[^>]*>#', '', $inlineScriptTag));
        if ($script === '') {
            return null;
        }
        return 'sha256-' . base64_encode(hash('sha256', $script, true));
    }

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {

        $response = $handler->handle($request);

        $value = "default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; script-src 'self' " . implode(array_map(function(?string $hash) {
            return $hash ? " '" . $hash . "'" : '';
        }, array_keys($this->hashes)));

        //\TYPO3\CMS\Extbase\Utility\DebuggerUtility::var_dump($this->hashes);
        //exit;

        return $response->withHeader('Content-Security-Policy', $value);
    }
}
