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
use TYPO3\CMS\Core\Country\Country;
use TYPO3\CMS\Core\Domain\Record\LanguageInfo;
use TYPO3\CMS\Core\Domain\Record\VersionInfo;
use TYPO3\CMS\Core\Resource\Collection\LazyFileReferenceCollection;
use TYPO3\CMS\Core\Resource\Collection\LazyFolderCollection;
use TYPO3\CMS\Core\Resource\FileInterface;
use TYPO3\CMS\Core\Resource\FolderInterface;

/**
 * @internal not part of TYPO3 Core API yet.
 */
final readonly class RecordSerializer
{
    public function serialize(
        RecordInterface $record
    ): null|\stdClass {
        $result = $this->doSerialize($record);
        if (is_object($result) || $result === null) {
            return $result;
        }
        throw new \LogicException('RecordSerializer::doSerialize returned a non object for a Record', 1765453540);
    }

    private function doSerialize(
        RecordInterface|
        LazyFileReferenceCollection|
        LazyFolderCollection|
        LazyRecordCollection|
        FileInterface|
        FolderInterface|
        \JsonSerializable|
        \DateTimeInterface|
        LanguageInfo|
        VersionInfo|
        Country|
        FlexFormFieldValues|
        array|string|float|int|bool|null $value,
        int $depth = 10,
    ): \stdClass|array|string|float|int|bool|null {
        if ($depth === 0) {
            return null;
        }
        --$depth;
        return match (true) {
            $value instanceof RecordInterface => $this->mapRecord($value, $depth),
            $value instanceof LazyRecordCollection => array_map(
                fn(mixed $value): mixed => $this->doSerialize($value, $depth),
                iterator_to_array($value),
            ),
            $value instanceof LazyFileReferenceCollection => array_map(
                fn(mixed $value): mixed => $this->doSerialize($value, $depth),
                iterator_to_array($value),
            ),
            $value instanceof LazyFolderCollection => array_map(
                fn(mixed $value): mixed => $this->doSerialize($value, $depth),
                iterator_to_array($value),
            ),
            $value instanceof FileInterface => (object)$value->toArray(),
            $value instanceof FolderInterface => $value->getIdentifier(),
            $value instanceof LanguageInfo => [
                'languageId' => $value->getLanguageId(),
                'translationParent' => $value->getTranslationParent(),
                'translationSource' => $value->getTranslationSource(),
            ],
            $value instanceof VersionInfo => (object)[ /* @todo  */ ],
            $value instanceof Country => (string)$value,
            $value instanceof FlexFormFieldValues => (object)[ /* @todo */ ],
            $value instanceof \JsonSerializable => $value->jsonSerialize(),
            // @todo
            $value instanceof \DateTimeInterface => $value->format(\DateTimeInterface::ATOM),
            is_array($value) => array_map(
                fn(mixed $value): mixed => $this->doSerialize($value, $depth),
                $value,
            ),
            default => $value,
        };
    }

    private function mapRecord(RecordInterface $value, int $depth): \stdClass
    {
        $data = array_map(
            fn(mixed $value): mixed => $this->doSerialize($value, $depth),
            match (true) {
                $value instanceof Page => $value->toArray(true, false),
                $value instanceof Record => $value->toArray(true),
                default => $value->toArray(),
            },
        );
        return (object)[
            '_schema' => $value->getMainType(),
            ...$data,
        ];
    }
}
