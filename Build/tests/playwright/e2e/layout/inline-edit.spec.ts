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
    await backend.contentFrame.locator('html').evaluate((el) => el.ownerDocument.scrollingElement.scrollTo({ top: 0, behavior: 'instant' }));
  });

  await test.step('clicking the edit button again discards the unchanged form', async () => {
    await editButton.click();
    await expect(inlineEdit).toHaveCount(0);
    await expect(contentElement.locator('.t3-page-ce-body')).toBeVisible();
    await expect(editButton).toHaveAttribute('aria-pressed', 'false');
    await expect(editButton).toBeFocused();
  });

  await test.step('the linked title of the preview opens the form as well', async () => {
    const previewLink = contentElement.locator('.t3-page-ce-body typo3-backend-contextual-record-edit-trigger');
    await previewLink.click();
    await expect(headerField).toHaveValue(recordTitle);
    await expect(page.locator('typo3-backend-modal')).toHaveCount(0);
    await headerField.press('Escape');
    await expect(inlineEdit).toHaveCount(0);
    await expect(previewLink).toBeFocused();
  });

  await test.step('a double click on the preview opens the form, which returns the focus to the element', async () => {
    await contentElement.locator('.t3-page-ce-body').dblclick();
    await expect(headerField).toHaveValue(recordTitle);
    await headerField.press('Escape');
    await expect(inlineEdit).toHaveCount(0);
    await expect(contentElement).toBeFocused();
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

  await test.step('discarding an unchanged form closes it without confirmation', async () => {
    await editButton.press('Enter');
    await inlineEdit.getByRole('button', { name: 'Discard' }).click();
    await expect(inlineEdit).toHaveCount(0);
    await expect(page.getByRole('dialog', { name: 'Unsaved changes' })).toHaveCount(0);
  });

  await test.step('escape closes the form and asks about unsaved changes', async () => {
    await editButton.press('Enter');
    await headerField.fill('Header changed before escape');
    await headerField.press('Escape');
    const dialog = page.getByRole('dialog', { name: 'Unsaved changes' });
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Keep editing' }).click();
    await expect(headerField).toHaveValue('Header changed before escape');
    await expect(headerField).toBeFocused();
    await expect(dialog).toHaveCount(0);
    await headerField.press('Escape');
    await page.getByRole('dialog', { name: 'Unsaved changes' }).getByRole('button', { name: 'Discard changes' }).click();
    await expect(inlineEdit).toHaveCount(0);
    await expect(editButton).toBeFocused();

    await editButton.press('Enter');
    await headerField.press('Escape');
    await expect(inlineEdit).toHaveCount(0);
  });

  await test.step('the save shortcut keeps the form open', async () => {
    await editButton.press('Enter');
    await headerField.fill(`${recordTitle} saved`);
    await headerField.press('ControlOrMeta+s');
    await expect(page.getByText(`Record "${recordTitle} saved" has been successfully saved.`)).toBeVisible();
    await expect(inlineEdit).not.toHaveAttribute('aria-busy');
    await expect(headerField).toHaveValue(`${recordTitle} saved`);
    await expect(headerField).toBeFocused();
  });

  await test.step('saving closes the form and updates the preview in place', async () => {
    await headerField.fill(updatedRecordTitle);
    await inlineEdit.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText(`Record "${updatedRecordTitle}" has been successfully saved.`)).toBeVisible();

    const updatedElement = backend.contentFrame.locator('.t3js-page-ce').filter({ hasText: updatedRecordTitle }).first();
    await expect(updatedElement.locator('.t3-page-ce-body')).toContainText(updatedRecordTitle);
    await expect(updatedElement.locator('.t3-page-ce-inline-edit')).toHaveCount(0);
    await expect(updatedElement.locator('button[data-action="content-element-inline-edit"]')).toBeFocused();
  });
});
