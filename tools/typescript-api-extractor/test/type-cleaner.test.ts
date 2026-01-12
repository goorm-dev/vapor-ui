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
        expect(cleanType(type)).toBe('string | undefined');
    });

    it('handles complex import paths', () => {
        const type =
            'string | ((state: import("/Users/goorm/design-system/gds/vapor-ui/node_modules/.pnpm/@base-ui-components+react@1.0.0-beta.4_@types+react@18.3.27_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui-components/react/esm/tabs/root/TabsRoot").TabsRoot.State) => string) | undefined';
        expect(cleanType(type)).toBe('string | undefined');
    });

    it('preserves types without state callback', () => {
        expect(cleanType('"fill" | "line" | undefined')).toBe('"fill" | "line" | undefined');
    });

    it('simplifies render prop with ComponentRenderFn', () => {
        const type =
            '((React.ReactElement<Record<string, unknown>> | ComponentRenderFn<HTMLProps<any>, TabsRoot.State>) & (React.ReactElement<Record<string, unknown>> | ComponentRenderFn<HTMLProps, {}>)) | undefined';
        expect(cleanType(type)).toBe(
            'ReactElement | ((props: HTMLProps) => ReactElement) | undefined',
        );
    });
});
