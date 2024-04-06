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

use Symfony\Component\DependencyInjection\Attribute\Autowire;

#[\Attribute(\Attribute::TARGET_PARAMETER)]
class Setting extends Autowire
{
    public function __construct(
        public string $key,
    ) {
        parent::__construct(
            // @todo implement without expression language
            expression: sprintf(
                'service("settings").get("%s")',
                addslashes($key)
            )
        );
    }
}
