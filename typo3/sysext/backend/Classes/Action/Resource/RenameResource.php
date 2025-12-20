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

use TYPO3\CMS\Core\Action\Action;
use TYPO3\CMS\Core\Action\ActionInterface;
use TYPO3\CMS\Core\Action\ActionResult;
use TYPO3\CMS\Core\Localization\LanguageService;
use TYPO3\CMS\Core\Resource\Exception\InsufficientFileAccessPermissionsException;
use TYPO3\CMS\Core\Resource\Exception\ResourceDoesNotExistException;
use TYPO3\CMS\Core\Resource\File;
use TYPO3\CMS\Core\Resource\Folder;
use TYPO3\CMS\Core\Resource\ResourceFactory;
use TYPO3\CMS\Core\Resource\ResourceInterface;
use TYPO3\CMS\Core\Validation\ResultException;
use TYPO3\CMS\Core\Validation\ResultRenderingTrait;

final readonly class RenameResource implements ActionInterface
{
    use ResultRenderingTrait;

    public function __construct(
        private ResourceFactory $resourceFactory,
    ) {}

    public static function getName(): string
    {
        return 'resource/rename';
    }

    public function execute(
        Action $action,
    ): ActionResult {
        return $this->perform(
            $action->parameters['identifier'] ?? null,
            $action->parameters['resourceName'] ?? null,
        );
    }

    public function perform(
        ?string $identifier,
        ?string $resourceName,
    ): ActionResult {
        $origin = null;

        if ($identifier) {
            try {
                $origin = $this->resourceFactory->retrieveFileOrFolderObject($identifier);
            } catch (ResourceDoesNotExistException $e) {
                return $this->getResult(false, $e->getMessage());
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
                $message = sprintf($this->getLanguageService()->sL('LLL:EXT:backend/Resources/Private/Language/locallang_resource.xlf:ajax.error.message.resourceNameNotDifferent'), $oldName);
                return $this->getResult(true, $message, $origin);
            }

            $resource = $origin->rename($resourceName);
            if ($resource->getName() === $oldName) {
                $message = sprintf($this->getLanguageService()->sL('LLL:EXT:backend/Resources/Private/Language/locallang_resource.xlf:ajax.error.message.resourceNotRenamed'), $oldName);
                return $this->getResult(false, $message, $origin);
            }
        } catch (ResultException $exception) {
            // Possible Exception thrown within the `->rename(...)` chain via ResourceConsistencyService
            return $this->getResult(false, $this->renderResultException($exception, $this->getLanguageService()));
        } catch (\Exception $exception) {
            $message = match ($exception->getCode()) {
                1676979120 => $this->getLanguageService()->sL('LLL:EXT:backend/Resources/Private/Language/locallang_resource.xlf:ajax.error.message.resourceNotFileOrFolder'),
                1676299579 => $this->getLanguageService()->sL('LLL:EXT:backend/Resources/Private/Language/locallang_resource.xlf:ajax.error.message.resourceOutsideOfStorages'),
                1676979130 => $this->getLanguageService()->sL('LLL:EXT:backend/Resources/Private/Language/locallang_resource.xlf:ajax.error.message.resourceNoPermissionRename'),
                1676978732 => $this->getLanguageService()->sL('LLL:EXT:backend/Resources/Private/Language/locallang_resource.xlf:ajax.error.message.resourceNameCannotBeEmpty'),
                default => $exception->getMessage(),
            };
            return $this->getResult(false, $message);
        }

        return $this->getResult(
            true,
            sprintf(
                $this->getLanguageService()->sL('LLL:EXT:backend/Resources/Private/Language/locallang_resource.xlf:ajax.success.message.renamed'),
                $oldName,
                $resource->getName()
            ),
            $origin,
            $resource,
        );
    }

    private function getResult(bool $success, string $message, ?ResourceInterface $origin = null, ?ResourceInterface $resource = null): ActionResult
    {
        return new ActionResult(
            [
                'message' => $message,
                'origin' => $origin,
                'resource' => $resource,
            ],
            error: $success ? null : $this->getLanguageService()->sL('LLL:EXT:backend/Resources/Private/Language/locallang_resource.xlf:ajax.error'),
        );
    }

    private function getLanguageService(): LanguageService
    {
        return $GLOBALS['LANG'];
    }
}
