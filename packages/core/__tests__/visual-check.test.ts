import { expect, test } from '@playwright/test';

import manifest from '../../../storybook-static/index.json' with { type: 'json' };

const filterStories = (stories) => stories.filter((story) => story.name === 'Test Bed');

function getStoryUrl(storybookUrl: string, id: string): string {
    const params = new URLSearchParams({ id, viewMode: 'story' });

    return `${storybookUrl}/iframe.html?${params.toString()}`;
}

async function navigate(page, storybookUrl, id) {
    try {
        const url = getStoryUrl(storybookUrl, id);

        await page.goto(url);
        await page.waitForFunction(() => document.fonts.ready);
        await page.waitForLoadState('networkidle');
        await page.waitForSelector('#storybook-root');
    } catch (error) {
        console.error(`Failed to navigate to story: ${id}`, error);
    }
}

const visualStories = filterStories(Object.values(manifest.entries));
const BASE_URL = 'http://localhost:9999';

visualStories.forEach((story) => {
    test(story.id, async ({ page }, meta) => {
        await navigate(page, BASE_URL, meta.title);

        await expect(page).toHaveScreenshot({
            fullPage: true,
            animations: 'disabled',
        });
    });
});
