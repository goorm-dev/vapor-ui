import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import {
    clearCache,
    getAllSprinklesProps,
    getNonTokenSprinklesProps,
    getTokenSprinklesProps,
    isSprinklesProp,
    isTokenBasedSprinklesProp,
    loadSprinklesMeta,
} from '~/core/defaults';

const FIXTURES_DIR = path.join(__dirname, '../fixtures');
const META_PATH = path.join(FIXTURES_DIR, 'sprinkles-meta.json');

afterEach(() => {
    clearCache();
});

describe('loadSprinklesMeta', () => {
    it('should load sprinkles metadata from file', () => {
        const meta = loadSprinklesMeta(META_PATH);

        expect(meta).not.toBeNull();
        expect(meta!.tokenProps).toContain('padding');
        expect(meta!.nonTokenProps).toContain('display');
    });

    it('should return null when file does not exist', () => {
        const meta = loadSprinklesMeta('/nonexistent/path/sprinkles-meta.json');
        expect(meta).toBeNull();
    });

    it('should cache metadata after first load', () => {
        const meta1 = loadSprinklesMeta(META_PATH);
        const meta2 = loadSprinklesMeta(META_PATH);

        expect(meta1).toBe(meta2); // Same reference
    });
});

describe('isTokenBasedSprinklesProp', () => {
    it('should return true for token-based props', () => {
        const meta = loadSprinklesMeta(META_PATH)!;

        expect(isTokenBasedSprinklesProp('padding', meta)).toBe(true);
        expect(isTokenBasedSprinklesProp('margin', meta)).toBe(true);
        expect(isTokenBasedSprinklesProp('color', meta)).toBe(true);
    });

    it('should return false for non-token props', () => {
        const meta = loadSprinklesMeta(META_PATH)!;

        expect(isTokenBasedSprinklesProp('display', meta)).toBe(false);
        expect(isTokenBasedSprinklesProp('position', meta)).toBe(false);
    });

    it('should return false for unknown props', () => {
        const meta = loadSprinklesMeta(META_PATH)!;

        expect(isTokenBasedSprinklesProp('unknownProp', meta)).toBe(false);
    });
});

describe('isSprinklesProp', () => {
    it('should return true for any sprinkles prop', () => {
        const meta = loadSprinklesMeta(META_PATH)!;

        expect(isSprinklesProp('padding', meta)).toBe(true);
        expect(isSprinklesProp('display', meta)).toBe(true);
    });

    it('should return false for non-sprinkles props', () => {
        const meta = loadSprinklesMeta(META_PATH)!;

        expect(isSprinklesProp('onClick', meta)).toBe(false);
        expect(isSprinklesProp('children', meta)).toBe(false);
    });
});

describe('getAllSprinklesProps', () => {
    it('should return all sprinkles props', () => {
        const meta = loadSprinklesMeta(META_PATH)!;
        const allProps = getAllSprinklesProps(meta);

        expect(allProps).toContain('padding');
        expect(allProps).toContain('display');
        expect(allProps.length).toBe(meta.tokenProps.length + meta.nonTokenProps.length);
    });
});

describe('getTokenSprinklesProps', () => {
    it('should return only token-based props', () => {
        const meta = loadSprinklesMeta(META_PATH)!;
        const tokenProps = getTokenSprinklesProps(meta);

        expect(tokenProps).toContain('padding');
        expect(tokenProps).not.toContain('display');
    });
});

describe('getNonTokenSprinklesProps', () => {
    it('should return only non-token props', () => {
        const meta = loadSprinklesMeta(META_PATH)!;
        const nonTokenProps = getNonTokenSprinklesProps(meta);

        expect(nonTokenProps).toContain('display');
        expect(nonTokenProps).not.toContain('padding');
    });
});
