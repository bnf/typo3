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

namespace TYPO3\CMS\Backend\Dto\Tree;

use TYPO3\CMS\Core\Attribute\Serialization\IntersectWithParent;

/**
 * @internal
 */
final readonly class FileTreeItem implements \JsonSerializable
{
    public string $type;

    public function __construct(
        #[IntersectWithParent]
        public TreeItem $item,
        public string $pathIdentifier,
        public int $storage,
        public string $resourceType,
    ) {
        $this->type = 'FileTreeItem';
    }

    public function jsonSerialize(): array
    {
        return [
            'type' => $this->type,
            ...$this->item->jsonSerialize(),
            'pathIdentifier' => $this->pathIdentifier,
            'storage' => $this->storage,
            'resourceType' => $this->resourceType,
        ];
    }
}
