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

namespace TYPO3\CMS\Dashboard\Controller;

use TYPO3\CMS\Core\Action\ActionContext;
use TYPO3\CMS\Core\Action\ActionException;
use TYPO3\CMS\Core\Attribute\AsAction;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use TYPO3\CMS\Backend\Attribute\AsController;
use TYPO3\CMS\Backend\Dto\Settings\EditableSetting;
use TYPO3\CMS\Backend\Routing\Route;
use TYPO3\CMS\Backend\Routing\UriBuilder;
use TYPO3\CMS\Core\Authentication\BackendUserAuthentication;
use TYPO3\CMS\Core\Http\JsonResponse;
use TYPO3\CMS\Core\Localization\LanguageService;
use TYPO3\CMS\Core\Settings\Category;
use TYPO3\CMS\Core\Settings\SettingDefinition;
use TYPO3\CMS\Core\Settings\SettingsDiff;
use TYPO3\CMS\Core\Settings\SettingsTypeRegistry;
use TYPO3\CMS\Dashboard\DashboardPreset;
use TYPO3\CMS\Dashboard\DashboardPresetRegistry;
use TYPO3\CMS\Dashboard\Dto\Dashboard;
use TYPO3\CMS\Dashboard\Dto\WidgetData;
use TYPO3\CMS\Dashboard\Factory\WidgetSettingsFactory;
use TYPO3\CMS\Dashboard\Repository\DashboardRepository;
use TYPO3\CMS\Dashboard\WidgetGroupInitializationService;
use TYPO3\CMS\Dashboard\WidgetRegistry;

/**
 * @internal
 */
#[AsController]
class DashboardAjaxController
{
    public function __construct(
        protected readonly DashboardRepository $dashboardRepository,
        protected readonly DashboardPresetRegistry $dashboardPresetRegistry,
        protected readonly WidgetRegistry $widgetRegistry,
        protected readonly WidgetGroupInitializationService $widgetGroupInitializationService,
        protected readonly WidgetSettingsFactory $widgetSettingsFactory,
        protected readonly SettingsTypeRegistry $settingsTypeRegistry,
        protected readonly UriBuilder $uriBuilder,
    ) {}

    /**
     * @return list<Dashboard>
     */
    #[AsAction(
        name: 'dashboards',
        method: 'GET',
        tag: 'dashboard',
        ajaxAlias: 'dashboard_dashboards_get',
    )]
    public function getDashboards(ActionContext $context): array
    {
        $request = $context->request;
        if ($request === null) {
            throw new ActionException('Dashboard actions require a request context', 1767873941);
        }
        $uid = $context->principal->getUserId();
        if ($uid === null) {
            throw new ActionException('Dashboard actions require a real-user as context', 1767873943);
        }
        $availableDashboards = $this->dashboardRepository->getDashboardsForUser($uid);
        $dashboards = [];
        foreach ($availableDashboards as $dashboard) {
            $dashboard->initializeWidgets($request);
            $dashboards[] = $dashboard->getTransferData();
        }

        return $dashboards;
    }

    /**
     * @return array{
     *   status: string,
     *   dashboard: Dashboard
     * }
     */
    #[AsAction(
        name: 'dashboards',
        method: 'POST',
        tag: 'dashboard',
        ajaxAlias: 'dashboard_dashboard_add',
    )]
    public function addDashboard(
        string $preset,
        string $title,
        ActionContext $context,
    ): array {
        $request = $context->request;
        if ($request === null) {
            throw new ActionException('Dashboard actions require a request context', 1767873942);
        }

        $uid = $context->principal->getUserId();
        if ($uid === null) {
            throw new ActionException('Dashboard actions require a real-user as context', 1767873943);
        }
        $dashboardPreset = $this->dashboardPresetRegistry->getDashboardPresets()[$preset] ?? null;
        if (!$dashboardPreset instanceof DashboardPreset) {
            throw new ActionException('Invalid dashboard preset!', 1767876046);
        }

        $dashboardEntity = $this->dashboardRepository->create(
            $dashboardPreset,
            $uid,
            $title,
        );

        $dashboardEntity->initializeWidgets($request);
        return [
            'status' => 'ok',
            'dashboard' => $dashboardEntity->getTransferData(),
        ];
    }

    /**
     * @return array{
     *   status: string,
     *   dashboard: Dashboard
     * }
     */
    #[AsAction(
        name: 'dashboards/{identifier}',
        method: 'PATCH',
        tag: 'dashboard',
        ajaxAlias: 'dashboard_dashboard_edit',
    )]
    public function editDashboard(
        ActionContext $context,
        string $identifier,
        ?string $title = null,
    ): array {
        $request = $context->request;
        if ($request === null) {
            throw new ActionException('Dashboard actions require a request context', 1767905277);
        }

        $uid = $context->principal->getUserId();
        if ($uid === null) {
            throw new ActionException('Dashboard actions require a real-user as context', 1767905278);
        }
        $availableDashboards = $this->dashboardRepository->getDashboardsForUser($uid);
        $dashboardEntity = $this->dashboardRepository->getDashboardByIdentifier($identifier);

        if (!in_array($dashboardEntity, $availableDashboards)) {
            throw new ActionException('Dashboard is not available', 1767905279);
        }

        if ($title !== null) {
            $this->dashboardRepository->updateDashboardSettings(
                $identifier,
                [
                    'title' => $title,
                ]
            );
        }

        // Fetch updated Dashboard
        $dashboardEntity = $this->dashboardRepository->getDashboardByIdentifier($identifier);
        $dashboardEntity->initializeWidgets($request);

        return [
            'status' => 'ok',
            'dashboard' => $dashboardEntity->getTransferData(),
        ];
    }

    /**
     * @param list<array{identifier: string, type: string, width: string, height: string}> $widgets
     * @param array<string, list<array{identifier: string, width: int, height: int, x: int, y: int}>> $widgetPositions
     * @return array{
     *   status: string,
     *   dashboard: Dashboard
     * }
     */
    #[AsAction(
        name: 'dashboards/{identifier}/widgetPositions',
        method: 'PUT',
        tag: 'dashboard',
        ajaxAlias: 'dashboard_dashboard_update',
    )]
    public function updateDashboard(
        string $identifier,
        array $widgets,
        array $widgetPositions,
        ActionContext $context,
    ): array {
        $dashboardIdentifier = $identifier;
        $request = $context->request;
        if ($request === null) {
            throw new ActionException('Dashboard actions require a request context', 1767905377);
        }

        $uid = $context->principal->getUserId();
        if ($uid === null) {
            throw new ActionException('Dashboard actions require a real-user as context', 1767905378);
        }

        $availableDashboards = $this->dashboardRepository->getDashboardsForUser($this->getBackendUser()->getUserId());
        $dashboardEntity = $this->dashboardRepository->getDashboardByIdentifier($dashboardIdentifier);

        if (!in_array($dashboardEntity, $availableDashboards)) {
            throw new ActionException('Dashboard is not available', 1767905379);
        }

        $data = [];
        foreach ($widgets as $widget) {
            $data[$widget['identifier']] = [
                'identifier' => $widget['type'],
            ];
        }

        // positions
        foreach ($widgetPositions as $columnCount => $widgets) {
            foreach ($widgets as $widget) {
                $identifier = $widget['identifier'];
                unset($widget['identifier']);
                $data[$identifier]['positions'][$columnCount] = array_map('intval', $widget);
            }
        }

        // settings
        $dashboardEntity->initializeWidgets($request);
        foreach ($widgets as $widget) {
            $dashboardWidget = $dashboardEntity->getWidget($widget['identifier']);
            if ($dashboardWidget) {
                $data[$widget['identifier']]['settings'] = $dashboardWidget->getRawConfig()['settings'] ?? [];
            }
        }

        $this->dashboardRepository->updateWidgetConfig($dashboardEntity, $data);

        // Fetch updated Dashboard
        $dashboardEntity = $this->dashboardRepository->getDashboardByIdentifier($dashboardIdentifier);
        $dashboardEntity->initializeWidgets($request);

        return [
            'status' => 'ok',
            'dashboard' => $dashboardEntity->getTransferData(),
        ];
    }

    /**
     * @return array{status: string}
     */
    #[AsAction(
        name: 'dashboards/{identifier}',
        method: 'DELETE',
        tag: 'dashboard',
        ajaxAlias: 'dashboard_dashboard_delete',
    )]
    public function deleteDashboard(
        ActionContext $context,
        string $identifier,
    ): array {
        $uid = $context->principal->getUserId();
        if ($uid === null) {
            throw new ActionException('Dashboard actions require a real-user as context', 1767873943);
        }
        $availableDashboards = $this->dashboardRepository->getDashboardsForUser($uid);
        $dashboard = $this->dashboardRepository->getDashboardByIdentifier($identifier);

        if (!in_array($dashboard, $availableDashboards)) {
            throw new ActionException('Dashboard is not available', 1767893125);
        }

        $this->dashboardRepository->delete($dashboard);
        return [
            'status' => 'ok',
        ];
    }

    /**
     * @return array<string, DashboardPreset>
     */
    #[AsAction(
        name: 'dashboard/presets',
        method: 'GET',
        tag: 'dashboard',
        ajaxAlias: 'dashboard_presets_get',
    )]
    public function getPresets(): array
    {
        return $this->dashboardPresetRegistry->getDashboardPresets();
    }

    /**
     * @return array<string, array{
     *   identifier: string,
     *   label: string,
     *   items: list<array{
     *     identifier: string,
     *     icon: string,
     *     label: string,
     *     description: string,
     *     requestType: string,
     *     event: string
     *   }>
     *  }>
     */
    #[AsAction(
        name: 'dashboard/categories',
        method: 'GET',
        tag: 'dashboard',
        ajaxAlias: 'dashboard_categories_get',
    )]
    public function getCategories(): array
    {
        return $this->widgetGroupInitializationService->buildWidgetGroupsConfiguration();
    }

    /**
     * @return array{status: string, widget: WidgetData}
     */
    #[AsAction(
        name: 'dashboard/widgets/{identifier}',
        method: 'GET',
        tag: 'dashboard',
        ajaxAlias: 'dashboard_widget_get',
    )]
    public function getWidget(
        ActionContext $context,
        string $identifier,
    ): array {
        $request = $context->request;
        if ($request === null) {
            throw new ActionException('Dashboard actions require a request context', 1767905477);
        }
        // Fake a route to fix ugly heuristics in BackendViewFactory, when widgets render a Fluid template
        $request = $request->withAttribute('route', new Route('', ['packageName' => 'typo3/cms-dashboard']));

        $uid = $context->principal->getUserId();
        if ($uid === null) {
            throw new ActionException('Dashboard actions require a real-user as context', 1767905478);
        }

        $availableDashboards = $this->dashboardRepository->getDashboardsForUser($uid);
        $widgets = [];

        foreach ($availableDashboards as $dashboard) {
            $dashboard->initializeWidgets($request);
            foreach ($dashboard->getWidgets() as $dashboardEntry) {
                $widgets[$dashboardEntry->getIdentifier()] = $dashboardEntry;
            }
        }

        $dashboardWidget = $widgets[$identifier] ?? null;
        if ($dashboardWidget === null) {
            throw new ActionException('Widget does not exist!', 1767905479);
        }

        return [
            'status' => 'ok',
            'widget' => $dashboardWidget->getTransferWidgetData(),
        ];
    }

    /**
     * @return array{status: string, categories: list<Category<EditableSetting>>}
     */
    #[AsAction(
        name: 'dashboard/widgets/{identifier}/settings',
        method: 'GET',
        tag: 'dashboard',
        ajaxAlias: 'dashboard_widget_settings_get',
    )]
    public function getWidgetSettings(
        string $identifier,
        ActionContext $context,
    ): array {
        $request = $context->request;
        if ($request === null) {
            throw new ActionException('Dashboard actions require a request context', 1767905577);
        }

        $uid = $context->principal->getUserId();
        if ($uid === null) {
            throw new ActionException('Dashboard actions require a real-user as context', 1767905578);
        }
        $availableDashboards = $this->dashboardRepository->getDashboardsForUser($uid);
        $widgets = [];

        foreach ($availableDashboards as $dashboard) {
            $dashboard->initializeWidgets($request);
            foreach ($dashboard->getWidgets() as $dashboardEntry) {
                $widgets[$dashboardEntry->getIdentifier()] = $dashboardEntry;
            }
        }

        $dashboardWidget = $widgets[$identifier] ?? null;
        if ($dashboardWidget === null) {
            throw new ActionException('Widget does not exist!', 1767905579);
        }

        $categories = [
            new Category(
                key: $dashboardWidget->getType(),
                label: $this->getLanguageService()->sl($dashboardWidget->getTitle()),
                description: $this->getLanguageService()->sl($dashboardWidget->getDescription()),
                icon: $dashboardWidget->getIconIdentifier(),
                settings: array_map(
                    fn(SettingDefinition $definition): EditableSetting => new EditableSetting(
                        definition: $this->resolveSettingLabels($definition),
                        value: $dashboardWidget->getSettings()->get($definition->key),
                        systemDefault: $definition->default,
                        typeImplementation: $this->settingsTypeRegistry->get($definition->type)->getJavaScriptModule(),
                    ),
                    array_values(array_filter($dashboardWidget->getSettingsDefinitions(), fn(SettingDefinition $settingDefinition) => !$settingDefinition->readonly))
                ),
            ),
        ];

        return [
            'status' => 'ok',
            'categories' => $categories,
        ];
    }

    public function updateWidgetSettings(ServerRequestInterface $request): ResponseInterface
    {
        // Check if identifier is available
        $widgetIdentifier = trim((string)($request->getParsedBody()['widget'] ?? ''));
        if ($widgetIdentifier === '') {
            return new JsonResponse([
                'status' => 'error',
                'message' => 'Widget is not available!',
            ]);
        }

        // Check for widget
        $availableDashboards = $this->dashboardRepository->getDashboardsForUser($this->getBackendUser()->getUserId());
        $targetDashboard = null;
        $targetWidget = null;
        foreach ($availableDashboards as $dashboard) {
            $dashboard->initializeWidgets($request);
            if ($dashboard->getWidget($widgetIdentifier)) {
                $targetDashboard = $dashboard;
                $targetWidget = $dashboard->getWidget($widgetIdentifier);
                break;
            }
        }

        if ($targetWidget === null) {
            return new JsonResponse([
                'status' => 'error',
                'message' => 'Widget does not exist!',
            ]);
        }
        if ($targetDashboard === null) {
            return new JsonResponse([
                'status' => 'error',
                'message' => 'Dashboard does not exist!',
            ]);
        }

        $rawSettings = $request->getParsedBody()['settings'] ?? [];
        $widgetData = [];
        foreach ($targetDashboard->getWidgets() as $widget) {
            $widgetData[$widget->getIdentifier()] = $widget->getRawConfig();
            if ($targetWidget->getIdentifier() === $widget->getIdentifier()) {

                $currentSettings = $widget->getRawConfig()['settings'] ?? [];
                $newSettings = $this->widgetSettingsFactory->createSettingsFromFormData($rawSettings, $widget->getSettingsDefinitions());
                $defaultSettings = $this->widgetSettingsFactory->createSettings($widget->getType(), [], $widget->getSettingsDefinitions());
                $diff = SettingsDiff::create(
                    $currentSettings,
                    $newSettings,
                    $defaultSettings,
                );
                if ($diff->changes === [] && $diff->deletions === []) {
                    return new JsonResponse([
                        'status' => 'info',
                        'message' => $this->getLanguageService()->sL('LLL:EXT:dashboard/Resources/Private/Language/locallang.xlf:widget.settings.unchanged'),
                    ]);
                }
                $widgetData[$widget->getIdentifier()]['settings'] = $diff->settings;
            }
        }

        $this->dashboardRepository->updateWidgetConfig($targetDashboard, $widgetData);

        // Fetch updated Dashboard
        $dashboardEntity = $this->dashboardRepository->getDashboardByIdentifier($targetDashboard->getIdentifier());
        $dashboardEntity->initializeWidgets($request);

        $returnWidget = $dashboardEntity->getWidget($targetWidget->getIdentifier());
        if ($returnWidget === null) {
            return new JsonResponse([
                'status' => 'error',
                'message' => 'Widget does not exist!',
            ]);
        }

        return new JsonResponse([
            'status' => 'ok',
        ]);
    }

    public function addWidget(ServerRequestInterface $request): ResponseInterface
    {
        $dashboardIdentifier = (string)($request->getParsedBody()['dashboard'] ?? '');
        $availableDashboards = $this->dashboardRepository->getDashboardsForUser($this->getBackendUser()->getUserId());
        $dashboard = $this->dashboardRepository->getDashboardByIdentifier($dashboardIdentifier);

        if (!in_array($dashboard, $availableDashboards)) {
            return new JsonResponse([
                'status' => 'error',
                'message' => 'Dashboard is not available!',
            ]);
        }

        $widgetType = (string)($request->getParsedBody()['type'] ?? '');
        if ($widgetType === '') {
            throw new \InvalidArgumentException('Argument "widget" not set.', 1714987384);
        }
        $widgets = $dashboard->getWidgetConfig();
        $widgetIdentifier = sha1($widgetType . '-' . time());
        $widgets[$widgetIdentifier] = ['identifier' => $widgetType];
        $this->dashboardRepository->updateWidgetConfig($dashboard, $widgets);

        // Fetch updated Dashboard
        $dashboard = $this->dashboardRepository->getDashboardByIdentifier($dashboardIdentifier);
        $dashboard->initializeWidgets($request);

        $widgets = [];
        foreach ($dashboard->getWidgets() as $dashboardEntry) {
            $widgets[$dashboardEntry->getIdentifier()] = $dashboardEntry;
        }

        $dashboardWidget = $widgets[$widgetIdentifier] ?? null;
        if ($dashboardWidget === null) {
            return new JsonResponse([
                'status' => 'error',
                'message' => 'Widget is not available!',
            ]);
        }

        return new JsonResponse([
            'status' => 'ok',
            'widget' => $dashboardWidget->getTransferWidgetData()->jsonSerialize(),
        ]);
    }

    public function removeWidget(ServerRequestInterface $request): ResponseInterface
    {
        $dashboardIdentifier = (string)($request->getParsedBody()['dashboard'] ?? '');
        $availableDashboards = $this->dashboardRepository->getDashboardsForUser($this->getBackendUser()->getUserId());
        $dashboard = $this->dashboardRepository->getDashboardByIdentifier($dashboardIdentifier);

        if (!in_array($dashboard, $availableDashboards)) {
            return new JsonResponse([
                'status' => 'error',
                'message' => 'Dashboard is not available!',
            ]);
        }

        $widgetIdentifier = (string)($request->getParsedBody()['identifier'] ?? '');
        $widgets = $dashboard->getWidgetConfig();
        if ($widgetIdentifier === '' || !array_key_exists($widgetIdentifier, $widgets)) {
            return new JsonResponse([
                'status' => 'error',
                'message' => 'Widget is not available!',
            ]);
        }

        unset($widgets[$widgetIdentifier]);
        $this->dashboardRepository->updateWidgetConfig($dashboard, $widgets);

        return new JsonResponse([
            'status' => 'ok',
        ]);
    }

    private function resolveSettingLabels(SettingDefinition $definition): SettingDefinition
    {
        $languageService = $this->getLanguageService();
        return new SettingDefinition(...[
            ...get_object_vars($definition),
            'label' => $languageService->sL($definition->label),
            'description' => $definition->description !== null ? $languageService->sL($definition->description) : null,
            'enum' => array_map(static fn(string $label): string => $languageService->sL($label), $definition->enum),
        ]);
    }

    protected function getLanguageService(): LanguageService
    {
        return $GLOBALS['LANG'];
    }

    protected function getBackendUser(): BackendUserAuthentication
    {
        return $GLOBALS['BE_USER'];
    }
}
