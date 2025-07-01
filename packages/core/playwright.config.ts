import { defineConfig, devices } from '@playwright/test';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:9999';

export default defineConfig({
    testMatch: './__tests__/visual-check.test.ts',
    outputDir: `./__tests__/results/`,

    reporter: [
        ['html', { outputFolder: './__tests__/report' }],
        ['json', { outputFile: './__tests__/report/index.json' }],
    ],
    use: { baseURL: BASE_URL, trace: 'on' },
    projects: [
        { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
        { name: 'webkit', use: { ...devices['Desktop Safari'] } },
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'], channel: 'chrome' },
        },
        {
            name: 'Microsoft Edge',
            use: { ...devices['Desktop Edge'], channel: 'msedge' },
        },
    ],

    workers: process.env.CI ? 1 : undefined,

    webServer: {
        command: 'cd ../../ && pnpm storybook --port 9999',
        url: BASE_URL,
        reuseExistingServer: false,
    },
});
