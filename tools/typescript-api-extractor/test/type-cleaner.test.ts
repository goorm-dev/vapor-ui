import { describe, expect, it } from 'vitest';

import { cleanType, containsStateCallback, simplifyStateCallback } from '~/core/type-cleaner';

describe('containsStateCallback', () => {
    it('detects state callback pattern', () => {
        const type = 'string | ((state: TabsRoot.State) => string) | undefined';
        expect(containsStateCallback(type)).toBe(true);
    });

    it('returns false for simple types', () => {
        expect(containsStateCallback('string')).toBe(false);
        expect(containsStateCallback('string | undefined')).toBe(false);
    });

    it('detects import path state callback', () => {
        const type =
            'string | ((state: import("/path/to/module").Component.State) => string) | undefined';
        expect(containsStateCallback(type)).toBe(true);
    });
});

describe('simplifyStateCallback', () => {
    it('replaces state callback with return type', () => {
        const type = 'string | ((state: TabsRoot.State) => string) | undefined';
        expect(simplifyStateCallback(type)).toBe('string | string | undefined');
    });

    it('handles import path state callback', () => {
        const type =
            'string | ((state: import("/path/to/module").Component.State) => string) | undefined';
        expect(simplifyStateCallback(type)).toBe('string | string | undefined');
    });

    it('preserves types without state callback', () => {
        expect(simplifyStateCallback('boolean | undefined')).toBe('boolean | undefined');
    });
});

describe('cleanType', () => {
    it('simplifies and removes duplicates', () => {
        const type = 'string | ((state: TabsRoot.State) => string) | undefined';
        expect(cleanType(type).type).toBe('string | undefined');
    });

    it('handles complex import paths', () => {
        const type =
            'string | ((state: import("/Users/goorm/design-system/gds/vapor-ui/node_modules/.pnpm/@base-ui-components+react@1.0.0-beta.4_@types+react@18.3.27_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui-components/react/esm/tabs/root/TabsRoot").TabsRoot.State) => string) | undefined';
        expect(cleanType(type).type).toBe('string | undefined');
    });

    it('preserves types without state callback', () => {
        expect(cleanType('"fill" | "line" | undefined').type).toBe('"fill" | "line" | undefined');
    });

    it('simplifies render prop with ComponentRenderFn', () => {
        const type =
            '((React.ReactElement<Record<string, unknown>> | ComponentRenderFn<HTMLProps<any>, TabsRoot.State>) & (React.ReactElement<Record<string, unknown>> | ComponentRenderFn<HTMLProps, {}>)) | undefined';
        expect(cleanType(type).type).toBe(
            'ReactElement | ((props: HTMLProps) => ReactElement) | undefined',
        );
    });

    it('compresses large unions with 10+ string literals', () => {
        const type = '"a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j"';
        const result = cleanType(type);
        expect(result.type).toBe('string (10 variants)');
        expect(result.values).toEqual(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']);
    });

    it('preserves undefined in compressed unions', () => {
        const type = '"a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j" | undefined';
        const result = cleanType(type);
        expect(result.type).toBe('string (10 variants) | undefined');
        expect(result.values).toHaveLength(10);
    });

    it('does not compress unions with fewer than 10 members', () => {
        const type = '"a" | "b" | "c"';
        const result = cleanType(type);
        expect(result.type).toBe('"a" | "b" | "c"');
        expect(result.values).toBeUndefined();
    });
});
