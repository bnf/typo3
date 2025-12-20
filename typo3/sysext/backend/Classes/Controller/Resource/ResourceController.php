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
use TYPO3\CMS\Core\Action\Action;
use TYPO3\CMS\Core\Action\ActionDispatcher;
use TYPO3\CMS\Core\Authentication\BackendUserAuthentication;
use TYPO3\CMS\Core\Http\JsonResponse;
use TYPO3\CMS\Core\Http\RedirectResponse;
use TYPO3\CMS\Core\Http\Response;
use TYPO3\CMS\Core\Localization\LanguageService;
use TYPO3\CMS\Core\Messaging\FlashMessage;
use TYPO3\CMS\Core\Messaging\FlashMessageQueue;
use TYPO3\CMS\Core\Messaging\FlashMessageService;
use TYPO3\CMS\Core\Resource\Enum\DuplicationBehavior;
use TYPO3\CMS\Core\Resource\File;
use TYPO3\CMS\Core\Resource\Folder;
use TYPO3\CMS\Core\Resource\ProcessedFile;
use TYPO3\CMS\Core\Resource\ResourceFactory;
use TYPO3\CMS\Core\Resource\ResourceInterface;
use TYPO3\CMS\Core\SysLog\Action\File as SystemLogFileAction;
use TYPO3\CMS\Core\SysLog\Error as SystemLogErrorClassification;
use TYPO3\CMS\Core\SysLog\Type as SystemLogType;
use TYPO3\CMS\Core\Utility\File\ExtendedFileUtility;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Core\Validation\ResultRenderingTrait;

/**
 * @internal
 */
#[AsController]
final readonly class ResourceController
{
    use ResultRenderingTrait;

    public function __construct(
        private ResourceFactory $resourceFactory,
        private ExtendedFileUtility $fileProcessor,
        private FlashMessageService $flashMessageService,
        private ActionDispatcher $actionDispatcher,
    ) {}

    public function gatherInformationAction(ServerRequestInterface $request): ResponseInterface
    {
        $identifier = $request->getQueryParams()['identifier'] ?? null;
        $resource = $this->resourceFactory->retrieveFileOrFolderObject($identifier);
        if ($resource === null) {
            return new JsonResponse(null, 404);
        }

        return new JsonResponse($this->getResourceResponseData($resource));
    }

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
            GeneralUtility::locationHeaderUrl($thumbnail->getPublicUrl() ?? '')
        );
    }

    public function renameResourceAction(ServerRequestInterface $request): ResponseInterface
    {
        $result = $this->actionDispatcher->dispatch(
            new Action(
                handler: 'resource/rename',
                parameters: [
                    'identifier' => $request->getParsedBody()['identifier'] ?? null,
                    'resourceName' => $request->getParsedBody()['resourceName'] ?? null,
                ],
                scope: $this->getBackendUser(),
            )
        );

        return new JsonResponse($this->getResponseData(
            $result->error === null,
            $result->parameters['message'] ?? '',
            $result->parameters['origin'] ?? null,
            $result->parameters['resource'] ?? null,
        ));
    }

    public function replaceResourceAction(ServerRequestInterface $request): ResponseInterface
    {
        $uploadedFiles = $request->getUploadedFiles();
        if ($uploadedFiles === []) {
            return new JsonResponse($this->getResponseData(
                false,
                $this->getLanguageService()->sL('LLL:EXT:backend/Resources/Private/Language/locallang_resource.xlf:ajax.error.message.resourceNotAvailableToUpload'),
            ));
        }

        $uid = $request->getParsedBody()['uid'];
        $keepFilename = (bool)($request->getParsedBody()['keepFilename'] ?? false);
        $origin = $this->resourceFactory->retrieveFileOrFolderObject($uid);
        if ($origin === null) {
            return new JsonResponse($this->getResponseData(
                false,
                $this->getLanguageService()->sL('LLL:EXT:backend/Resources/Private/Language/locallang_resource.xlf:ajax.error.message.resourceNotFound'),
            ));
        }

        $this->fileProcessor->setActionPermissions();
        $this->fileProcessor->setExistingFilesConflictMode(DuplicationBehavior::REPLACE);
        $this->fileProcessor->start([
            'replace' => [
                1 => [
                    'data' => 1,
                    'uid' => $uid,
                    'keepFilename' => $keepFilename,
                ],
            ],
        ], $uploadedFiles);
        $result = $this->fileProcessor->processData();
        $flashMessageQueue = $this->flashMessageService->getMessageQueueByIdentifier();
        $messages = implode("\n", array_map(static fn(FlashMessage $message) => $message->getMessage(), $flashMessageQueue->getAllMessagesAndFlush()));

        /** @var File|null $fileReplacement */
        $fileReplacement = $result['replace'][0][0] ?? null;
        if ($fileReplacement === null) {
            return new JsonResponse($this->getResponseData(
                false,
                $messages,
                $origin
            ));
        }

        return new JsonResponse($this->getResponseData(
            true,
            $messages,
            $origin,
            $fileReplacement
        ));
    }

    /**
     * Prepare response data for a JSON response
     */
    private function getResponseData(bool $success, string $message, ?ResourceInterface $origin = null, ?ResourceInterface $resource = null): array
    {
        $flashMessageQueue = new FlashMessageQueue('backend');
        $flashMessageQueue->enqueue(
            new FlashMessage(
                $message,
                $this->getLanguageService()->sL('LLL:EXT:backend/Resources/Private/Language/locallang_resource.xlf:ajax.' . ($success ? 'success' : 'error'))
            )
        );
        // Next to the flash message, also log the action to be consistent with the use in ExtendedFileUtiltiy
        $this->getBackendUser()->writelog(SystemLogType::FILE, SystemLogFileAction::RENAME, $success ? SystemLogErrorClassification::MESSAGE : SystemLogErrorClassification::USER_ERROR, null, $message, []);
        return [
            'success' => $success,
            'status' => $flashMessageQueue,
            'origin' => $this->getResourceResponseData($origin),
            'resource' => $this->getResourceResponseData($resource),
        ];
    }

    /**
     * Prepare resource data for a JSON response
     */
    private function getResourceResponseData(?ResourceInterface $resource): ?array
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

    private function getBackendUser(): BackendUserAuthentication
    {
        return $GLOBALS['BE_USER'];
    }

    private function getLanguageService(): LanguageService
    {
        return $GLOBALS['LANG'];
    }
}
