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

use TYPO3\CMS\Backend\Utility\BackendUtility;
use TYPO3\CMS\Core\Action\ActionContext;
use TYPO3\CMS\Core\Attribute\AsAction;
use TYPO3\CMS\Core\Domain\Dto\Record as RecordDto;
use TYPO3\CMS\Core\Domain\RecordFactory;
use TYPO3\CMS\Core\Domain\RecordSerializer;

final readonly class FetchRecord
{
    public function __construct(
        private RecordFactory $recordFactory,
        private RecordSerializer $recordSerializer,
    ) {}

    /**
     * @template T of string
     * @param T $schema
     * @return array{record: RecordDto<T>}
     */
    #[AsAction(
        name: 'records/{schema}/{identifier}',
        tag: 'record',
        method: 'GET',
    )]
    public function perform(
        string $schema,
        int $identifier,
        ActionContext $context,
    ): array {
        $recordRow = BackendUtility::getRecord($schema, $identifier);
        if ($recordRow === null) {
            throw new \RuntimeException('Record not found', 1766253177);
        }

        $record = new RecordDto(
            $this->recordFactory->createResolvedRecordFromDatabaseRow($schema, $recordRow),
            $this->recordSerializer,
        );
        return [
            // @todo let record serializer run automatically on action responses
            'record' => $record,
        ];
    }
}
