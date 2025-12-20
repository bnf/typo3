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
use TYPO3\CMS\Core\Action\ActionType;
use TYPO3\CMS\Core\Attribute\AsAction;
use TYPO3\CMS\Core\Resource\Exception\InsufficientFileAccessPermissionsException;
use TYPO3\CMS\Core\Resource\Exception\ResourceDoesNotExistException;
use TYPO3\CMS\Core\Resource\File;
use TYPO3\CMS\Core\Resource\Folder;
use TYPO3\CMS\Core\Resource\ResourceFactory;
use TYPO3\CMS\Core\Resource\ResourceInterface;
use TYPO3\CMS\Core\Validation\ResultException;
use TYPO3\CMS\Core\Validation\ResultRenderingTrait;

final readonly class RenameResource
{
    use ResultRenderingTrait;

    public function __construct(
        private ResourceFactory $resourceFactory,
    ) {}

    /**
     * @return array{
     *   message: string,
     *   origin: ?array{
     *     type: string,
     *     identifier: ?string,
     *     name: string,
     *     hasPreview: bool,
     *     uid: ?int,
     *     metaUid: ?int,
     *     createdAt: ?int,
     *     size: ?int
     *   },
     *   resource?: ?array{
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
        name: 'resource/rename',
        tag: 'resource',
        type: ActionType::create,
    )]
    public function perform(
        /* @todo resource identifiers contain slashes, that means we can not use this parameter as slug segment :\ */
        string $resourceIdentifier,
        string $resourceName,
        ActionContext $context,
    ): array {
        $origin = null;

        if ($resourceIdentifier) {
            try {
                $origin = $this->resourceFactory->retrieveFileOrFolderObject($resourceIdentifier);
            } catch (ResourceDoesNotExistException $e) {
                throw new ActionException($e->getMessage(), 1768337410, $e);
            }
        }

        try {
            if (!$origin instanceof File && !$origin instanceof Folder) {
                throw new \InvalidArgumentException('Resource must be a file or a folder', 1676979120);
            }
            if ($origin->getStorage()->isFallbackStorage()) {
                throw new InsufficientFileAccessPermissionsException('You are not allowed to access files outside your storages', 1676299579);
            }
            if (!$origin->checkActionPermission('rename')) {
                throw new InsufficientFileAccessPermissionsException('You are not allowed to rename the resource', 1676979130);
            }
            if (!$resourceName || trim((string)$resourceName) === '') {
                throw new \InvalidArgumentException('The resource name cannot be empty', 1676978732);
            }
            $oldName = $origin->getName();
            if ($oldName === $resourceName) {
                $message = sprintf($context->translator->label('LLL:EXT:backend/Resources/Private/Language/locallang_resource.xlf:ajax.error.message.resourceNameNotDifferent'), $oldName);
                return [
                    'message' => $message,
                    'origin' => $this->getResourceData($origin),
                ];
            }

            $resource = $origin->rename($resourceName);
            if ($resource->getName() === $oldName) {
                $message = sprintf($context->translator->label('LLL:EXT:backend/Resources/Private/Language/locallang_resource.xlf:ajax.error.message.resourceNotRenamed'), $oldName);
                throw new ActionException($message, 1768337408);
            }
        } catch (ResultException $exception) {
            // Possible Exception thrown within the `->rename(...)` chain via ResourceConsistencyService
            throw new ActionException($this->renderResultException($exception, $context->translator), 1768337411, $exception);
        } catch (\Exception $exception) {
            $message = match ($exception->getCode()) {
                1676979120 => $context->translator->label('LLL:EXT:backend/Resources/Private/Language/locallang_resource.xlf:ajax.error.message.resourceNotFileOrFolder'),
                1676299579 => $context->translator->label('LLL:EXT:backend/Resources/Private/Language/locallang_resource.xlf:ajax.error.message.resourceOutsideOfStorages'),
                1676979130 => $context->translator->label('LLL:EXT:backend/Resources/Private/Language/locallang_resource.xlf:ajax.error.message.resourceNoPermissionRename'),
                1676978732 => $context->translator->label('LLL:EXT:backend/Resources/Private/Language/locallang_resource.xlf:ajax.error.message.resourceNameCannotBeEmpty'),
                default => $exception->getMessage(),
            };
            throw new ActionException($message, 1768337412, $exception);
        }

        return [
            'message' => sprintf(
                $context->translator->label('LLL:EXT:backend/Resources/Private/Language/locallang_resource.xlf:ajax.success.message.renamed'),
                $oldName,
                $resource->getName()
            ),
            'origin' => $this->getResourceData($origin),
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
