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

namespace TYPO3\CMS\Backend\Action\Resource;

use TYPO3\CMS\Core\Action\ActionContext;
use TYPO3\CMS\Core\Action\ActionException;
use TYPO3\CMS\Core\Attribute\AsAction;
use TYPO3\CMS\Core\Http\Response;
use TYPO3\CMS\Core\Resource\File;
use TYPO3\CMS\Core\Resource\Folder;
use TYPO3\CMS\Core\Resource\ResourceFactory;
use TYPO3\CMS\Core\Resource\ResourceInterface;
use TYPO3\CMS\Core\Validation\ResultRenderingTrait;

final readonly class GatherResource
{
    use ResultRenderingTrait;

    public function __construct(
        private ResourceFactory $resourceFactory,
    ) {}

    /**
     * @return array{
     *   resource: ?array{
     *     type: string,
     *     identifier: ?string,
     *     name: string,
     *     hasPreview: bool,
     *     uid: ?int,
     *     metaUid: ?int,
     *     createdAt: ?int,
     *     size: ?int
     *   }
     * }
     * @todo inherit access from "media_management" module
     */
    #[AsAction(
        name: 'resource/gather',
        tag: 'resource',
    )]
    public function gatherInformationAction(
        string $identifier,
        ActionContext $context,
    ): array {
        $resource = $this->resourceFactory->retrieveFileOrFolderObject($identifier);
        if ($resource === null) {
            // @todo set HTTP status 404
            throw new ActionException('Resource not found', 1768857976);
        }

        return [
            'resource' => $this->getResourceData($resource),
        ];
    }

    /**
     * Prepare resource data for a JSON response
     *
     * @return ?array{
     *   type: 'file'|'folder',
     *   identifier: ?string,
     *   name: string,
     *   hasPreview: bool,
     *   uid: ?int,
     *   metaUid: ?int,
     *   createdAt: ?int,
     *   size: ?int
     * }
     */
    private function getResourceData(?ResourceInterface $resource): ?array
    {
        if (!$resource) {
            return null;
        }

        return [
            'type' => $resource instanceof File ? 'file' : 'folder',
            'identifier' => $resource instanceof File || $resource instanceof Folder ? $resource->getCombinedIdentifier() : null,
            'name' => $resource->getName(),
            'hasPreview' => $resource instanceof File && ($resource->isImage() || $resource->isMediaFile()),
            'uid' => $resource instanceof File ? $resource->getUid() : null,
            'metaUid' => $resource instanceof File ? $resource->getMetaData()->offsetGet('uid') : null,
            'createdAt' => $resource instanceof File ? $resource->getCreationTime() : null,
            'size' => $resource instanceof File ? $resource->getSize() : null,
        ];
    }
}
