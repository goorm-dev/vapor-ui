import { defineConfig, devices } from '@playwright/test';

const BASE_URL = 'http://localhost:9999';

export default defineConfig({
    snapshotPathTemplate: './__tests__/screenshots/{arg}-{projectName}-{platform}-{ext}',
    testMatch: '__tests__/regressions.test.ts',
    outputDir: `./__tests__/results/`,

    reporter: [
        process.env.CI ? ['blob'] : ['html', { outputFolder: './__tests__/report' }],
        ['json', { outputFile: './__tests__/report/index.json' }],
    ],
    use: { baseURL: BASE_URL, trace: 'on' },
    projects: [
        { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
        { name: 'safari', use: { ...devices['Desktop Safari'] } },
        { name: 'chrome', use: { ...devices['Desktop Chrome'] } },
        { name: 'edge', use: { ...devices['Desktop Edge'] } },
    ],

    fullyParallel: true,
    workers: process.env.CI ? 2 : undefined,

    webServer: {
        command: 'npx http-server -p 9999 ../../apps/storybook/storybook-static',
        url: BASE_URL,
        reuseExistingServer: false,
    },
});
