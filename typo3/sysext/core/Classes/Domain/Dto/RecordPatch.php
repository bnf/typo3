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

namespace TYPO3\CMS\Core\Domain\Dto;

use TYPO3\CMS\Core\Attribute\Serialization\DynamicSerializationSchema;

/**
 * Changes of an existing record, as validated against
 * the `TYPO3.CMS.Core.Domain.Dto.RecordPatch_<table>_` schema.
 * Only the given fields are changed.
 *
 * @internal not part of TYPO3 Core API yet.
 */
#[DynamicSerializationSchema]
final readonly class RecordPatch
{
    public string $schema;

    /**
     * @var array<string, mixed>
     */
    public array $fields;

    /**
     * Named arguments are used by the hydrator: `_schema` is the
     * discriminator, all other properties are collected as fields.
     */
    public function __construct(string $_schema, mixed ...$fields)
    {
        $this->schema = $_schema;
        $this->fields = $fields;
    }
}
