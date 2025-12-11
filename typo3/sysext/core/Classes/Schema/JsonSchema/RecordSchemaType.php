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

use TYPO3\CMS\Core\Domain\Dto\RecordInput;
use TYPO3\CMS\Core\Domain\Dto\RecordPatch;

/**
 * The purpose a record schema is built for.
 *
 * @internal
 */
enum RecordSchemaType: string
{
    /**
     * Records as they are read, including uid, pid and system fields
     */
    case Record = 'Record';

    /**
     * New records to be created, required fields must be given
     */
    case RecordInput = 'RecordInput';

    /**
     * Changes of an existing record, all fields are optional
     */
    case RecordPatch = 'RecordPatch';

    public function getSchemaName(string $tableName): string
    {
        return 'TYPO3.CMS.Core.Domain.Dto.' . $this->value . '_' . $tableName . '_';
    }

    /**
     * @return class-string|null
     */
    public function getDtoClass(): ?string
    {
        return match ($this) {
            self::Record => null,
            self::RecordInput => RecordInput::class,
            self::RecordPatch => RecordPatch::class,
        };
    }

    public function isWritable(): bool
    {
        return $this !== self::Record;
    }
}
