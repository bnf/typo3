import { test, expect, type APIRequestContext, type BrowserContext } from '@playwright/test';

let api: APIRequestContext;
let context: BrowserContext;

test.describe.configure({ mode: 'parallel' });

test.beforeAll(async ({ playwright, browser }) => {
  context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('');
  const body = page.locator('body');
  const apiPrefix = await body.getAttribute('data-api-prefix');
  const apiToken = await body.getAttribute('data-api-token');
  api = await playwright.request.newContext({
    baseURL: new URL(apiPrefix + '/', page.url()).toString(),
    extraHTTPHeaders: { Authorization: `Bearer ${apiToken}` },
  });
});

test.afterAll(async () => {
  await api.dispose();
  await context.close();
});

test('Fetch schema', async () => {
  const res = await api.get('schema');
  expect(res.ok()).toBeTruthy();
  expect(await res.json()).toEqual(expect.objectContaining({
    openapi: expect.stringMatching(/^3.\d+.\d+$/),
    info: {
      title: 'TYPO3 API',
      version: expect.stringMatching(/^\d+\.\d+\.\d.*$/),
    },
    paths: expect.objectContaining({}),
    tags: expect.arrayContaining([
      expect.objectContaining({
        name: expect.any(String),
        description: expect.any(String),
      })
    ]),
  }));
});
