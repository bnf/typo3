import { createHash, randomBytes } from 'node:crypto';
import { test, expect, type APIRequestContext, type Page } from '@playwright/test';
import { BackendPage } from '../../fixtures/backend-page';
import { FormEngine } from '../../fixtures/form-engine';
import config from '../../config';

// The client is simulated by the test: only the request of the browser to the
// redirect URI is observed, the host does not exist
const redirectUri = 'https://oauth-client.example/callback';
const appName = `Playwright OAuth client ${Date.now()}`;

type Client = { id: string, secret: string };
type Metadata = { authorization_endpoint: string, token_endpoint: string };
type AuthorizationRequest = { url: string, state: string, codeVerifier: string };

test.describe.configure({ mode: 'serial' });

let client: Client;
let metadata: Metadata;
let anonymous: APIRequestContext;

test.beforeAll(async ({ playwright }) => {
  // The client talks to TYPO3 on its own, without the session of the backend user
  anonymous = await playwright.request.newContext({ baseURL: config.baseUrl, storageState: { cookies: [], origins: [] } });
});

test.afterAll(async () => {
  await anonymous.dispose();
});

const base64url = (data: Buffer): string => data.toString('base64url');

const createAuthorizationRequest = (scope: string): AuthorizationRequest => {
  const codeVerifier = base64url(randomBytes(32));
  const state = base64url(randomBytes(16));
  const query = new URLSearchParams({
    response_type: 'code',
    client_id: client.id,
    redirect_uri: redirectUri,
    scope,
    state,
    code_challenge: base64url(createHash('sha256').update(codeVerifier).digest()),
    code_challenge_method: 'S256',
  });
  return { url: `${metadata.authorization_endpoint}?${query}`, state, codeVerifier };
};

// Clicks the button of the consent screen and returns the parameters the
// authorization server redirects the browser to the client with
const answerConsent = async (page: Page, button: string, authorization: AuthorizationRequest): Promise<URLSearchParams> => {
  const callback = page.waitForRequest((request) => request.url().startsWith(redirectUri));
  await page.getByRole('button', { name: button }).click();
  const parameters = new URL((await callback).url()).searchParams;
  expect(parameters.get('state')).toBe(authorization.state);
  return parameters;
};

const requestToken = async (parameters: Record<string, string>): Promise<{ access_token: string, refresh_token: string }> => {
  const response = await anonymous.post(metadata.token_endpoint, {
    form: { client_id: client.id, client_secret: client.secret, ...parameters },
  });
  expect(response.status(), await response.text()).toBe(200);
  const token = await response.json();
  expect(token).toEqual(expect.objectContaining({
    token_type: 'Bearer',
    access_token: expect.any(String),
    refresh_token: expect.any(String),
  }));
  return token;
};

const callApi = async (path: string, accessToken: string): Promise<number> => {
  const response = await anonymous.get(`api/${path}`, { headers: { Authorization: `Bearer ${accessToken}` } });
  return response.status();
};

test('Create an OAuth app', async ({ page }) => {
  const backend = new BackendPage(page);
  const formEngine = new FormEngine(page);
  const contentFrame = backend.contentFrame;

  await backend.gotoModule('integrations');
  await contentFrame.locator('[aria-label="Open API Hub module"]').click();
  const loaded = await formEngine.formEngineLoaded();
  await contentFrame.locator('.t3js-module-docheader-buttons').getByRole('button', { name: 'Create new app' }).click();
  await loaded();

  await expect(contentFrame.locator('select[name$="[app_type]"]')).toHaveValue('oauth');
  await contentFrame.locator('input[data-formengine-input-name$="[name]"]').fill(appName);
  await contentFrame.getByTitle('Generate secret token').click();
  const dialog = page.locator('typo3-backend-modal > dialog');
  const credential = dialog.locator('input[readonly]');
  await expect(credential).toHaveValue(/^[0-9a-f]{40}$/);
  const secret = await credential.inputValue();
  await dialog.locator('typo3-copy-to-clipboard').click();
  await expect(page.locator('#alert-container')).toContainText('Copied to clipboard');
  await dialog.locator('button[name="close"]').click();
  await expect(dialog).not.toBeVisible();
  await expect(contentFrame.locator('input[type="hidden"][name$="[secret]"]')).toHaveValue(/^sha256:[0-9a-f]{64}$/);
  await contentFrame.getByLabel('Read access to content').check();
  await contentFrame.locator('input[data-formengine-input-name$="[redirect_uri]"]').fill(redirectUri);

  client = {
    id: await contentFrame.locator('input[data-formengine-input-name$="[identifier]"]').inputValue(),
    secret,
  };
  expect(client.id).toMatch(/^[0-9a-f-]{36}$/);

  await formEngine.save();
  await formEngine.close();
});

test('Discover the authorization server', async () => {
  const response = await anonymous.get('/.well-known/oauth-authorization-server');
  expect(response.ok()).toBeTruthy();
  metadata = await response.json();
  expect(metadata).toEqual(expect.objectContaining({
    authorization_endpoint: expect.stringContaining('/typo3/oauth/authorize'),
    token_endpoint: expect.stringContaining('/typo3/api/v1/oauth/token'),
    scopes_supported: expect.arrayContaining(['content:read', 'dashboard:read']),
  }));
});

test('Authorize the app and call the API with its tokens', async ({ page }) => {
  const authorization = createAuthorizationRequest('content:read dashboard:read');

  await page.goto(authorization.url);
  await expect(page.getByRole('heading', { name: `Authorize ${appName}` })).toBeVisible();
  // The app is configured for content:read only, dashboard:read is not offered
  await expect(page.getByText('Read access to content')).toBeVisible();
  await expect(page.getByText(/dashboard/i)).toHaveCount(0);
  const callback = await answerConsent(page, `Authorize ${appName}`, authorization);

  const token = await requestToken({
    grant_type: 'authorization_code',
    code: callback.get('code') ?? '',
    redirect_uri: redirectUri,
    code_verifier: authorization.codeVerifier,
  });

  expect(await callApi('v1/records/pages', token.access_token)).toBe(200);
  expect(await callApi('v1/dashboards', token.access_token)).toBe(403);
  expect(await callApi('v1/records/pages', 'invalid')).toBe(401);

  const refreshed = await requestToken({ grant_type: 'refresh_token', refresh_token: token.refresh_token });
  expect(refreshed.access_token).not.toBe(token.access_token);
  expect(await callApi('v1/records/pages', refreshed.access_token)).toBe(200);
});

test('Code is rejected with a wrong PKCE code verifier', async ({ page }) => {
  const authorization = createAuthorizationRequest('content:read');

  await page.goto(authorization.url);
  const callback = await answerConsent(page, `Authorize ${appName}`, authorization);

  const response = await anonymous.post(metadata.token_endpoint, {
    form: {
      grant_type: 'authorization_code',
      client_id: client.id,
      client_secret: client.secret,
      code: callback.get('code') ?? '',
      redirect_uri: redirectUri,
      code_verifier: base64url(randomBytes(32)),
    },
  });
  expect(response.status()).toBe(400);
});

test('Cancel the authorization', async ({ page }) => {
  const authorization = createAuthorizationRequest('content:read');

  await page.goto(authorization.url);
  const callback = await answerConsent(page, 'Cancel', authorization);

  expect(callback.get('error')).toBe('access_denied');
  expect(callback.has('code')).toBe(false);
});

test('Log in before authorizing', async ({ browser }) => {
  const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
  const page = await context.newPage();
  const authorization = createAuthorizationRequest('content:read');

  await page.goto(authorization.url);
  await page.getByLabel('Username').fill(config.login.admin.username);
  await page.getByLabel('Password').fill(config.login.admin.password);
  await page.getByRole('button', { name: 'Login' }).click();

  // The route option redirect.standalone leads back to the consent screen
  await expect(page.getByRole('heading', { name: `Authorize ${appName}` })).toBeVisible();
  const callback = await answerConsent(page, `Authorize ${appName}`, authorization);
  expect(callback.get('code')).toBeTruthy();

  await context.close();
});
