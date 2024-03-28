import { expect, test } from '@playwright/test';
import { collectStats, assetExpect } from '../index';

test('has title', async ({ page }) => {
  const stats = await collectStats(page, async () => {
    await page.goto('https://playwright.dev/');
  })

  assetExpect(stats).toHaveAssetsLessThan('script', 2000)

  await expect(page).toHaveTitle(/Playwright/);
});