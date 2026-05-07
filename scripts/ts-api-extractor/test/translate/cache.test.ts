import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { CacheEntry } from '~/translate/cache';
import { loadCache, makeCacheKey, saveCache } from '~/translate/cache';
import type { TranslationConfig } from '~/translate/types';

function makeTmpDir(): string {
    return fs.mkdtempSync(path.join(os.tmpdir(), 'cache-test-'));
}

function makeConfig(
    overrides: Partial<{
        targetLocale: TranslationConfig['targetLocale'];
        llmEnabled: boolean;
        mqmEnabled: boolean;
        postprocessModel: string;
        validationModel: string;
    }> = {},
): TranslationConfig {
    return {
        enabled: true,
        skipCache: false,
        targetLocale: overrides.targetLocale ?? 'ko',
        llm: {
            enabled: overrides.llmEnabled ?? true,
            postprocessModel: overrides.postprocessModel ?? 'claude-sonnet-4-6',
            validationModel: overrides.validationModel ?? 'claude-sonnet-4-6',
        },
        validation: { mqm: { enabled: overrides.mqmEnabled ?? true, failOnError: false } },
    };
}

function key(
    source: string,
    configOverrides: Parameters<typeof makeConfig>[0] = {},
    glossaryId = '',
): string {
    return makeCacheKey(source, makeConfig(configOverrides), glossaryId);
}

describe('makeCacheKey', () => {
    it('same inputs produce same key (deterministic)', () => {
        expect(key('hello')).toBe(key('hello'));
    });

    it('different source produces different key', () => {
        expect(key('hello')).not.toBe(key('world'));
    });

    it('different glossaryId produces different key', () => {
        expect(key('hello')).not.toBe(key('hello', {}, 'glossary-123'));
    });

    it('different postprocessModel produces different key', () => {
        expect(key('hello')).not.toBe(key('hello', { postprocessModel: 'claude-opus-4-7' }));
    });

    it('different validationModel produces different key', () => {
        expect(key('hello')).not.toBe(key('hello', { validationModel: 'claude-opus-4-7' }));
    });

    it('different llmEnabled produces different key', () => {
        expect(key('hello')).not.toBe(key('hello', { llmEnabled: false }));
    });

    it('different mqmEnabled produces different key', () => {
        expect(key('hello')).not.toBe(key('hello', { mqmEnabled: false }));
    });

    it('returns sha256 hex string', () => {
        const k = key('hello');
        expect(typeof k).toBe('string');
        expect(k.length).toBe(64);
    });
});

describe('loadCache', () => {
    it('returns empty Map when outputDir is empty string', () => {
        expect(loadCache('')).toEqual(new Map());
    });

    it('returns empty Map when cache file does not exist', () => {
        const dir = makeTmpDir();
        expect(loadCache(dir)).toEqual(new Map());
        fs.rmSync(dir, { recursive: true });
    });

    it('returns populated Map when valid cache file exists', () => {
        const dir = makeTmpDir();
        const entry: CacheEntry = {
            source: 'hello',
            translated: '안녕',
        };
        const k = key('hello');
        fs.writeFileSync(path.join(dir, '.translation-cache.json'), JSON.stringify({ [k]: entry }));

        const store = loadCache(dir);
        expect(store.get(k)).toEqual(entry);
        fs.rmSync(dir, { recursive: true });
    });

    it('returns empty Map when cache file contains invalid JSON', () => {
        const dir = makeTmpDir();
        fs.writeFileSync(path.join(dir, '.translation-cache.json'), 'not-json{{');
        expect(loadCache(dir)).toEqual(new Map());
        fs.rmSync(dir, { recursive: true });
    });
});

describe('saveCache / loadCache roundtrip', () => {
    let tmpDir: string;

    beforeEach(() => {
        tmpDir = makeTmpDir();
    });

    afterEach(() => {
        fs.rmSync(tmpDir, { recursive: true });
    });

    it('written cache can be read back', () => {
        const store = new Map<string, CacheEntry>();
        const k = key('hello');
        store.set(k, {
            source: 'hello',
            translated: '안녕',
        });

        saveCache(tmpDir, store);
        const loaded = loadCache(tmpDir);

        expect(loaded.get(k)).toEqual({
            source: 'hello',
            translated: '안녕',
        });
    });

    it('does not throw when outputDir is empty string', () => {
        expect(() => saveCache('', new Map())).not.toThrow();
    });

    it('does not throw when outputDir is unwritable (logs warning instead)', () => {
        const fakePath = path.join(os.tmpdir(), `cache-test-block-${Date.now()}`);
        fs.writeFileSync(fakePath, '');
        try {
            const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
            expect(() => saveCache(fakePath, new Map())).not.toThrow();
            expect(warnSpy).toHaveBeenCalledOnce();
            warnSpy.mockRestore();
        } finally {
            fs.rmSync(fakePath);
        }
    });
});
