import { describe, expect, it } from 'vitest';

import { buildColorSchemeScript } from './fouc-script';

describe('buildColorSchemeScript', () => {
    it('returns an IIFE string wrapped in try/catch', () => {
        const s = buildColorSchemeScript();
        expect(s).toMatch(/^\(function\(\)\{try\{/);
        expect(s).toMatch(/\}catch\(e\)\{\}\}\)\(\);$/);
    });

    it('uses default keys when no opts', () => {
        const s = buildColorSchemeScript();
        expect(s).toContain('"vapor-ui-theme"');
        expect(s).toContain('"data-vapor-theme"');
        expect(s).toContain('"system"');
    });

    it('honors custom storageKey/attribute/defaultTheme', () => {
        const s = buildColorSchemeScript({
            storageKey: 'my-key',
            attribute: 'data-my-theme',
            defaultTheme: 'dark',
        });
        expect(s).toContain('"my-key"');
        expect(s).toContain('"data-my-theme"');
        expect(s).toContain('"dark"');
        // defaults should not leak.
        expect(s).not.toContain('"vapor-theme"');
    });

    it('JSON-encodes string values to guard against injection', () => {
        const s = buildColorSchemeScript({ storageKey: 'k"; malicious();//' });
        // 실제 실행 환경에서는 이 문자열이 JS literal 안에서만 존재해야 함.
        expect(s).toContain('"k\\"; malicious();//"');
        expect(s).not.toContain('k"; malicious();//');
    });

    it('picks localStorage value first, then prefers-color-scheme, then default', () => {
        const s = buildColorSchemeScript();
        // 순서: getItem → matchMedia fallback → default.
        const getItemIdx = s.indexOf('getItem');
        const matchMediaIdx = s.indexOf('matchMedia');
        const setAttrIdx = s.indexOf('setAttribute');
        expect(getItemIdx).toBeGreaterThan(-1);
        expect(matchMediaIdx).toBeGreaterThan(getItemIdx);
        expect(setAttrIdx).toBeGreaterThan(matchMediaIdx);
    });

    it('script actually sets attribute when eval-ed in a stub DOM', () => {
        const setAttrCalls: Array<[string, string]> = [];
        const fakeWindow = {
            matchMedia: (_q: string) => ({ matches: false }),
        };
        const fakeLocalStorage = {
            getItem: (_k: string) => 'dark',
        };
        const fakeDocument = {
            documentElement: {
                setAttribute: (name: string, value: string) => {
                    setAttrCalls.push([name, value]);
                },
            },
        };
        const s = buildColorSchemeScript();
        // eslint-disable-next-line no-new-func
        new Function('window', 'localStorage', 'document', s)(
            fakeWindow,
            fakeLocalStorage,
            fakeDocument,
        );
        expect(setAttrCalls).toEqual([['data-vapor-theme', 'dark']]);
    });

    it('falls back to system preference when localStorage is empty and default=system', () => {
        const setAttrCalls: Array<[string, string]> = [];
        const fakeWindow = {
            matchMedia: (_q: string) => ({ matches: true }), // prefers-color-scheme: dark
        };
        const fakeLocalStorage = {
            getItem: (_k: string) => null,
        };
        const fakeDocument = {
            documentElement: {
                setAttribute: (name: string, value: string) => {
                    setAttrCalls.push([name, value]);
                },
            },
        };
        const s = buildColorSchemeScript({ defaultTheme: 'system' });
        // eslint-disable-next-line no-new-func
        new Function('window', 'localStorage', 'document', s)(
            fakeWindow,
            fakeLocalStorage,
            fakeDocument,
        );
        expect(setAttrCalls).toEqual([['data-vapor-theme', 'dark']]);
    });

    it('falls back to explicit default when localStorage empty and default !== system', () => {
        const setAttrCalls: Array<[string, string]> = [];
        const fakeWindow = {
            matchMedia: (_q: string) => ({ matches: true }),
        };
        const fakeLocalStorage = {
            getItem: (_k: string) => null,
        };
        const fakeDocument = {
            documentElement: {
                setAttribute: (name: string, value: string) => {
                    setAttrCalls.push([name, value]);
                },
            },
        };
        const s = buildColorSchemeScript({ defaultTheme: 'light' });
        // eslint-disable-next-line no-new-func
        new Function('window', 'localStorage', 'document', s)(
            fakeWindow,
            fakeLocalStorage,
            fakeDocument,
        );
        expect(setAttrCalls).toEqual([['data-vapor-theme', 'light']]);
    });
});
