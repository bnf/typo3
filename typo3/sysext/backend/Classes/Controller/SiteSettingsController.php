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
use TYPO3\CMS\Backend\Routing\UriBuilder;
use TYPO3\CMS\Backend\Template\ModuleTemplateFactory;
use TYPO3\CMS\Core\Settings\Category;
use TYPO3\CMS\Core\Settings\SettingsTypeRegistry;
use TYPO3\CMS\Core\Site\Entity\Site;
use TYPO3\CMS\Core\Site\Set\CategoryRegistry;
use TYPO3\CMS\Core\Site\Set\SetRegistry;
use TYPO3\CMS\Core\Site\SiteFinder;

/**
 * Backend controller: The "Site settings" module
 *
 * @internal This class is a specific Backend controller implementation and is not considered part of the Public TYPO3 API.
 */
#[AsController]
class SiteSettingsController
{
    public function __construct(
        protected readonly ModuleTemplateFactory $moduleTemplateFactory,
        protected readonly SiteFinder $siteFinder,
        protected readonly SetRegistry $setRegistry,
        protected readonly SettingsTypeRegistry $settingsTypeRegistry,
        protected readonly CategoryRegistry $categoryRegistry,
        protected readonly UriBuilder $uriBuilder,
    ) {}

    public function overviewAction(ServerRequestInterface $request): ResponseInterface
    {
        $view = $this->moduleTemplateFactory->create($request);
        $sites = $this->siteFinder->getAllSites();
        $sites = array_filter($sites, static fn(Site $site): bool => $site->getSets() !== []);
        $view->assign('sites', $sites);

        return $view->renderResponse('SiteSettings/Overview');
    }

    private function getDefinitions(Site $site, ?Category $category = null): array
    {
        $sets = $this->setRegistry->getSets(...$site->getSets());
        $definitions = [];
        foreach ($sets as $set) {
            foreach ($set->settingsDefinitions as $settingDefinition) {
                // @todo: handle child-categories as well
                if ($category !== null && !in_array($category->key, $settingDefinition->categories, true)) {
                    continue;
                }
                $definitions[$settingDefinition->key] = $settingDefinition;
            }
        }
        return $definitions;
    }

    public function editAction(ServerRequestInterface $request): ResponseInterface
    {
        $identifier = $request->getQueryParams()['site'] ?? null;
        if ($identifier === null) {
            throw new \RuntimeException('Site identifier to edit must be set', 1713394528);
        }

        $site = $this->siteFinder->getSiteByIdentifier($identifier);
        $view = $this->moduleTemplateFactory->create($request);

        $categories = $this->categoryRegistry->getCategories(...$site->getSets());

        $activeCategory = null;
        $activeCategoryKey = $request->getQueryParams()['category'] ?? null;
        if ($activeCategoryKey !== null) {
            $activeCategory = $this->findCategory($categories, $activeCategoryKey);
            if ($activeCategory === null) {
                throw new \RuntimeException('Invalid category key', 1713394529);
            }
        }

        $definitions = $this->getDefinitions($site, $activeCategory);

        $view->assign('site', $site);
        $view->assign('definitions', $definitions);
        $view->assign('categories', $categories);
        $view->assign('category', $activeCategory);

        return $view->renderResponse('SiteSettings/Edit');
    }

    /**
     * Save incoming data from editAction and redirect to overview or edit
     *
     * @throws \RuntimeException
     */
    public function saveAction(ServerRequestInterface $request): ResponseInterface
    {
        $identifier = $request->getQueryParams()['site'] ?? null;
        if ($identifier === null) {
            throw new \RuntimeException('Site identifier to edit must be set', 1713394529);
        }

        $site = $this->siteFinder->getSiteByIdentifier($identifier);
        $definitions = $this->getDefinitions($site);

        $view = $this->moduleTemplateFactory->create($request);
        $overviewRoute = $this->uriBuilder->buildUriFromRoute('site_settings');

        $parsedBody = $request->getParsedBody();
        \TYPO3\CMS\Extbase\Utility\DebuggerUtility::var_dump($_POST);
        \TYPO3\CMS\Extbase\Utility\DebuggerUtility::var_dump($parsedBody);

        /*
        if (isset($parsedBody['closeDoc']) && (int)$parsedBody['closeDoc'] === 1) {
            // Closing means no save, just redirect to overview
            return new RedirectResponse($overviewRoute);
        }

         */
        $rawSettings = $parsedBody['settings'] ?? [];
        $settings = [];

        foreach ($rawSettings as $key => $value) {
            $definition = $definitions[$key] ?? null;
            if ($definition === null) {
                continue;
            }
            $type = $this->settingsTypeRegistry->get($definition->type);
            $settings[$key] = $type->transformValue($value, $definition);
        }

        \TYPO3\CMS\Extbase\Utility\DebuggerUtility::var_dump($settings);
        exit;

        /*
        // Validate site identifier and do not store or further process it
        $siteIdentifier = $this->validateAndProcessIdentifier($isNewConfiguration, $siteIdentifier, $pageId, $allSites, $mappingRootPageToSite);
        unset($sysSiteRow['identifier']);

        try {
            $newSysSiteData = [];
            // Hard set rootPageId: This is TCA readOnly and not transmitted by FormEngine, but is also the "uid" of the site record
            $newSysSiteData['rootPageId'] = $pageId;
            foreach ($sysSiteRow as $fieldName => $fieldValue) {
                $type = $siteTca['site']['columns'][$fieldName]['config']['type'];
                $renderType = $siteTca['site']['columns'][$fieldName]['config']['renderType'] ?? '';
                switch ($type) {
                    case 'input':
                    case 'number':
                    case 'email':
                    case 'link':
                    case 'datetime':
                    case 'color':
                    case 'text':
                        $fieldValue = $this->validateAndProcessValue('site', $fieldName, $fieldValue);
                        $newSysSiteData[$fieldName] = $fieldValue;
                        break;

                    case 'inline':
                        $newSysSiteData[$fieldName] = [];
                        $childRowIds = GeneralUtility::trimExplode(',', $fieldValue, true);
                        if (!isset($siteTca['site']['columns'][$fieldName]['config']['foreign_table'])) {
                            throw new \RuntimeException('No foreign_table found for inline type', 1521555037);
                        }
                        $foreignTable = $siteTca['site']['columns'][$fieldName]['config']['foreign_table'];
                        foreach ($childRowIds as $childRowId) {
                            $childRowData = [];
                            if (!isset($data[$foreignTable][$childRowId])) {
                                if (!empty($currentSiteConfiguration[$fieldName][$childRowId])) {
                                    // A collapsed inline record: Fetch data from existing config
                                    $newSysSiteData[$fieldName][] = $currentSiteConfiguration[$fieldName][$childRowId];
                                    continue;
                                }
                                throw new \RuntimeException('No data found for table ' . $foreignTable . ' with id ' . $childRowId, 1521555177);
                            }
                            $childRow = $data[$foreignTable][$childRowId];
                            foreach ($childRow as $childFieldName => $childFieldValue) {
                                if ($childFieldName === 'pid') {
                                    // pid is added by inline by default, but not relevant for yml storage
                                    continue;
                                }
                                $type = $siteTca[$foreignTable]['columns'][$childFieldName]['config']['type'];
                                switch ($type) {
                                    case 'input':
                                    case 'number':
                                    case 'email':
                                    case 'link':
                                    case 'datetime':
                                    case 'color':
                                    case 'select':
                                    case 'text':
                                        $childRowData[$childFieldName] = $childFieldValue;
                                        break;
                                    case 'check':
                                        $childRowData[$childFieldName] = (bool)$childFieldValue;
                                        break;
                                    default:
                                        throw new \RuntimeException('TCA type ' . $type . ' not implemented in site handling', 1521555340);
                                }
                            }
                            $newSysSiteData[$fieldName][] = $childRowData;
                        }
                        break;

                    case 'siteLanguage':
                        if (!isset($siteTca['site_language'])) {
                            throw new \RuntimeException('Required foreign table site_language does not exist', 1624286811);
                        }
                        if (!isset($siteTca['site_language']['columns']['languageId'])
                            || ($siteTca['site_language']['columns']['languageId']['config']['type'] ?? '') !== 'select'
                        ) {
                            throw new \RuntimeException(
                                'Required foreign field languageId does not exist or is not of type select',
                                1624286812
                            );
                        }
                        $newSysSiteData[$fieldName] = [];
                        $lastLanguageId = $this->getLastLanguageId();
                        foreach (GeneralUtility::trimExplode(',', $fieldValue, true) as $childRowId) {
                            if (!isset($data['site_language'][$childRowId])) {
                                if (!empty($currentSiteConfiguration[$fieldName][$childRowId])) {
                                    $newSysSiteData[$fieldName][] = $currentSiteConfiguration[$fieldName][$childRowId];
                                    continue;
                                }
                                throw new \RuntimeException('No data found for table site_language with id ' . $childRowId, 1624286813);
                            }
                            $childRowData = [];
                            foreach ($data['site_language'][$childRowId] ?? [] as $childFieldName => $childFieldValue) {
                                if ($childFieldName === 'pid') {
                                    // pid is added by default, but not relevant for yml storage
                                    continue;
                                }
                                if ($childFieldName === 'languageId'
                                    && (int)$childFieldValue === PHP_INT_MAX
                                    && str_starts_with($childRowId, 'NEW')
                                ) {
                                    // In case we deal with a new site language, whose "languageID" field is
                                    // set to the PHP_INT_MAX placeholder, the next available language ID has
                                    // to be used (auto-increment).
                                    $childRowData[$childFieldName] = ++$lastLanguageId;
                                    continue;
                                }
                                $type = $siteTca['site_language']['columns'][$childFieldName]['config']['type'];
                                switch ($type) {
                                    case 'input':
                                    case 'number':
                                    case 'email':
                                    case 'link':
                                    case 'datetime':
                                    case 'color':
                                    case 'select':
                                    case 'text':
                                        $childRowData[$childFieldName] = $childFieldValue;
                                        break;
                                    case 'check':
                                        $childRowData[$childFieldName] = (bool)$childFieldValue;
                                        break;
                                    default:
                                        throw new \RuntimeException('TCA type ' . $type . ' not implemented in site handling', 1624286814);
                                }
                            }
                            $newSysSiteData[$fieldName][] = $childRowData;
                        }
                        break;

                    case 'select':
                        if ($renderType === 'selectMultipleSideBySide') {
                            $fieldValues = is_array($fieldValue) ? $fieldValue : GeneralUtility::trimExplode(',', $fieldValue, true);
                            $newSysSiteData[$fieldName] = $fieldValues;
                        } else {
                            if (MathUtility::canBeInterpretedAsInteger($fieldValue)) {
                                $fieldValue = (int)$fieldValue;
                            } elseif (is_array($fieldValue)) {
                                $fieldValue = implode(',', $fieldValue);
                            }
                            $newSysSiteData[$fieldName] = $fieldValue;
                        }

                        break;

                    case 'check':
                        $newSysSiteData[$fieldName] = (bool)$fieldValue;
                        break;

                    default:
                        throw new \RuntimeException('TCA type "' . $type . '" is not implemented in site handling', 1521032781);
                }
            }

            $newSiteConfiguration = $this->validateFullStructure(
                $this->getMergeSiteData($currentSiteConfiguration, $newSysSiteData),
                $isNewConfiguration
            );

            // Persist the configuration
            try {
                if (!$isNewConfiguration && $currentIdentifier !== $siteIdentifier) {
                    $this->siteWriter->rename($currentIdentifier, $siteIdentifier);
                    $this->getBackendUser()->writelog(Type::SITE, SiteAction::RENAME, SystemLogErrorClassification::MESSAGE, 0, 'Site configuration \'%s\' was renamed to \'%s\'.', [$currentIdentifier, $siteIdentifier], 'site');
                }
                $this->siteWriter->write($siteIdentifier, $newSiteConfiguration, true);
                if ($isNewConfiguration) {
                    $this->getBackendUser()->writelog(Type::SITE, SiteAction::CREATE, SystemLogErrorClassification::MESSAGE, 0, 'Site configuration \'%s\' was created.', [$siteIdentifier], 'site');
                } else {
                    $this->getBackendUser()->writelog(Type::SITE, SiteAction::UPDATE, SystemLogErrorClassification::MESSAGE, 0, 'Site configuration \'%s\' was updated.', [$siteIdentifier], 'site');
                }
            } catch (SiteConfigurationWriteException $e) {
                $flashMessage = GeneralUtility::makeInstance(FlashMessage::class, $e->getMessage(), '', ContextualFeedbackSeverity::WARNING, true);
                $flashMessageService = GeneralUtility::makeInstance(FlashMessageService::class);
                $defaultFlashMessageQueue = $flashMessageService->getMessageQueueByIdentifier();
                $defaultFlashMessageQueue->enqueue($flashMessage);
            }
        } catch (SiteValidationErrorException $e) {
            // Do not store new config if a validation error is thrown, but redirect only to show a generated flash message
        }

        $saveRoute = $this->uriBuilder->buildUriFromRoute('site_configuration.edit', ['site' => $siteIdentifier]);
        if ($isSaveClose) {
            return new RedirectResponse($overviewRoute);
        }
        return new RedirectResponse($saveRoute);
         */
    }

    private function findCategory(array $categories, string $key): ?Category
    {
        foreach ($categories as $category) {
            if ($category->key === $key) {
                return $category;
            }
            $possibleCategory = $this->findCategory($category->categories ?? [], $key);
            if ($possibleCategory !== null) {
                return $possibleCategory;
            }
        }
        return null;
    }
}
