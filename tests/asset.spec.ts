import { expect, test } from '@playwright/test';
import { collectAssetStats, expect as assetExpect } from 'index';

test('has title', async ({ page }) => {
  const stats = await collectAssetStats(page, async () => {
    await page.goto('https://playwright.dev/');
  })

  assetExpect(stats).toHaveAssetsLessThan('script', 2000)

  await expect(page).toHaveTitle(/Playwright/);
});

test.skip('get started link', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  // Click the get started link.
  await page.getByRole('link', { name: 'Get started' }).click();

  // Expects page to have a heading with the name of Installation.
  await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
});
