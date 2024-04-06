import { expect, test } from '@playwright/test';
import { collectStats, assetExpect } from '../index';

test('Maintains proper asset size', async ({ page }) => {
  const stats = await collectStats(page, async () => {
    await page.goto('https://playwright.dev/');
  })

  assetExpect(stats).toHaveAssetsLessThan('script', 180, { unit: "kb" })

  await expect(page).toHaveTitle(/Playwright/);
});
