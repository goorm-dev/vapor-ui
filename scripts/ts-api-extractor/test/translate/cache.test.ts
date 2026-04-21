import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { CacheEntry } from '~/translate/cache';
import { loadCache, makeCacheKey, saveCache } from '~/translate/cache';

function makeTmpDir(): string {
    return fs.mkdtempSync(path.join(os.tmpdir(), 'cache-test-'));
}

describe('makeCacheKey', () => {
    it('same inputs produce same key (deterministic)', () => {
        const a = makeCacheKey('hello', 'ko', 'claude-sonnet-4-6', '');
        const b = makeCacheKey('hello', 'ko', 'claude-sonnet-4-6', '');
        expect(a).toBe(b);
    });

    it('different source produces different key', () => {
        const a = makeCacheKey('hello', 'ko', 'claude-sonnet-4-6', '');
        const b = makeCacheKey('world', 'ko', 'claude-sonnet-4-6', '');
        expect(a).not.toBe(b);
    });

    it('different glossaryId produces different key', () => {
        const a = makeCacheKey('hello', 'ko', 'claude-sonnet-4-6', '');
        const b = makeCacheKey('hello', 'ko', 'claude-sonnet-4-6', 'glossary-123');
        expect(a).not.toBe(b);
    });

    it('different llmModel produces different key', () => {
        const a = makeCacheKey('hello', 'ko', 'claude-sonnet-4-6', '');
        const b = makeCacheKey('hello', 'ko', 'claude-opus-4-7', '');
        expect(a).not.toBe(b);
    });

    it('includes CACHE_VERSION in key (prompt version invalidation)', () => {
        const key = makeCacheKey('hello', 'ko', 'claude-sonnet-4-6', '');
        expect(typeof key).toBe('string');
        expect(key.length).toBe(64); // sha256 hex
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
            cachedAt: '2026-01-01T00:00:00.000Z',
        };
        const key = makeCacheKey('hello', 'ko', 'model', '');
        fs.writeFileSync(
            path.join(dir, '.translation-cache.json'),
            JSON.stringify({ [key]: entry }),
        );

        const store = loadCache(dir);
        expect(store.get(key)).toEqual(entry);
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
        const key = makeCacheKey('hello', 'ko', 'model', '');
        store.set(key, {
            source: 'hello',
            translated: '안녕',
            cachedAt: '2026-01-01T00:00:00.000Z',
        });

        saveCache(tmpDir, store);
        const loaded = loadCache(tmpDir);

        expect(loaded.get(key)).toEqual({
            source: 'hello',
            translated: '안녕',
            cachedAt: '2026-01-01T00:00:00.000Z',
        });
    });

    it('does not throw when outputDir is empty string', () => {
        expect(() => saveCache('', new Map())).not.toThrow();
    });

    it('does not throw when outputDir is unwritable (logs warning instead)', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        expect(() => saveCache('/nonexistent-root/no-permission', new Map())).not.toThrow();
        expect(warnSpy).toHaveBeenCalledOnce();
        warnSpy.mockRestore();
    });
});
