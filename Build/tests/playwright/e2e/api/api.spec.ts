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

test('Fetch dashboards', async () => {
  const res = await api.get('dashboards');
  expect(res.ok()).toBeTruthy();
  expect(await res.json()).toEqual(expect.arrayContaining([
    expect.objectContaining({
      identifier: expect.any(String),
      title: expect.any(String),
      widgets: expect.arrayContaining([
        expect.objectContaining({
          identifier: expect.any(String),
          type: expect.any(String),
        })
      ])
    })
  ]));
});

[
  { schema: 'tx_styleguide_ctrl_common', uid: 1 },
  { schema: 'tx_styleguide_ctrl_minimal', uid: 1 },
  { schema: 'tx_styleguide_displaycond', uid: 1 },
  { schema: 'tx_styleguide_elements_basic', uid: 1 },
  { schema: 'tx_styleguide_elements_folder', uid: 1 },
  { schema: 'tx_styleguide_elements_group', uid: 1 },
  { schema: 'tx_styleguide_elements_imagemanipulation', uid: 1 },
  { schema: 'tx_styleguide_elements_rte_flex_1_inline_1_child', uid: 1 },
  { schema: 'tx_styleguide_elements_rte_inline_1_child', uid: 1 },
  { schema: 'tx_styleguide_elements_rte', uid: 1 },
  { schema: 'tx_styleguide_elements_select', uid: 1 },
  { schema: 'tx_styleguide_elements_select_single_12_foreign', uid: 1 },
  { schema: 'tx_styleguide_elements_select_single_21_foreign', uid: 1 },
  { schema: 'tx_styleguide_elements_slugs', uid: 1 },
  { schema: 'tx_styleguide_elements_t3editor_flex_1_inline_1_child', uid: 1 },
  { schema: 'tx_styleguide_elements_t3editor_inline_1_child', uid: 1 },
  { schema: 'tx_styleguide_elements_t3editor', uid: 1 },
  { schema: 'tx_styleguide_file', uid: 1 },
  { schema: 'tx_styleguide_flex_flex_3_inline_1_child', uid: 1 },
  { schema: 'tx_styleguide_flex', uid: 1 },
  // 11_child does not exist by default
  // @todo create in EXT:styleguide or in here
  //{ schema: 'tx_styleguide_inline_11_child', uid: 1 },
  { schema: 'tx_styleguide_inline_11', uid: 1 },
  { schema: 'tx_styleguide_inline_1n1n_childchild', uid: 1 },
  { schema: 'tx_styleguide_inline_1n1n_child', uid: 1 },
  { schema: 'tx_styleguide_inline_1n1n', uid: 1 },
  { schema: 'tx_styleguide_inline_1n_inline_1_child', uid: 1 },
  { schema: 'tx_styleguide_inline_1n_inline_2_child', uid: 1 },
  { schema: 'tx_styleguide_inline_1nnol10n_child', uid: 1 },
  { schema: 'tx_styleguide_inline_1nnol10n', uid: 1 },
  { schema: 'tx_styleguide_inline_1n', uid: 1 },
  { schema: 'tx_styleguide_inline_1nreusabletable_child', uid: 1 },
  { schema: 'tx_styleguide_inline_1nreusabletable', uid: 1 },
  { schema: 'tx_styleguide_inline_expand_inline_1_child', uid: 1 },
  { schema: 'tx_styleguide_inline_expand', uid: 1 },
  { schema: 'tx_styleguide_inline_expandsingle_child', uid: 1 },
  { schema: 'tx_styleguide_inline_expandsingle_inline_2_child', uid: 1 },
  { schema: 'tx_styleguide_inline_expandsingle', uid: 1 },
  { schema: 'tx_styleguide_inline_foreignrecorddefaults_child', uid: 1 },
  { schema: 'tx_styleguide_inline_foreignrecorddefaults', uid: 1 },
  // mm_childchild and mm_child do not exist by default
  // @todo create in EXT:styleguide or in here
  //{ schema: 'tx_styleguide_inline_mm_childchild', uid: 1 },
  //{ schema: 'tx_styleguide_inline_mm_child', uid: 1 },
  { schema: 'tx_styleguide_inline_mm', uid: 1 },
  { schema: 'tx_styleguide_inline_mn_child', uid: 1 },
  { schema: 'tx_styleguide_inline_mngroup_child', uid: 1 },
  { schema: 'tx_styleguide_inline_mngroup_mm', uid: 1 },
  { schema: 'tx_styleguide_inline_mngroup', uid: 1 },
  { schema: 'tx_styleguide_inline_mn_mm', uid: 1 },
  { schema: 'tx_styleguide_inline_mn', uid: 1 },
  { schema: 'tx_styleguide_inline_mnsymmetricgroup_mm', uid: 1 },
  { schema: 'tx_styleguide_inline_mnsymmetricgroup', uid: 1 },
  { schema: 'tx_styleguide_inline_mnsymmetric_mm', uid: 1 },
  { schema: 'tx_styleguide_inline_mnsymmetric', uid: 1 },
  { schema: 'tx_styleguide_inline_overridechildtca_child', uid: 1 },
  { schema: 'tx_styleguide_inline_overridechildtca', uid: 1 },
  { schema: 'tx_styleguide_inline_parentnosoftdelete', uid: 1 },
  { schema: 'tx_styleguide_inline_usecombinationbox_child', uid: 1 },
  { schema: 'tx_styleguide_inline_usecombinationbox_mm', uid: 1 },
  { schema: 'tx_styleguide_inline_usecombinationbox', uid: 1 },
  { schema: 'tx_styleguide_inline_usecombination_child', uid: 1 },
  { schema: 'tx_styleguide_inline_usecombinationgroup_child', uid: 1 },
  { schema: 'tx_styleguide_inline_usecombinationgroup_mm', uid: 1 },
  { schema: 'tx_styleguide_inline_usecombinationgroup', uid: 1 },
  { schema: 'tx_styleguide_inline_usecombination_mm', uid: 1 },
  { schema: 'tx_styleguide_inline_usecombination', uid: 1 },
  { schema: 'tx_styleguide_l10nreadonly_inline_child', uid: 1 },
  { schema: 'tx_styleguide_l10nreadonly', uid: 1 },
  { schema: 'tx_styleguide_palette', uid: 1 },
  { schema: 'tx_styleguide_required_file_1_child', uid: 1 },
  { schema: 'tx_styleguide_required_flex_2_inline_1_child', uid: 1 },
  { schema: 'tx_styleguide_required_inline_1_child', uid: 1 },
  { schema: 'tx_styleguide_required_inline_2_child', uid: 1 },
  { schema: 'tx_styleguide_required_inline_3_child', uid: 1 },
  { schema: 'tx_styleguide_required', uid: 1 },
  { schema: 'tx_styleguide_required_rte_2_child', uid: 1 },
  { schema: 'tx_styleguide_staticdata', uid: 1 },
  { schema: 'tx_styleguide_typeforeign', uid: 1 },
  { schema: 'tx_styleguide_type', uid: 1 },
  { schema: 'tx_styleguide_valuesdefault', uid: 1 },
].forEach(({ schema, uid }) => {
  // You can also do it with test.describe() or with multiple tests as long the test name is unique.
  test(`Fetch ${schema}`, async () => {
    const res = await api.get(`records/${schema}/${uid}`);
    expect(res.ok()).toBeTruthy();
    expect(await res.json()).toEqual(expect.objectContaining({
      record: expect.any(Object)
    }));
  });
});

test('Get all tt_content records', async () => {
  const res = await api.get('records/tt_content');
  expect(res.ok()).toBeTruthy();
  const data = await res.json();
  expect(data).toEqual(expect.arrayContaining([
    expect.objectContaining({
      uid: expect.any(Number),
      label: expect.any(String),
    })
  ]));

  for (const record of data) {
    const { uid } = record;
    const res = await api.get(`records/tt_content/${uid}`);
    expect(res.ok()).toBeTruthy();
    expect(await res.json()).toEqual(expect.objectContaining({
      record: expect.any(Object)
    }));
  }
});
