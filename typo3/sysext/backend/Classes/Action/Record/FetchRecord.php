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
use TYPO3\CMS\Core\Action\Action;
use TYPO3\CMS\Core\Action\ActionInterface;
use TYPO3\CMS\Core\Action\ActionResult;
use TYPO3\CMS\Core\Attribute\AsAction;
use TYPO3\CMS\Core\Domain\RecordFactory;
use TYPO3\CMS\Core\Domain\RecordSerializer;
use TYPO3\CMS\Core\Domain\RecordInterface;
use TYPO3\CMS\Core\Localization\LanguageService;

final readonly class FetchRecord implements ActionInterface
{
    public function __construct(
        private RecordFactory $recordFactory,
        private RecordSerializer $recordSerializer,
    ) {}

    public static function getName(): string
    {
        return 'record/fetch';
    }

    public function execute(
        Action $action,
    ): ActionResult {
        return $this->perform(
            $action->parameters['identifier'] ?? null,
        );
    }

    /**
     * @template T of string
     * @param T $table
     * @return array{record: RecordInterface<T>}
     */
    #[AsAction(
        name: 'record/fetch/{table}/{identifier}',
        method: 'GET',
    )]
    public function perform(
        string $table,
        int $identifier,
    ): array {
        $contentRecordRow = BackendUtility::getRecord($table, $identifier);
        if ($contentRecordRow === null) {
            return new ActionResult(
                [
                    'record' => null,
                ],
                error: 'Record not found',
            );
        }

        $contentRecord = $this->recordFactory->createResolvedRecordFromDatabaseRow($table, $contentRecordRow);

        $success = true;
        return [
            'record' => $this->recordSerializer->serialize($contentRecord),
        ];
        //error: $success ? null : $this->getLanguageService()->sL('LLL:EXT:backend/Records/Private/Language/locallang_resource.xlf:ajax.error'),
    }

    private function getLanguageService(): LanguageService
    {
        return $GLOBALS['LANG'];
    }
}
