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

use Psr\Http\Message\ServerRequestInterface;
use TYPO3\CMS\Core\Authentication\AbstractUserAuthentication;
use TYPO3\CMS\Core\Context\Context;
use TYPO3\CMS\Core\Localization\TranslatorInterface;
use TYPO3\CMS\Core\Scope\ScopeInterface;

final readonly class ActionContext
{
    /**
     * @param array<string, ScopeInterface> $scopes
     */
    public function __construct(
        public Context $context,
        public AbstractUserAuthentication $principal,
        public TranslatorInterface $translator,
        public ?ServerRequestInterface $request,
        public array $scopes,
    ) {}
}
