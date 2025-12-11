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

namespace TYPO3\CMS\Core\Domain;

use TYPO3\CMS\Core\Collection\LazyRecordCollection;
use TYPO3\CMS\Core\Domain\Record\LanguageInfo;
use TYPO3\CMS\Core\Domain\Record\VersionInfo;
use TYPO3\CMS\Core\Resource\Collection\LazyFileReferenceCollection;
use TYPO3\CMS\Core\Resource\FileInterface;

/**
 * @internal not part of TYPO3 Core API yet.
 */
final readonly class RecordSerializer
{
    public function serialize(
        RecordInterface $record
    ): ?array {
        $result = $this->doSerialize($record);
        if (is_array($result) || $result === null) {
            return $result;
        }
        throw new \LogicException('RecordSerializer::doSerialize returned a non-array for a Record', 1765453540);
    }

    private function doSerialize(
        RecordInterface|
        LazyFileReferenceCollection|
        LazyRecordCollection|
        FileInterface|
        \JsonSerializable|
        \DateTimeInterface|
        LanguageInfo|
        VersionInfo|
        array|string|float|int|bool|null $value
    ): array|string|float|int|bool|null {
        return match (true) {
            $value instanceof RecordInterface => array_map(
                fn(mixed $value): mixed => $this->doSerialize($value),
                $value->toArray(true),
            ),
            $value instanceof LazyRecordCollection => array_map(
                fn(mixed $value): mixed => $this->doSerialize($value),
                iterator_to_array($value),
            ),
            $value instanceof LazyFileReferenceCollection => array_map(
                fn(mixed $value): mixed => $this->doSerialize($value),
                iterator_to_array($value),
            ),
            $value instanceof FileInterface => $value->toArray(),
            $value instanceof LanguageInfo => [
                'languageId' => $value->getLanguageId(),
                'translationParent' => $value->getTranslationParent(),
                'translationSource' => $value->getTranslationSource(),
            ],
            $value instanceof VersionInfo => [ /* @todo  */ ],
            $value instanceof \JsonSerializable => $value->jsonSerialize(),
            // @todo
            $value instanceof \DateTimeInterface => $value->format(\DateTimeInterface::ATOM),
            is_array($value) => array_map(
                fn(mixed $value): mixed => $this->doSerialize($value),
                $value,
            ),
            default => $value,
        };
    }
}
