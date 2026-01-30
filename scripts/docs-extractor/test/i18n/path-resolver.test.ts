import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { getTargetLanguages, resolveAllLanguagePaths, resolveOutputPath } from '~/i18n/path-resolver';

describe('resolveOutputPath', () => {
    const options = {
        outputDir: './output',
        languages: ['ko', 'en'],
        defaultLanguage: 'ko',
    };

    it('should resolve path with language directory', () => {
        const result = resolveOutputPath('button.json', 'ko', options);
        expect(result).toBe(path.join('./output', 'ko', 'button.json'));
    });

    it('should handle different languages', () => {
        const result = resolveOutputPath('button.json', 'en', options);
        expect(result).toBe(path.join('./output', 'en', 'button.json'));
    });
});

describe('resolveAllLanguagePaths', () => {
    const options = {
        outputDir: './output',
        languages: ['ko', 'en', 'ja'],
        defaultLanguage: 'ko',
    };

    it('should return paths for all languages', () => {
        const result = resolveAllLanguagePaths('button.json', options);

        expect(result.size).toBe(3);
        expect(result.get('ko')).toBe(path.join('./output', 'ko', 'button.json'));
        expect(result.get('en')).toBe(path.join('./output', 'en', 'button.json'));
        expect(result.get('ja')).toBe(path.join('./output', 'ja', 'button.json'));
    });
});

describe('getTargetLanguages', () => {
    const config = {
        outputDir: './output',
        languages: ['ko', 'en', 'ja'],
        defaultLanguage: 'ko',
    };

    it('should return default language when no option provided', () => {
        const result = getTargetLanguages(undefined, config);
        expect(result).toEqual(['ko']);
    });

    it('should return default language when option matches default', () => {
        const result = getTargetLanguages('ko', config);
        expect(result).toEqual(['ko']);
    });

    it('should return all languages when option is "all"', () => {
        const result = getTargetLanguages('all', config);
        expect(result).toEqual(['ko', 'en', 'ja']);
    });

    it('should return specific language when valid', () => {
        const result = getTargetLanguages('en', config);
        expect(result).toEqual(['en']);
    });

    it('should use explicitly specified language even if not in config', () => {
        const result = getTargetLanguages('fr', config);
        expect(result).toEqual(['fr']);
    });
});
