import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { loadCache, makeCacheKey, saveCache } from '~/cache/cache';

function makeTmpDir(): string {
    return fs.mkdtempSync(path.join(os.tmpdir(), 'cache-test-'));
}

function key(source: string): string {
    return makeCacheKey(source);
}

describe('makeCacheKey', () => {
    it('same inputs produce same key (deterministic)', () => {
        expect(key('hello')).toBe(key('hello'));
    });

    it('different source produces different key', () => {
        expect(key('hello')).not.toBe(key('world'));
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
        const k = key('hello');
        fs.writeFileSync(
            path.join(dir, '.translation-cache.json'),
            JSON.stringify({ [k]: '안녕' }),
        );

        const store = loadCache(dir);
        expect(store.get(k)).toBe('안녕');
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
        const k = key('hello');
        const store = new Map([[k, '안녕']]);

        saveCache(tmpDir, store);

        expect(loadCache(tmpDir).get(k)).toBe('안녕');
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
