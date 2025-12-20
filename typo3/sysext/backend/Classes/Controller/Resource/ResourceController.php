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

namespace TYPO3\CMS\Backend\Controller\Resource;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use TYPO3\CMS\Backend\Attribute\AsController;
use TYPO3\CMS\Backend\Backend\ThumbnailSize;
use TYPO3\CMS\Core\Http\RedirectResponse;
use TYPO3\CMS\Core\Http\Response;
use TYPO3\CMS\Core\Resource\File;
use TYPO3\CMS\Core\Resource\ProcessedFile;
use TYPO3\CMS\Core\Resource\ResourceFactory;
use TYPO3\CMS\Core\Utility\GeneralUtility;

/**
 * @internal
 */
#[AsController]
final readonly class ResourceController
{
    public function __construct(
        private ResourceFactory $resourceFactory,
    ) {}

    public function requestThumbnailAction(ServerRequestInterface $request): ResponseInterface
    {
        $identifier = $request->getQueryParams()['identifier'] ?? null;
        $thumbnailSizeIdentifier = $request->getQueryParams()['size'] ?? 'default';
        $keepAspectRatio = (bool)($request->getQueryParams()['keepAspectRatio'] ?? false);
        $resource = null;

        if ($identifier) {
            $resource = $this->resourceFactory->retrieveFileOrFolderObject($identifier);
        }
        if ($resource === null || !($resource instanceof File && ($resource->isImage() || $resource->isMediaFile()))) {
            return new Response(null, 404);
        }
        if (!$resource->checkActionPermission('read')) {
            return new Response(null, 403);
        }

        $thumbnailSize = ThumbnailSize::tryFrom($thumbnailSizeIdentifier) ?? ThumbnailSize::DEFAULT;
        [$width, $height] = $keepAspectRatio ? $thumbnailSize->getDimensions() : $thumbnailSize->getCroppedDimensions();
        $thumbnail = $resource
            ->process(ProcessedFile::CONTEXT_IMAGECROPSCALEMASK, ['width' => $width, 'height' => $height]);

        return new RedirectResponse(
            GeneralUtility::locationHeaderUrl($thumbnail->getPublicUrl() ?? '', $request)
        );
    }
}
