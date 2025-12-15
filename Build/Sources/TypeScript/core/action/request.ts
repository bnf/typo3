import AjaxRequest from '@typo3/core/ajax/ajax-request';

const aliases = {
  // Tree
  tree_rootline: '/page/tree/rootline',
  tree_configuration: '/page/tree/configuration',
  tree_browser_configuration:  '/browser/page/tree/configuration',

  // Resources
  resource_rename: '/resource/rename',
  resource_gather: '/resource/gather',

  // Dashboard
  categories_get: '/dashboards/categories',
  dashboard_add: '/dashboards',
  dashboard_delete: '/dashboards/{dashboardIdentifier}',
  dashboard_edit:  '/dashboards/{dashboardIdentifier}',
  dashboard_update: '/dashboards/{dashboardIdentifier}/widgetPositions',
  dashboards_get: '/dashboards',
  presets_get: '/dashboards/presets',
  widget_add: '/dashboards/{dashboardIdentifier}/widgets',
  widget_delete: '/dashboards/{dashboardIdentifier}/widgets/{widgetIdentifier}',
  widget_get: '/dashboards/{dashboardIdentifier}/widgets/{widgetIdentifier}',
  widget_settings_get: '/dashboards/{dashboardIdentifier}/widgets/{widgetIdentifier}/settings',
  widget_settings_update: '/dashboards/{dashboardIdentifier}/widgets/{widgetIdentifier}/settings',
} as const;

// @todo Use https://openapi-ts.dev/openapi-fetch/ to derive expected endpoint types via OpenAPI spec
const resolveEndpoint = (endpoint: keyof typeof aliases | string): string => {
  const { apiPrefix } = top.document.body.dataset;
  if (apiPrefix === undefined) {
    throw new Error('Missing data-api-prefix attribute on top <body>');
  }
  const endpointPath = aliases[endpoint as keyof typeof aliases] ?? endpoint;
  if (endpointPath.startsWith(apiPrefix)) {
    return endpointPath;
  }
  if (endpointPath.startsWith('/')) {
    return apiPrefix + endpointPath;
  }
  return endpointPath;
};

const replacePlaceholders = (url: string, params: Record<string, string>) =>
  Object.entries(params).reduce((acc, [placeholder, value]) => acc.replaceAll('{' + placeholder + '}', value), url);

export const action = (endpoint: string, params: Record<string, string> = {}): AjaxRequest =>
  new AjaxRequest(replacePlaceholders(resolveEndpoint(endpoint), params))
    .addMiddleware(async (request, next) => {
      request.headers.append('Authorization', 'Bearer ' + top.document.body.dataset.apiToken);
      return next(request);
    });
