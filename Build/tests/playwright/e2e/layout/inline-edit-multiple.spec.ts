import type { Page } from '@playwright/test';
import { test, expect } from '../../fixtures/setup-fixtures';
import type { BackendPage } from '../../fixtures/backend-page';

const firstTitle = 'Edited at the same time 1';
const secondTitle = 'Edited at the same time 2';

async function createTextElement(backend: BackendPage, page: Page, title: string): Promise<void> {
  await backend.contentFrame.locator('typo3-backend-new-content-element-wizard-button').first().click();
  const wizard = page.locator('typo3-backend-new-record-wizard');
  await expect(wizard).toBeVisible();
  await wizard.evaluate((el: any) => el.shadowRoot.querySelector('button[data-identifier="default"]').click());
  await wizard.evaluate((el: any) => el.shadowRoot.querySelector('button[data-identifier="default_text"]').click());
  await backend.contentFrame
    .locator('xpath=//input[contains(@data-formengine-input-name, "data[tt_content]") and contains(@data-formengine-input-name, "[header]")]')
    .fill(title);
  await backend.formEngine.save();
  await backend.formEngine.close();
  await expect(backend.contentFrame.locator('.t3js-page-ce').filter({ hasText: title })).not.toHaveCount(0);
}

test('several content elements can be edited inline at the same time', async ({ backend, page }) => {
  await backend.gotoModule('web_layout');
  await backend.pageTree.open('styleguide TCA demo');
  await expect(backend.contentFrame.getByRole('heading', { name: 'styleguide TCA demo', level: 1 })).toBeVisible();

  await test.step('create two text content elements', async () => {
    await createTextElement(backend, page, firstTitle);
    await createTextElement(backend, page, secondTitle);
  });

  const elements = backend.contentFrame.locator('.t3js-page-ce[data-table="tt_content"]');
  const first = elements.filter({ hasText: firstTitle }).first();
  const second = elements.filter({ hasText: secondTitle }).first();
  const headerField = (element: typeof first) => element.locator('.t3-page-ce-inline-edit input[data-formengine-input-name$="[header]"]');

  await test.step('both elements are edited at the same time', async () => {
    await first.locator('button[data-action="content-element-inline-edit"]').press('Enter');
    await expect(headerField(first)).toHaveValue(firstTitle);
    await second.locator('button[data-action="content-element-inline-edit"]').press('Enter');
    await expect(headerField(second)).toHaveValue(secondTitle);
    await expect(headerField(first)).toHaveValue(firstTitle);
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  await test.step('the save shortcut saves the element edited last only', async () => {
    await headerField(first).fill(`${firstTitle} changed`);
    await headerField(second).fill(`${secondTitle} changed`);
    await headerField(second).press('ControlOrMeta+s');
    await expect(page.getByText(`Record "${secondTitle} changed" has been successfully saved.`)).toBeVisible();
    await expect(headerField(second)).toHaveValue(`${secondTitle} changed`);
    await expect(headerField(first)).toHaveValue(`${firstTitle} changed`);
    await expect(page.getByText(`Record "${firstTitle} changed" has been successfully saved.`)).toHaveCount(0);
  });

  await test.step('saving one element keeps the other one open with its changes', async () => {
    await first.locator('.t3-page-ce-header').getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.getByText(`Record "${firstTitle} changed" has been successfully saved.`)).toBeVisible();
    const savedFirst = elements.filter({ hasText: `${firstTitle} changed` }).first();
    await expect(savedFirst.locator('.t3-page-ce-inline-edit')).toHaveCount(0);
    await expect(headerField(second)).toHaveValue(`${secondTitle} changed`);
  });

  await test.step('the other element closes without confirmation, as it has been saved', async () => {
    await second.locator('.t3-page-ce-header').getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(second.locator('.t3-page-ce-inline-edit')).toHaveCount(0);
    await expect(page.getByRole('dialog', { name: 'Unsaved changes' })).toHaveCount(0);
  });

  await test.step('the doc header saves all elements with unsaved changes at once', async () => {
    const saveAll = backend.contentFrame.locator('.module-docheader .t3js-inline-edit-save-all');
    const changedFirst = elements.filter({ hasText: `${firstTitle} changed` }).first();
    const changedSecond = elements.filter({ hasText: `${secondTitle} changed` }).first();
    await expect(saveAll).toBeHidden();
    await changedFirst.locator('button[data-action="content-element-inline-edit"]').press('Enter');
    await changedSecond.locator('button[data-action="content-element-inline-edit"]').press('Enter');
    await headerField(changedFirst).fill(`${firstTitle} saved at once`);
    await expect(saveAll).toBeVisible();
    await expect(saveAll).toContainText('Save all (1)');
    await headerField(changedSecond).fill(`${secondTitle} saved at once`);
    await expect(saveAll).toContainText('Save all (2)');
    await saveAll.click();
    await expect(elements.filter({ hasText: `${firstTitle} saved at once` }).locator('.t3-page-ce-inline-edit')).toHaveCount(0);
    await expect(elements.filter({ hasText: `${secondTitle} saved at once` }).locator('.t3-page-ce-inline-edit')).toHaveCount(0);
    await expect(saveAll).toBeHidden();
  });
});
