import { expect, test } from '@playwright/test';

test('flex', async ({ page }) => {
    const params = new URLSearchParams({
        id: 'flex--test-bed',
        viewMode: 'story',
    });

    await page.goto(`/iframe.html?${params.toString()}`);
    await page.waitForSelector('#storybook-root');
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveScreenshot({
        fullPage: true,
        animations: 'disabled',
    });
});
