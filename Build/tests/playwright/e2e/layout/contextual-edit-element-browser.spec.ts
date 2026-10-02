import { test, expect } from '../../fixtures/setup-fixtures';

// The page module contains a FormEngine form for inline editing itself, which
// must not receive what is selected in the element browser of the contextual
// edit sheet opened on top of it.
const recordTitle = 'Element browser in the contextual edit sheet';

test('element browser of the contextual edit sheet adds to the sheet', async ({ backend, page }) => {
  await backend.gotoModule('web_layout');
  await backend.pageTree.open('styleguide TCA demo');
  await expect(backend.contentFrame.getByRole('heading', { name: 'styleguide TCA demo', level: 1 })).toBeVisible();

  await test.step('create a text & images content element', async () => {
    await backend.contentFrame.locator('typo3-backend-new-content-element-wizard-button').first().click();
    const wizard = page.locator('typo3-backend-new-record-wizard');
    await expect(wizard).toBeVisible();
    await wizard.evaluate((el: any) => el.shadowRoot.querySelector('button[data-identifier="default"]').click());
    await wizard.evaluate((el: any) => el.shadowRoot.querySelector('button[data-identifier="default_textpic"]').click());
    await backend.contentFrame
      .locator('xpath=//input[contains(@data-formengine-input-name, "data[tt_content]") and contains(@data-formengine-input-name, "[header]")]')
      .fill(recordTitle);
    await backend.formEngine.save();
    await backend.formEngine.close();
    await expect(backend.contentFrame.locator('.t3js-page-ce').filter({ hasText: recordTitle })).not.toHaveCount(0);
  });

  const sheet = page.frameLocator('typo3-backend-modal iframe[name="modal_frame"]').first();

  await test.step('open the element in the contextual edit sheet', async () => {
    const contentElement = backend.contentFrame.locator('.t3js-page-ce').filter({ hasText: recordTitle }).first();
    await contentElement.locator('button[data-action="content-element-inline-edit"]').press('Enter');
    await contentElement.locator('.t3-page-ce-header .t3js-inline-edit-full').press('Enter');
    await expect(sheet.getByText(recordTitle).first()).toBeVisible();
  });

  await test.step('a file selected in the element browser is added to the sheet', async () => {
    await sheet.getByRole('tab', { name: 'Images', exact: true }).click();
    await sheet.getByRole('button', { name: 'Add image' }).first().click();
    const elementBrowser = page.frameLocator('typo3-backend-modal iframe[name="modal_frame"]').last();
    await elementBrowser.locator('.nodes-container .nodes-list [role="treeitem"][title="styleguide"]').click();
    await expect(elementBrowser.getByText('fileadmin: /styleguide/')).toBeVisible();
    await elementBrowser.getByText('bus_lane.jpg', { exact: true }).first().click();
    await expect(sheet.getByText('bus_lane.jpg').first()).toBeVisible();
  });
});
