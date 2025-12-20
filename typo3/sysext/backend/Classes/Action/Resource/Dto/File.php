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

namespace TYPO3\CMS\Backend\Action\Resource\Dto;

/**
 * @internal
 */
final readonly class File
{
    public string $_schema;

    public function __construct(
        public int $uid,
        public string $identifier,
        public string $folder,
        public string $name,
        public string $extension,
        public string $mimeType,
        public string $iconIdentifier,
        public int $size,
        public ?string $createdAt,
        public ?string $modifiedAt,
        public ?string $url,
        public bool $hasPreview,
        public ?RecordReference $metadata,
        public FilePermissions $permissions,
    ) {
        $this->_schema = 'sys_file';
    }
}
