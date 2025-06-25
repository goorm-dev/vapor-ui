import manifest from '../../../storybook-static/index.json' assert {type: 'json'};
import { expect, test } from '@playwright/test';

const filterStories = (stories) =>
    stories.filter((story) => story.tags.includes('visual:check') && story.tags.includes('story'));

function getStoryUrl(storybookUrl: string, id: string): string {
    const params = new URLSearchParams({ id, viewMode: 'story', nav: '0' });

    return `${storybookUrl}/iframe.html?${params.toString()}`;
}

async function navigate(page, storybookUrl, id) {
    try {
        const url = getStoryUrl(storybookUrl, id);

        await page.goto(url);
        await page.waitForLoadState('networkidle');
        await page.waitForSelector('#storybook-root');
    } catch (error) {
        console.error(`Failed to navigate to story: ${id}`, error);
    }
}

const visualStories = filterStories(Object.values(manifest.entries));
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:9999';

visualStories.forEach((story) => {
    test(story.id, async ({ page }, meta) => {
        await navigate(page, BASE_URL, meta.title);
        const upstreamScreenshot = `${meta.title}-upstream-${process.platform}.png`;
        const currentScreenshot = await page.screenshot({ fullPage: true, animations: 'disabled' });

        expect(currentScreenshot).toMatchSnapshot(upstreamScreenshot);
    });
});
