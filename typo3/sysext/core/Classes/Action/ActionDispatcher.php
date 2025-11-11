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

use Symfony\Component\DependencyInjection\Attribute\AutowireLocator;
use Symfony\Component\DependencyInjection\ServiceLocator;

/**
 * @internal
 */
final readonly class ActionDispatcher
{
    public function __construct(
        #[AutowireLocator(
            services: 'typo3.action_handler',
            defaultIndexMethod: 'getName',
        )]
        private readonly ServiceLocator $actionsHandlers
    ) {}

    public function dispatch(Action $action): ActionResult
    {
        return $this->actionsHandlers->get($action->handler)->execute($action);
    }

}
