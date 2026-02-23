import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { DEFAULT_CONFIG, findConfigFile, getComponentConfig, loadConfig } from '~/config';
import type { ExtractorConfig } from '~/config';

const FIXTURES_DIR = path.join(__dirname, '../fixtures');

describe('findConfigFile', () => {
    it('should return undefined when no config file exists', () => {
        const result = findConfigFile(FIXTURES_DIR);
        expect(result).toBeUndefined();
    });
});

describe('loadConfig', () => {
    it('should return default config when noConfig is true', async () => {
        const result = await loadConfig({ noConfig: true });
        expect(result.source).toBe('default');
        expect(result.config).toEqual(DEFAULT_CONFIG);
    });

    it('should return default config when config file does not exist', async () => {
        const result = await loadConfig({ configPath: 'nonexistent.config.ts' });
        expect(result.source).toBe('default');
        expect(result.config).toEqual(DEFAULT_CONFIG);
    });

    it('should have default values for global config', async () => {
        const result = await loadConfig({ noConfig: true });
        expect(result.config.global.outputDir).toBe('./output');
        expect(result.config.global.languages).toEqual(['ko']);
        expect(result.config.global.defaultLanguage).toBe('ko');
        expect(result.config.global.filterExternal).toBe(true);
        expect(result.config.global.filterHtml).toBe(true);
    });
});

describe('getComponentConfig', () => {
    it('should return component config by file path', () => {
        const config: ExtractorConfig = {
            ...DEFAULT_CONFIG,
            components: {
                'button/button.tsx': {
                    include: ['customProp'],
                },
            },
        };

        const result = getComponentConfig(config, '/some/path/button/button.tsx');
        expect(result).toEqual({ include: ['customProp'] });
    });

    it('should return undefined for non-matching paths', () => {
        const config: ExtractorConfig = {
            ...DEFAULT_CONFIG,
            components: {
                'button/button.tsx': {
                    include: ['padding'],
                },
            },
        };

        const result = getComponentConfig(config, '/some/path/input/input.tsx');
        expect(result).toBeUndefined();
    });

    it('should handle partial path matching', () => {
        const config: ExtractorConfig = {
            ...DEFAULT_CONFIG,
            components: {
                'components/button.tsx': {
                    exclude: ['internalProp'],
                },
            },
        };

        const result = getComponentConfig(config, '/project/src/components/button.tsx');
        expect(result).toEqual({ exclude: ['internalProp'] });
    });
});
