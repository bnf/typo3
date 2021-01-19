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

namespace TYPO3\CMS\Lowlevel\Controller;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use TYPO3\CMS\Backend\Routing\UriBuilder;
use TYPO3\CMS\Backend\View\ArrayBrowser;
use TYPO3\CMS\Core\Authentication\BackendUserAuthentication;
use TYPO3\CMS\Core\Http\JsonResponse;
use TYPO3\CMS\Core\Localization\LanguageService;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Lowlevel\ConfigurationModuleProvider\ProviderRegistry;

/**
 * View configuration arrays in the backend. This is the "Configuration" main module.
 *
 * @internal This class is a specific Backend controller implementation and is not part of the TYPO3's Core API.
 */
class ConfigurationController
{
    public function __construct(
        protected readonly ProviderRegistry $configurationProviderRegistry,
        protected readonly UriBuilder $uriBuilder,
    ) {
    }

    /**
     * Main controller action determines get/post values, takes care of
     * stored backend user settings for this module, determines tree
     * and renders it.
     */
    public function handleRequest(ServerRequestInterface $request): ResponseInterface
    {
        $backendUser = $this->getBackendUser();
        $queryParams = $request->getQueryParams();
        $moduleState = $backendUser->uc['moduleData']['system_config'] ?? [];

        $configurationProviderIdentifier = (string)($queryParams['tree'] ?? $moduleState['tree'] ?? '');

        if ($configurationProviderIdentifier === ''
            && $this->configurationProviderRegistry->getFirstProvider() !== null
        ) {
            $configurationProviderIdentifier = $this->configurationProviderRegistry->getFirstProvider()->getIdentifier();
        }

        if (!$this->configurationProviderRegistry->hasProvider($configurationProviderIdentifier)) {
            throw new \InvalidArgumentException(
                'No provider found for identifier: ' . $configurationProviderIdentifier,
                1606306196
            );
        }

        $configurationProvider = $this->configurationProviderRegistry->getProvider($configurationProviderIdentifier);
        $moduleState['tree'] = $configurationProviderIdentifier;

        $configurationArray = $configurationProvider->getConfiguration();

        // Search string given or regex search enabled?
        $searchString = trim((string)($queryParams['searchString'] ?? ''));
        $moduleState['regexSearch'] = (bool)($queryParams['regexSearch'] ?? $moduleState['regexSearch'] ?? false);

        // Prepare array renderer class, apply search and expand / collapse states
        $arrayBrowser = GeneralUtility::makeInstance(ArrayBrowser::class, $request->getAttribute('route'));
        $arrayBrowser->regexMode = $moduleState['regexSearch'];
        $node = $queryParams['node'] ?? null;
        if ($searchString) {
            $arrayBrowser->depthKeys = $arrayBrowser->getSearchKeys($configurationArray, '', $searchString, []);
        } elseif (is_array($node)) {
            $newExpandCollapse = $arrayBrowser->depthKeys($node, $moduleState['node_' . $configurationProviderIdentifier] ?? []);
            $arrayBrowser->depthKeys = $newExpandCollapse;
            $moduleState['node_' . $configurationProviderIdentifier] = $newExpandCollapse;
        } else {
            $arrayBrowser->depthKeys = $moduleState['node_' . $configurationProviderIdentifier] ?? [];
        }

        // Store new state
        $backendUser->uc['moduleData']['system_config'] = $moduleState;
        $backendUser->writeUC();

        $self = (string)$this->uriBuilder->buildUriFromRoute('system_config', ['tree' =>  $configurationProviderIdentifier]);

        $shortcut = [
            'routeIdentifier' => 'system_config',
            'routeArguments' => json_encode(['tree' => $configurationProviderIdentifier]),
            'displayName' => $configurationProvider->getLabel()
        ];

        $items = [];
        foreach ($this->configurationProviderRegistry->getProviders() as $provider) {
            $item = [
                'label' => $provider->getLabel(),
                'url' => (string)$uriBuilder->buildUriFromRoute('system_config', ['tree' => $provider->getIdentifier()]),
            ];

            if ($provider === $configurationProvider) {
                $item['active'] = true;
            }
            $items[] = $item;
        }

        $labels = [
            'configuration' => '',
            'enterSearchPhrase' => '',
            'useRegExp' => '',
            'search' => '',
        ];
        foreach ($labels as $key => $_) {
            $labels[$key] = $this->getLanguageService()->sL('LLL:EXT:lowlevel/Resources/Private/Language/locallang.xlf:' . $key);
        }
        return new JsonResponse([
            'items' => $items,
            'self' => $self,
            'shortcut' => $shortcut,
            'treeName' => $configurationProvider->getLabel(),
            'searchString' => $searchString,
            'regexSearch' => $moduleState['regexSearch'],
            'treeData' => $arrayBrowser->treeData($configurationArray, ''),
            'labels' => $labels,
        ]);
    }

    protected function getBackendUser(): BackendUserAuthentication
    {
        return $GLOBALS['BE_USER'];
    }

    protected function getLanguageService(): LanguageService
    {
        return $GLOBALS['LANG'];
    }
}
