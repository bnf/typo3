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

namespace TYPO3\CMS\Backend\Action\Record;

use TYPO3\CMS\Backend\Dto\Settings\EditableSetting;
use TYPO3\CMS\Core\Attribute\AsAction;
use TYPO3\CMS\Core\Settings\Category;
use TYPO3\CMS\Lowlevel\Localization\Dto\DomainSearchResult;

final readonly class Type2Test
{
    /**
     * @param Category<EditableSetting> $category
     * @return array{
     *   dsr: DomainSearchResult
     * }
     */
    #[AsAction(
        name: 'type/test2',
    )]
    public function perform(
        mixed $foo,
        Category $category,
        DomainSearchResult $dsr,
    ): array {
        return [
            'dsr' => $dsr,
        ];
    }
}
