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
use TYPO3\CMS\Core\Domain\RecordInterface;
use TYPO3\CMS\Core\Domain\RecordSerializer;

/**
 * @template T of string
 */
#[DynamicSerializationSchema]
final readonly class Record implements \JsonSerializable
{
    /**
     * @param RecordInterface<T> $record
     */
    public function __construct(
        private RecordInterface $record,
        private RecordSerializer $serializer,
    ) {}

    public function jsonSerialize(): ?array
    {
        return $this->serializer->serialize($this->record);
    }
}
