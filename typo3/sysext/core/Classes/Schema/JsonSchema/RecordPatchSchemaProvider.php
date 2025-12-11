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

namespace TYPO3\CMS\Core\Schema\JsonSchema;

use Symfony\Component\DependencyInjection\Attribute\AsTaggedItem;

/**
 * Provides the schemas for changing records (`RecordPatch`), one per table,
 * discriminated by the `_schema` property.
 *
 * @internal
 */
#[AsTaggedItem(index: 'TYPO3.CMS.Core.Domain.Dto.RecordPatch')]
final readonly class RecordPatchSchemaProvider extends AbstractWritableRecordSchemaProvider
{
    protected function getType(): RecordSchemaType
    {
        return RecordSchemaType::RecordPatch;
    }
}
