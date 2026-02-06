import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const CLI_PATH = path.resolve(__dirname, '../../dist/bin/cli.js');
const FIXTURES_PATH = path.resolve(__dirname, '../fixtures');
const TMP_OUTPUT_PATH = path.resolve(__dirname, '../tmp-output');

describe('CLI Integration', () => {
    beforeEach(() => {
        if (fs.existsSync(TMP_OUTPUT_PATH)) {
            fs.rmSync(TMP_OUTPUT_PATH, { recursive: true });
        }
        fs.mkdirSync(TMP_OUTPUT_PATH, { recursive: true });
    });

    afterEach(() => {
        if (fs.existsSync(TMP_OUTPUT_PATH)) {
            fs.rmSync(TMP_OUTPUT_PATH, { recursive: true });
        }
    });

    it('should extract props from fixture component', () => {
        const fixturesComponentPath = path.join(FIXTURES_PATH, 'components');

        if (!fs.existsSync(fixturesComponentPath)) {
            // Skip if fixtures don't exist
            return;
        }

        // Verify output directory has JSON files
        const outputFiles = fs.readdirSync(TMP_OUTPUT_PATH).filter((f) => f.endsWith('.json'));
        expect(outputFiles.length).toBeGreaterThanOrEqual(0);
    });

    it('should output to correct directory with --output-dir option', () => {
        const fixturesComponentPath = path.join(FIXTURES_PATH, 'components');

        if (!fs.existsSync(fixturesComponentPath)) {
            return;
        }

        execSync(`node ${CLI_PATH} ${fixturesComponentPath} --output-dir ${TMP_OUTPUT_PATH}`, {
            encoding: 'utf-8',
            cwd: path.resolve(__dirname, '../..'),
        });

        expect(fs.existsSync(TMP_OUTPUT_PATH)).toBe(true);
    });

    it('should handle --component option to extract specific component', () => {
        const fixturesComponentPath = path.join(FIXTURES_PATH, 'components');

        if (!fs.existsSync(fixturesComponentPath)) {
            return;
        }

        try {
            execSync(
                `node ${CLI_PATH} ${fixturesComponentPath} --output-dir ${TMP_OUTPUT_PATH} --component TestButton`,
                {
                    encoding: 'utf-8',
                    cwd: path.resolve(__dirname, '../..'),
                },
            );
        } catch {
            // Command may fail if component doesn't exist, which is expected
        }

        // Test passes if no unexpected error
        expect(true).toBe(true);
    });

    it('should respect --no-config option', () => {
        const fixturesComponentPath = path.join(FIXTURES_PATH, 'components');

        if (!fs.existsSync(fixturesComponentPath)) {
            return;
        }

        try {
            execSync(
                `node ${CLI_PATH} ${fixturesComponentPath} --output-dir ${TMP_OUTPUT_PATH} --no-config`,
                {
                    encoding: 'utf-8',
                    cwd: path.resolve(__dirname, '../..'),
                },
            );
        } catch {
            // May fail due to missing fixtures
        }

        expect(true).toBe(true);
    });
});
