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
use TYPO3\CMS\Core\Action\ActionException;
use TYPO3\CMS\Core\Action\Error\NotFoundError;
use TYPO3\CMS\Core\Action\Error\PermissionDeniedError;
use TYPO3\CMS\Core\Action\ParameterSource;
use TYPO3\CMS\Core\Attribute\ActionParameter;
use TYPO3\CMS\Core\Attribute\AsAction;
use TYPO3\CMS\Core\Authentication\BackendUserAuthentication;
use TYPO3\CMS\Core\Schema\TcaSchemaFactory;

final readonly class FetchRecords
{
    private const MAX_LIMIT = 200;

    public function __construct(
        private RecordRepository $recordRepository,
        private TcaSchemaFactory $tcaSchemaFactory,
        private TemporaryWorkspace $temporaryWorkspace,
    ) {}

    /**
     * Records are ordered by page and their sorting field (for tables with manual
     * sorting) and by uid. If there are more records, `next` is to be passed as
     * `cursor` to fetch the next page.
     *
     * @param string $search Only records whose label field contains this text
     * @param int|null $pid Only records on this page
     * @param string|null $type Only records of this record type (e.g. `CType` of `tt_content`)
     * @param int $language Only records of this language id (and of all languages)
     * @param int $limit Maximum number of records, 1 to 200
     * @param string|null $cursor `next` of the previous page
     * @param int|null $workspace Workspace to read the records in, defaults to the current workspace of the user
     * @return array{items: list<array{uid: int, pid: int, label: string, type: string|null, hidden: bool|null, language: int|null}>, next: string|null}
     * @throws NotFoundError Table is not available
     */
    #[AsAction(
        name: 'records/{schema}',
        tag: 'record',
        scopes: [
            ContentReadScope::class,
        ],
    )]
    public function perform(
        ActionContext $context,
        string $schema,
        string $search = '',
        ?int $pid = null,
        ?string $type = null,
        int $language = 0,
        int $limit = 50,
        ?string $cursor = null,
        #[ActionParameter(source: ParameterSource::query)]
        ?int $workspace = null,
    ): array {
        if ($limit < 1 || $limit > self::MAX_LIMIT) {
            throw new ActionException('Limit must be between 1 and ' . self::MAX_LIMIT, 1793201640);
        }
        $this->temporaryWorkspace->apply($context, $workspace);
        $user = $context->principal;
        $result = $user instanceof BackendUserAuthentication
            ? $this->findRows($schema, $user, $limit, $cursor, $search, $pid, $type, $language)
            : false;
        if ($result === false) {
            throw new PermissionDeniedError('Permission denied', 1793195131);
        }
        if ($result === null) {
            throw new NotFoundError('Table not found', 1793195132);
        }
        return [
            'items' => array_map(
                fn(array $row): array => $this->recordRepository->getReference($schema, $row, $user),
                $result['rows']
            ),
            'next' => $result['next'] === null ? null : $this->encodeCursor($result['next']),
        ];
    }

    /**
     * @return false|array{rows: list<array<string, mixed>>, next: list<int>|null}|null
     */
    private function findRows(string $table, BackendUserAuthentication $user, int $limit, ?string $cursor, string $search, ?int $pid, ?string $type, int $language): false|array|null
    {
        if (!$this->tcaSchemaFactory->has($table)) {
            return null;
        }
        if ($type !== null && $this->recordRepository->getTypeField($table) === null) {
            throw new ActionException('Records of this table have no type', 1793203851);
        }
        if ($language !== 0 && !$this->tcaSchemaFactory->get($table)->isLanguageAware()) {
            throw new ActionException('Records of this table have no language', 1793206417);
        }
        return $this->recordRepository->findRows(
            $table,
            $user,
            $limit,
            $cursor === null ? null : $this->decodeCursor($cursor, count($this->recordRepository->getSortFields($table))),
            $search,
            $pid,
            $type,
            $language,
        );
    }

    /**
     * @param list<int> $values
     */
    private function encodeCursor(array $values): string
    {
        return rtrim(strtr(base64_encode(json_encode($values, JSON_THROW_ON_ERROR)), '+/', '-_'), '=');
    }

    /**
     * @return list<int>
     */
    private function decodeCursor(string $cursor, int $count): array
    {
        $values = json_decode((string)base64_decode(strtr($cursor, '-_', '+/'), true), true);
        if (!is_array($values) || !array_is_list($values) || count($values) !== $count || array_filter($values, is_int(...)) !== $values) {
            throw new ActionException('Invalid cursor', 1793203852);
        }
        return $values;
    }
}
