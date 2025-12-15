import AjaxRequest from '@typo3/core/ajax/ajax-request';

// @todo Use https://openapi-ts.dev/openapi-fetch/ to derive expected endpoint types via OpenAPI spec
const resolveEndpoint = (endpointPath: string): string => {
  const { apiPrefix } = top.document.body.dataset;
  if (apiPrefix === undefined) {
    throw new Error('Missing data-api-prefix attribute on top <body>');
  }
  if (endpointPath.startsWith(apiPrefix.replace(/\/api$/, ''))) {
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
