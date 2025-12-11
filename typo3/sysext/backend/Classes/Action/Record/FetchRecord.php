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

namespace TYPO3\CMS\Backend\Action\Record;

use TYPO3\CMS\Backend\Scope\ContentReadScope;
use TYPO3\CMS\Core\Action\ActionContext;
use TYPO3\CMS\Core\Action\Error\NotFoundError;
use TYPO3\CMS\Core\Action\Error\PermissionDeniedError;
use TYPO3\CMS\Core\Action\ParameterSource;
use TYPO3\CMS\Core\Attribute\ActionParameter;
use TYPO3\CMS\Core\Attribute\AsAction;
use TYPO3\CMS\Core\Authentication\BackendUserAuthentication;
use TYPO3\CMS\Core\Domain\Dto\Record;
use TYPO3\CMS\Core\Domain\RecordSerializer;

final readonly class FetchRecord
{
    public function __construct(
        private RecordSerializer $recordSerializer,
        private RecordRepository $recordRepository,
        private TemporaryWorkspace $temporaryWorkspace,
    ) {}

    /**
     * @template T of string
     * @param T $schema
     * @param int|null $workspace Workspace to read the record in, defaults to the current workspace of the user
     * @return array{record: Record}
     * @throws NotFoundError Record is not available
     * @todo Allow schema generation (and phpstan) to use `array{record: RecordDto<T>}`
     */
    #[AsAction(
        name: 'records/{schema}/{identifier}',
        tag: 'record',
        scopes: [
            ContentReadScope::class,
        ],
    )]
    public function perform(
        string $schema,
        int $identifier,
        ActionContext $context,
        #[ActionParameter(source: ParameterSource::query)]
        ?int $workspace = null,
    ): array {
        $this->temporaryWorkspace->apply($context, $workspace);
        $user = $context->principal;
        $record = $user instanceof BackendUserAuthentication
            ? $this->recordRepository->findByUid($schema, $identifier, $user)
            : false;
        if ($record === false) {
            throw new PermissionDeniedError('Permission denied', 1766253176);
        }
        if ($record === null) {
            throw new NotFoundError('Record not found', 1766253177);
        }
        return [
            'record' => new Record($record, $this->recordSerializer, $user),
        ];
    }
}
