import { defineConfig, devices } from '@playwright/test';

const BASE_URL = 'http://localhost:9999';

export default defineConfig({
    snapshotPathTemplate: './__tests__/screenshots/{arg}-{projectName}-{platform}-{ext}',
    testMatch: '__tests__/visual-check.test.ts',
    outputDir: `./__tests__/results/`,

    reporter: [
        [process.env.CI ? 'blob' : 'html', { outputFolder: './__tests__/report' }],
        ['json', { outputFile: './__tests__/report/index.json' }],
    ],
    use: { baseURL: BASE_URL, trace: 'on' },
    projects: [
        { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
        { name: 'webkit', use: { ...devices['Desktop Safari'] } },
        { name: 'chromium', use: { ...devices['Desktop Chrome'], channel: 'chrome' } },
        { name: 'Microsoft Edge', use: { ...devices['Desktop Edge'], channel: 'msedge' } },
    ],

    workers: 1,

    webServer: {
        command: 'cd ../../ && npx http-server -p 9999 ./storybook-static',
        url: BASE_URL,
        reuseExistingServer: false,
    },
});
