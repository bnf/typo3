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

namespace TYPO3\CMS\Dashboard\Action;

use TYPO3\CMS\Backend\Dto\Settings\EditableSetting;
use TYPO3\CMS\Backend\Routing\Route;
use TYPO3\CMS\Core\Action\ActionContext;
use TYPO3\CMS\Core\Action\ActionException;
use TYPO3\CMS\Core\Action\Error\NotFoundError;
use TYPO3\CMS\Core\Attribute\AsAction;
use TYPO3\CMS\Core\Localization\LanguageService;
use TYPO3\CMS\Core\Settings\Category;
use TYPO3\CMS\Core\Settings\SettingDefinition;
use TYPO3\CMS\Core\Settings\SettingsDiff;
use TYPO3\CMS\Core\Settings\SettingsTypeRegistry;
use TYPO3\CMS\Dashboard\Dashboard as DashboardInstance;
use TYPO3\CMS\Dashboard\DashboardEntry;
use TYPO3\CMS\Dashboard\DashboardPreset;
use TYPO3\CMS\Dashboard\DashboardPresetRegistry;
use TYPO3\CMS\Dashboard\Dto\Dashboard;
use TYPO3\CMS\Dashboard\Dto\WidgetData;
use TYPO3\CMS\Dashboard\Factory\WidgetSettingsFactory;
use TYPO3\CMS\Dashboard\Repository\DashboardRepository;
use TYPO3\CMS\Dashboard\Scope\DashboardReadScope;
use TYPO3\CMS\Dashboard\Scope\DashboardWriteScope;
use TYPO3\CMS\Dashboard\WidgetGroupInitializationService;

final readonly class DashboardActions
{
    public function __construct(
        private DashboardRepository $dashboardRepository,
        private DashboardPresetRegistry $dashboardPresetRegistry,
        private WidgetGroupInitializationService $widgetGroupInitializationService,
        private WidgetSettingsFactory $widgetSettingsFactory,
        private SettingsTypeRegistry $settingsTypeRegistry,
    ) {}

    /**
     * @return list<Dashboard>
     */
    #[AsAction(
        name: 'dashboards',
        method: 'GET',
        tag: 'dashboard',
        ajaxAlias: 'dashboard_dashboards_get',
        scopes: [
            DashboardReadScope::class,
        ],
    )]
    public function getDashboards(ActionContext $context): array
    {
        $this->assertRequestAndUser($context);
        $availableDashboards = $this->dashboardRepository->getDashboardsForUser($context->principal->getUserId());
        $dashboards = [];
        foreach ($availableDashboards as $dashboard) {
            $dashboard->initializeWidgets($context->request);
            $dashboards[] = $dashboard->getTransferData();
        }

        return $dashboards;
    }

    /**
     * @return array{
     *   dashboard: Dashboard
     * }
     */
    #[AsAction(
        name: 'dashboards',
        method: 'POST',
        tag: 'dashboard',
        ajaxAlias: 'dashboard_dashboard_add',
        scopes: [
            DashboardReadScope::class,
            DashboardWriteScope::class,
        ],
    )]
    public function addDashboard(
        string $preset,
        string $title,
        ActionContext $context,
    ): array {
        $this->assertRequestAndUser($context);
        $dashboardPreset = $this->dashboardPresetRegistry->getDashboardPresets()[$preset] ?? null;
        if (!$dashboardPreset instanceof DashboardPreset) {
            throw new ActionException('Invalid dashboard preset!', 1767876046);
        }

        $dashboardEntity = $this->dashboardRepository->create(
            $dashboardPreset,
            $context->principal->getUserId(),
            $title,
        );

        $dashboardEntity->initializeWidgets($context->request);
        return [
            'dashboard' => $dashboardEntity->getTransferData(),
        ];
    }

    /**
     * @return array{
     *   dashboard: Dashboard
     * }
     * @throws NotFoundError Dashboard is not available
     */
    #[AsAction(
        name: 'dashboards/{dashboardIdentifier}',
        method: 'PATCH',
        tag: 'dashboard',
        ajaxAlias: 'dashboard_dashboard_edit',
        scopes: [
            DashboardReadScope::class,
            DashboardWriteScope::class,
        ],
    )]
    public function editDashboard(
        ActionContext $context,
        string $dashboardIdentifier,
        ?string $title = null,
    ): array {
        $dashboard = $this->getDashboard($dashboardIdentifier, $context);

        if ($title !== null) {
            $this->dashboardRepository->updateDashboardSettings(
                $dashboard->getIdentifier(),
                [
                    'title' => $title,
                ]
            );
        }

        // Fetch updated Dashboard
        $updatedDashboardEntity = $this->dashboardRepository->getDashboardByIdentifier($dashboard->getIdentifier());
        $updatedDashboardEntity->initializeWidgets($context->request);

        return [
            'dashboard' => $updatedDashboardEntity->getTransferData(),
        ];
    }

    /**
     * @param list<array{identifier: string, type: string, width: string, height: string}> $widgets
     * @param array<string, list<array{identifier: string, width: int, height: int, x: int, y: int}>> $widgetPositions
     * @return array{
     *   dashboard: Dashboard
     * }
     * @throws NotFoundError Dashboard is not available
     */
    #[AsAction(
        name: 'dashboards/{dashboardIdentifier}/widgetPositions',
        method: 'PUT',
        tag: 'dashboard',
        ajaxAlias: 'dashboard_dashboard_update',
        scopes: [
            DashboardReadScope::class,
            DashboardWriteScope::class,
        ],
    )]
    public function updateDashboard(
        string $dashboardIdentifier,
        array $widgets,
        array $widgetPositions,
        ActionContext $context,
    ): array {
        $dashboardEntity = $this->getDashboard($dashboardIdentifier, $context);

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
        $dashboardEntity->initializeWidgets($context->request);
        foreach ($widgets as $widget) {
            $dashboardWidget = $dashboardEntity->getWidget($widget['identifier']);
            if ($dashboardWidget) {
                $data[$widget['identifier']]['settings'] = $dashboardWidget->getRawConfig()['settings'] ?? [];
            }
        }

        $this->dashboardRepository->updateWidgetConfig($dashboardEntity, $data);

        // Fetch updated Dashboard
        $dashboardEntity = $this->dashboardRepository->getDashboardByIdentifier($dashboardIdentifier);
        $dashboardEntity->initializeWidgets($context->request);

        return [
            'dashboard' => $dashboardEntity->getTransferData(),
        ];
    }

    /**
     * @throws NotFoundError Dashboard is not available
     */
    #[AsAction(
        name: 'dashboards/{dashboardIdentifier}',
        method: 'DELETE',
        tag: 'dashboard',
        ajaxAlias: 'dashboard_dashboard_delete',
        scopes: [
            DashboardReadScope::class,
            DashboardWriteScope::class,
        ],
    )]
    public function deleteDashboard(
        ActionContext $context,
        string $dashboardIdentifier,
    ): void {
        $dashboard = $this->getDashboard($dashboardIdentifier, $context);
        $this->dashboardRepository->delete($dashboard);
    }

    /**
     * @return array<string, DashboardPreset>
     */
    #[AsAction(
        name: 'dashboards/presets',
        method: 'GET',
        tag: 'dashboard',
        ajaxAlias: 'dashboard_presets_get',
        scopes: [
            DashboardReadScope::class,
        ],
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
        name: 'dashboards/categories',
        method: 'GET',
        tag: 'dashboard',
        ajaxAlias: 'dashboard_categories_get',
        scopes: [
            DashboardReadScope::class,
        ],
    )]
    public function getCategories(): array
    {
        return $this->widgetGroupInitializationService->buildWidgetGroupsConfiguration();
    }

    /**
     * @return array{widget: WidgetData}
     * @throws NotFoundError Dashboard is not available
     */
    #[AsAction(
        name: 'dashboards/{dashboardIdentifier}/widgets/{widgetIdentifier}',
        method: 'GET',
        tag: 'dashboard',
        ajaxAlias: 'dashboard_widget_get',
        scopes: [
            DashboardReadScope::class,
        ],
    )]
    public function getWidget(
        ActionContext $context,
        string $dashboardIdentifier,
        string $widgetIdentifier,
    ): array {
        $dashboard = $this->getDashboard($dashboardIdentifier, $context);
        $dashboardWidget = $this->getDashboardWidget($dashboard, $widgetIdentifier, $context);

        return [
            'widget' => $dashboardWidget->getTransferWidgetData(),
        ];
    }

    /**
     * @return array{categories: list<Category<EditableSetting>>}
     * @throws NotFoundError Dashboard or Widget is not available
     */
    #[AsAction(
        name: 'dashboards/{dashboardIdentifier}/widgets/{widgetIdentifier}/settings',
        method: 'GET',
        tag: 'dashboard',
        ajaxAlias: 'dashboard_widget_settings_get',
        scopes: [
            DashboardReadScope::class,
        ],
    )]
    public function getWidgetSettings(
        string $dashboardIdentifier,
        string $widgetIdentifier,
        ActionContext $context,
    ): array {
        $dashboard = $this->getDashboard($dashboardIdentifier, $context);
        $dashboardWidget = $this->getDashboardWidget($dashboard, $widgetIdentifier, $context);

        $categories = [
            new Category(
                key: $dashboardWidget->getType(),
                label: $context->languageService->sL($dashboardWidget->getTitle()),
                description: $context->languageService->sL($dashboardWidget->getDescription()),
                icon: $dashboardWidget->getIconIdentifier(),
                settings: array_map(
                    fn(SettingDefinition $definition): EditableSetting => new EditableSetting(
                        definition: $this->resolveSettingLabels($context->languageService, $definition),
                        value: $dashboardWidget->getSettings()->get($definition->key),
                        systemDefault: $definition->default,
                        typeImplementation: $this->settingsTypeRegistry->get($definition->type)->getJavaScriptModule(),
                    ),
                    array_values(array_filter($dashboardWidget->getSettingsDefinitions(), fn(SettingDefinition $settingDefinition) => !$settingDefinition->readonly))
                ),
            ),
        ];

        return [
            'categories' => $categories,
        ];
    }

    /**
     * @param array<string, mixed> $settings
     * @return array{status: string, message?: string}
     * @throws NotFoundError Dashboard or Widget is not available
     */
    #[AsAction(
        name: 'dashboards/{dashboardIdentifier}/widgets/{widgetIdentifier}/settings',
        method: 'PUT',
        tag: 'dashboard',
        ajaxAlias: 'dashboard_widget_settings_update',
        scopes: [
            DashboardReadScope::class,
            DashboardWriteScope::class,
        ],
    )]
    public function updateWidgetSettings(
        ActionContext $context,
        string $dashboardIdentifier,
        string $widgetIdentifier,
        array $settings,
    ): array {
        $targetDashboard = $this->getDashboard($dashboardIdentifier, $context);
        $targetWidget = $this->getDashboardWidget($targetDashboard, $widgetIdentifier, $context);

        $widgetData = [];
        foreach ($targetDashboard->getWidgets() as $widget) {
            $widgetData[$widget->getIdentifier()] = $widget->getRawConfig();
            if ($targetWidget->getIdentifier() === $widget->getIdentifier()) {

                $currentSettings = $widget->getRawConfig()['settings'] ?? [];
                $newSettings = $this->widgetSettingsFactory->createSettingsFromFormData($settings, $widget->getSettingsDefinitions());
                $defaultSettings = $this->widgetSettingsFactory->createSettings($widget->getType(), [], $widget->getSettingsDefinitions());
                $diff = SettingsDiff::create(
                    $currentSettings,
                    $newSettings,
                    $defaultSettings,
                );
                if ($diff->changes === [] && $diff->deletions === []) {
                    return [
                        'status' => 'info',
                        'message' => $context->languageService->sL('LLL:EXT:dashboard/Resources/Private/Language/locallang.xlf:widget.settings.unchanged'),
                    ];
                }
                $widgetData[$widget->getIdentifier()]['settings'] = $diff->settings;
            }
        }

        $this->dashboardRepository->updateWidgetConfig($targetDashboard, $widgetData);

        // Fetch updated Dashboard
        $dashboardEntity = $this->dashboardRepository->getDashboardByIdentifier($targetDashboard->getIdentifier());
        $dashboardEntity->initializeWidgets($context->request);

        $returnWidget = $dashboardEntity->getWidget($targetWidget->getIdentifier());
        if ($returnWidget === null) {
            throw new NotFoundError('Widget does not exist!', 1768334488);
        }

        return [
            'status' => 'ok',
        ];
    }

    /**
     * @return array{
     *   widget: WidgetData
     * }
     * @throws NotFoundError Dashboard is not available
     */
    #[AsAction(
        name: 'dashboards/{dashboardIdentifier}/widgets',
        method: 'POST',
        tag: 'dashboard',
        ajaxAlias: 'dashboard_widget_add',
        scopes: [
            DashboardReadScope::class,
            DashboardWriteScope::class,
        ],
    )]
    public function addWidget(
        string $dashboardIdentifier,
        string $widgetType,
        ActionContext $context,
    ): array {
        $dashboard = $this->getDashboard($dashboardIdentifier, $context);
        // Fake a route to fix ugly heuristics in BackendViewFactory, when widgets render a Fluid template
        $request = $context->request->withAttribute('route', new Route('', ['packageName' => 'typo3/cms-dashboard']));

        $widgets = $dashboard->getWidgetConfig();
        $widgetIdentifier = sha1($widgetType . '-' . time());
        $widgets[$widgetIdentifier] = ['identifier' => $widgetType];
        $this->dashboardRepository->updateWidgetConfig($dashboard, $widgets);

        // Fetch updated Dashboard
        $dashboard = $this->dashboardRepository->getDashboardByIdentifier($dashboardIdentifier);
        $dashboardWidget = $this->getDashboardWidget($dashboard, $widgetIdentifier, $context);

        return [
            'widget' => $dashboardWidget->getTransferWidgetData(),
        ];
    }

    /**
     * @throws NotFoundError Dashboard or Widget is not available
     */
    #[AsAction(
        name: 'dashboards/{dashboardIdentifier}/widgets/{widgetIdentifier}',
        method: 'DELETE',
        tag: 'dashboard',
        ajaxAlias: 'dashboard_widget_delete',
        scopes: [
            DashboardReadScope::class,
            DashboardWriteScope::class,
        ],
    )]
    public function deleteWidget(
        ActionContext $context,
        string $dashboardIdentifier,
        string $widgetIdentifier
    ): void {
        $dashboard = $this->getDashboard($dashboardIdentifier, $context);
        $this->assertWidget($dashboard, $widgetIdentifier);

        $widgets = $dashboard->getWidgetConfig();
        unset($widgets[$widgetIdentifier]);
        $this->dashboardRepository->updateWidgetConfig($dashboard, $widgets);
    }

    private function resolveSettingLabels(LanguageService $languageService, SettingDefinition $definition): SettingDefinition
    {
        return new SettingDefinition(...[
            ...get_object_vars($definition),
            'label' => $languageService->sL($definition->label),
            'description' => $definition->description !== null ? $languageService->sL($definition->description) : null,
            'enum' => array_map(static fn(string $label): string => $languageService->sL($label), $definition->enum),
        ]);
    }

    private function getDashboard(string $dashboardIdentifier, ActionContext $context): DashboardInstance
    {
        $this->assertRequestAndUser($context);
        $uid = $context->principal->getUserId();
        $availableDashboards = $this->dashboardRepository->getDashboardsForUser($uid);
        $dashboard = $this->dashboardRepository->getDashboardByIdentifier($dashboardIdentifier);

        if (!in_array($dashboard, $availableDashboards)) {
            throw new NotFoundError('Dashboard is not available', 1771405342);
        }

        return $dashboard;
    }

    private function assertRequestAndUser(ActionContext $context): void
    {
        $request = $context->request;
        if ($request === null) {
            throw new ActionException('Dashboard actions require a request context', 1768332642);
        }

        $uid = $context->principal->getUserId();
        if ($uid === null) {
            throw new ActionException('Dashboard actions require a real-user as context', 1768332655);
        }
    }

    private function assertWidget(DashboardInstance $dashboard, string $widgetIdentifier): void
    {
        $widgets = $dashboard->getWidgetConfig();
        if ($widgetIdentifier === '' || !array_key_exists($widgetIdentifier, $widgets)) {
            throw new ActionException('Widget is not available!', 1768333053);
        }
    }

    private function getDashboardWidget(
        DashboardInstance $dashboard,
        string $widgetIdentifier,
        ActionContext $context,
    ): DashboardEntry {
        // Fake a route to fix ugly heuristics in BackendViewFactory, when widgets render a Fluid template
        $request = $context->request->withAttribute('route', new Route('', ['packageName' => 'typo3/cms-dashboard']));
        $dashboard->initializeWidgets($request);
        $widget = $dashboard->getWidget($widgetIdentifier);
        if ($widget === null) {
            throw new ActionException('Widget does not exist!', 1768332921);
        }
        return $widget;
    }
}
