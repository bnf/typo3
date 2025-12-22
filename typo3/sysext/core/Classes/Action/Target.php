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

/**
 * Channel through which an action is offered
 */
enum Target: string
{
    /**
     * Backend user interface, requests are authenticated by the session of the backend user
     */
    case backend = 'backend';

    /**
     * HTTP API for external applications, requests are authenticated by access tokens
     */
    case http = 'http';

    /**
     * Tools for language models, offered by MCP servers and passed to requests to AI APIs
     */
    case ai = 'ai';
}
