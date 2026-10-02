import { test, expect } from '../../fixtures/setup-fixtures';

const recordTitle = 'Inline edit test';
const updatedRecordTitle = 'Inline edit test updated';

test('content element preview can be edited inline in the page module', async ({ backend, page }) => {
  await backend.gotoModule('web_layout');
  await backend.pageTree.open('styleguide TCA demo');

  await test.step('create a text content element', async () => {
    await backend.contentFrame.locator('typo3-backend-new-content-element-wizard-button').first().click();
    const wizard = page.locator('typo3-backend-new-record-wizard');
    await expect(wizard).toBeVisible();
    await wizard.evaluate((el: any) => el.shadowRoot.querySelector('button[data-identifier="default"]').click());
    await wizard.evaluate((el: any) => el.shadowRoot.querySelector('button[data-identifier="default_text"]').click());
    await backend.contentFrame
      .locator('xpath=//input[contains(@data-formengine-input-name, "data[tt_content]") and contains(@data-formengine-input-name, "[header]")]')
      .fill(recordTitle);
    await backend.formEngine.save();
    await backend.formEngine.close();
  });

  const contentElement = backend.contentFrame.locator('.t3js-page-ce').filter({ hasText: recordTitle }).first();
  const editButton = contentElement.locator('button[data-action="content-element-inline-edit"]');
  const inlineEdit = contentElement.locator('.t3-page-ce-inline-edit');
  const form = inlineEdit.locator('form[name="editform"]');
  const headerField = form.locator('input[data-formengine-input-name$="[header]"]');

  await test.step('the edit button turns the preview into a form with the relevant fields only', async () => {
    await expect(contentElement.locator('.t3-page-ce-header typo3-backend-contextual-record-edit-trigger')).toHaveCount(0);
    await editButton.click();
    await expect(headerField).toHaveValue(recordTitle);
    await expect(editButton).toHaveAttribute('aria-pressed', 'true');
    await expect(contentElement.locator('.t3-page-ce-body')).toBeHidden();
    await expect(form.locator('select[name$="[CType]"]')).toHaveCount(0);
    await expect(form.locator('select[name$="[colPos]"]')).toHaveCount(0);
  });

  await test.step('scrolling over the form scrolls the page module', async () => {
    await page.setViewportSize({ width: 1280, height: 500 });
    const scrollPosition = () => backend.contentFrame.locator('html').evaluate((el) => el.ownerDocument.scrollingElement.scrollTop);
    await headerField.hover();
    const initialScrollPosition = await scrollPosition();
    await page.mouse.wheel(0, 100);
    await expect.poll(scrollPosition).toBeGreaterThan(initialScrollPosition);
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  await test.step('clicking the edit button again discards the unchanged form', async () => {
    await editButton.click();
    await expect(inlineEdit).toHaveCount(0);
    await expect(contentElement.locator('.t3-page-ce-body')).toBeVisible();
    await expect(editButton).toHaveAttribute('aria-pressed', 'false');
  });

  await test.step('the linked title of the preview opens the form as well', async () => {
    await contentElement.locator('.t3-page-ce-body typo3-backend-contextual-record-edit-trigger').click();
    await expect(headerField).toHaveValue(recordTitle);
    await expect(page.locator('typo3-backend-modal')).toHaveCount(0);
    await editButton.click();
    await expect(inlineEdit).toHaveCount(0);
  });

  await test.step('discarding changes asks for confirmation', async () => {
    await editButton.click();
    await headerField.fill('Discarded header');
    await editButton.click();
    const dialog = page.getByRole('dialog', { name: 'Unsaved changes' });
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Discard changes' }).click();
    await expect(inlineEdit).toHaveCount(0);
    await expect(contentElement.locator('.t3-page-ce-body')).toContainText(recordTitle);
  });

  await test.step('saving and closing updates the preview in place', async () => {
    await editButton.click();
    await headerField.fill(updatedRecordTitle);
    await inlineEdit.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText(`Record "${updatedRecordTitle}" has been successfully saved.`)).toBeVisible();
    await expect(headerField).toHaveValue(updatedRecordTitle);
    await inlineEdit.getByRole('button', { name: 'Close' }).click();

    const updatedElement = backend.contentFrame.locator('.t3js-page-ce').filter({ hasText: updatedRecordTitle }).first();
    await expect(updatedElement.locator('.t3-page-ce-body')).toBeVisible();
    await expect(updatedElement.locator('.t3-page-ce-inline-edit')).toHaveCount(0);
  });
});
