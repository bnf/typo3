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

namespace TYPO3\CMS\Core\Attribute;

use TYPO3\CMS\Core\Action\ParameterSource;

/**
 * Describes a parameter of an action method.
 */
#[\Attribute(\Attribute::TARGET_PARAMETER)]
final readonly class ActionParameter
{
    /**
     * @param ParameterSource|null $source Where the parameter is passed in an HTTP request.
     *        Defaults to the route for route placeholders, otherwise to the JSON request body
     *        for methods with a body (POST, PATCH, PUT) and to the query for all others.
     *        Query parameters fit arguments that describe the context of a request instead
     *        of the submitted data, e.g. a workspace.
     */
    public function __construct(
        public ?ParameterSource $source = null,
    ) {}
}
