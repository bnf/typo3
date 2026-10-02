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

namespace TYPO3\CMS\Backend\Controller;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use TYPO3\CMS\Backend\Attribute\AsController;
use TYPO3\CMS\Backend\Form\Exception\AccessDeniedException;
use TYPO3\CMS\Backend\Form\Exception\DatabaseRecordException;
use TYPO3\CMS\Backend\Form\Exception\DatabaseRecordWorkspaceDeletePlaceholderException;
use TYPO3\CMS\Backend\Form\Exception\NoFieldsToRenderException;
use TYPO3\CMS\Backend\Form\FormDataCompiler;
use TYPO3\CMS\Backend\Form\FormDataGroup\TcaDatabaseRecord;
use TYPO3\CMS\Backend\Form\NodeFactory;
use TYPO3\CMS\Backend\Preview\InlineEditFieldResolver;
use TYPO3\CMS\Backend\Routing\UriBuilder;
use TYPO3\CMS\Backend\Utility\BackendUtility;
use TYPO3\CMS\Core\Authentication\BackendUserAuthentication;
use TYPO3\CMS\Core\DataHandling\DataHandler;
use TYPO3\CMS\Core\Http\JsonResponse;
use TYPO3\CMS\Core\Page\JavaScriptItems;
use TYPO3\CMS\Core\Schema\TcaSchemaFactory;
use TYPO3\CMS\Core\Utility\ArrayUtility;
use TYPO3\CMS\Core\Utility\GeneralUtility;

/**
 * Renders and persists the reduced FormEngine form that replaces the
 * preview of a record when it is edited inline in the page module.
 *
 * @internal This controller is not part of the TYPO3 public API.
 */
#[AsController]
final readonly class PageLayoutInlineEditController extends AbstractFormEngineAjaxController
{
    public function __construct(
        private FormDataCompiler $formDataCompiler,
        private NodeFactory $nodeFactory,
        private InlineEditFieldResolver $inlineEditFieldResolver,
        private TcaSchemaFactory $tcaSchemaFactory,
        private UriBuilder $uriBuilder,
    ) {}

    public function formAction(ServerRequestInterface $request): ResponseInterface
    {
        $table = (string)($request->getQueryParams()['table'] ?? '');
        $record = $this->getRecordForEdit($table, (int)($request->getQueryParams()['uid'] ?? 0));
        if ($record === null) {
            return $this->errorResponse('', 404);
        }
        $fields = $this->resolveFields($table, $record);
        if ($fields === []) {
            return $this->errorResponse('', 403);
        }

        try {
            $formData = $this->formDataCompiler->compile(
                [
                    'request' => $request,
                    'tableName' => $table,
                    'vanillaUid' => (int)$record['uid'],
                    'command' => 'edit',
                ],
                GeneralUtility::makeInstance(TcaDatabaseRecord::class)
            );
            $formData['fieldListToRender'] = implode(',', $fields);
            $formData['renderType'] = 'formWrapContainer';
            $formResult = $this->nodeFactory->create($formData)->render();
        } catch (AccessDeniedException $e) {
            return $this->errorResponse($e->getMessage(), 403);
        } catch (DatabaseRecordException|DatabaseRecordWorkspaceDeletePlaceholderException $e) {
            return $this->errorResponse($e->getMessage(), 404);
        } catch (NoFieldsToRenderException) {
            return $this->errorResponse('', 403);
        }

        $scriptItems = new JavaScriptItems();
        $labels = [];
        foreach ($formResult['additionalInlineLanguageLabelFiles'] ?? [] as $labelFile) {
            ArrayUtility::mergeRecursiveWithOverrule($labels, $this->getLabelsFromLocalizationFile($labelFile));
        }
        if ($labels !== []) {
            $scriptItems->addGlobalAssignment(['TYPO3' => ['lang' => $labels]]);
        }
        $this->addJavaScriptModulesToJavaScriptItems($formResult['javaScriptModules'] ?? [], $scriptItems);

        $editUrlParameters = [
            'edit' => [$table => [(int)$record['uid'] => 'edit']],
            'module' => 'web_layout',
            'returnUrl' => GeneralUtility::sanitizeLocalUrl((string)($request->getQueryParams()['returnUrl'] ?? ''), $request),
        ];
        return new JsonResponse([
            'html' => $formResult['html'],
            'title' => (string)$formData['recordTitle'],
            'editUrl' => (string)$this->uriBuilder->buildUriFromRoute('record_edit', $editUrlParameters),
            'contextualEditUrl' => (string)$this->uriBuilder->buildUriFromRoute('record_edit_contextual', $editUrlParameters),
            'browserUrl' => (string)$this->uriBuilder->buildUriFromRoute('wizard_element_browser'),
            'stylesheetFiles' => array_map(
                fn(string $stylesheetFile): string => $this->getRelativePathToStylesheetFile($stylesheetFile),
                $formResult['stylesheetFiles'] ?? []
            ),
            'inlineData' => $formResult['inlineData'] ?? [],
            'scriptItems' => $scriptItems,
        ]);
    }

    public function saveAction(ServerRequestInterface $request): ResponseInterface
    {
        $table = (string)($request->getQueryParams()['table'] ?? '');
        $record = $this->getRecordForEdit($table, (int)($request->getQueryParams()['uid'] ?? 0));
        if ($record === null) {
            return $this->errorResponse('', 404);
        }
        $parsedBody = $request->getParsedBody();
        $dataMap = is_array($parsedBody['data'] ?? null) ? $parsedBody['data'] : [];
        if (!is_array($dataMap[$table][(int)$record['uid']] ?? null)) {
            return $this->errorResponse('', 400);
        }

        $dataHandler = GeneralUtility::makeInstance(DataHandler::class);
        $dataHandler->setControl(is_array($parsedBody['control'] ?? null) ? $parsedBody['control'] : []);
        $dataHandler->start($dataMap, []);
        if (is_array($parsedBody['mirror'] ?? null)) {
            $dataHandler->setMirror($parsedBody['mirror']);
        }
        $dataHandler->process_datamap();

        $savedRecord = BackendUtility::getRecordWSOL($table, (int)$record['uid']);
        return new JsonResponse([
            'success' => $dataHandler->errorLog === [],
            'messages' => array_values($dataHandler->errorLog),
            'title' => is_array($savedRecord) ? BackendUtility::getRecordTitle($table, $savedRecord) : '',
        ]);
    }

    /**
     * @return list<string>
     */
    private function resolveFields(string $table, array $record): array
    {
        $schema = $this->tcaSchemaFactory->get($table);
        $recordType = $schema->supportsSubSchema()
            ? (string)($record[$schema->getSubSchemaTypeInformation()->getFieldName()] ?? '')
            : '';
        $configuration = BackendUtility::getPagesTSconfig((int)$record['pid'])['mod.']['web_layout.']['inlineEditing.'] ?? [];
        return $this->inlineEditFieldResolver->resolve(
            $table,
            $recordType,
            is_array($configuration) ? GeneralUtility::removeDotsFromTS($configuration) : [],
            $this->getBackendUser()
        );
    }

    /**
     * Returns the record to be edited, which is the workspace version of the
     * requested record if one exists in the current workspace.
     */
    private function getRecordForEdit(string $table, int $uid): ?array
    {
        if ($uid <= 0 || !$this->tcaSchemaFactory->has($table) || !$this->getBackendUser()->check('tables_modify', $table)) {
            return null;
        }
        $record = BackendUtility::getRecord($table, $uid);
        if (!is_array($record)) {
            return null;
        }
        $workspace = $this->getBackendUser()->workspace;
        if ($workspace !== 0 && $this->tcaSchemaFactory->get($table)->isWorkspaceAware() && (int)($record['t3ver_oid'] ?? 0) === 0) {
            $versionedRecord = BackendUtility::getWorkspaceVersionOfRecord($workspace, $table, $uid);
            if (is_array($versionedRecord)) {
                return $versionedRecord;
            }
        }
        return $record;
    }

    private function errorResponse(string $message, int $statusCode): ResponseInterface
    {
        return new JsonResponse(['success' => false, 'messages' => $message !== '' ? [$message] : []], $statusCode);
    }

    private function getBackendUser(): BackendUserAuthentication
    {
        return $GLOBALS['BE_USER'];
    }
}
