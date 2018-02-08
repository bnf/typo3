<?php
declare(strict_types = 1);
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

use TYPO3\CMS\Core\Http\AbstractApplication;

/**
 * Entry point for the TYPO3 Frontend
 */
class Application extends AbstractApplication
{
    /**
     * @var string
     */
    protected $requestHandler = RequestHandler::class;

    /**
     * @var string
     */
    protected $middlewareStack = 'frontend';
}
