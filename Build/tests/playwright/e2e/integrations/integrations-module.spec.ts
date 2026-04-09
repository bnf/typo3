import { test, expect } from '../../fixtures/setup-fixtures';
test('See integration modules', async ({ backend }) => {
  await backend.gotoModule('integrations');
  await expect(backend.contentFrame.locator('h1')).toContainText('Integrations');
  const menuItems = [
    {
      title: 'API Hub',
      shortDescription: 'Configure TYPO3 API clients',
    },
    {
      title: 'Reactions',
      shortDescription: 'Manage incoming HTTP webhooks to external system',
    },
    {
      title: 'Webhooks',
      shortDescription: 'Manage outgoing HTTP webhooks to external system',
    },
  ];
  for (const menuItem of menuItems) {
    await backend.gotoModule('integrations');
    await test.step(`Status module "${menuItem.title}" is available`, async () => {
      await expect(backend.contentFrame.getByRole('heading', { name: menuItem.title })).toBeVisible();
      await expect(backend.contentFrame.getByText(menuItem.shortDescription)).toBeVisible();
      await expect(backend.contentFrame.locator(`[aria-label='Open ${menuItem.title} module']`)).toBeVisible();
      await backend.contentFrame.locator(`[aria-label='Open ${menuItem.title} module']`).click();
      await expect(backend.contentFrame.locator('h1')).toContainText(menuItem.title, { ignoreCase: true });
    });
  }
});

test('See API documentation in API Hub module', async ({ backend }) => {
  await backend.gotoModule('integrations');
  await backend.contentFrame.locator('[aria-label="Open API Hub module"]').click();
  await backend.contentFrame.locator('.t3js-module-docheader-buttons').getByRole('button', { name: 'API documentation' }).click();

  const swagger = backend.contentFrame.locator('typo3-backend-swagger');
  await expect(swagger.locator('.opblock-get [data-path="/v1/schema"]')).toBeVisible();
  // The HTTP API does not contain endpoints of the backend user interface
  await expect(swagger.locator('[data-path="/v1/app/secret/generate"]')).toHaveCount(0);
});
