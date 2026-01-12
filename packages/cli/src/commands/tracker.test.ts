import fs from 'node:fs';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { collectUsages } from './tracker';

// --- Mocks ---
vi.mock('node:fs', async () => ({
    default: {
        existsSync: vi.fn(),
        statSync: vi.fn(),
        readFileSync: vi.fn(),
    },
}));

// vi.mock('get-tsconfig', () => ({
//     getTsconfig: vi.fn(),
//     createPathsMatcher: vi.fn(),
// }));

describe('collectUsages', () => {
    const fsReadFileSyncMockFunction = vi.spyOn(fs, 'readFileSync');
    const fsExistsSyncMockFunction = vi.spyOn(fs, 'existsSync');
    const fsStatSyncMockFunction = vi.spyOn(fs, 'statSync');

    beforeAll(() => {
        fsStatSyncMockFunction.mockReturnValue({
            isDirectory: () => false,
            isFile: () => true,
        } as fs.Stats);
    });

    afterAll(() => {
        fsReadFileSyncMockFunction.mockClear();
        fsExistsSyncMockFunction.mockClear();
        fsStatSyncMockFunction.mockClear();
    });

    it('should return empty map if queue is empty', () => {
        const stats = collectUsages({
            shallow: true,
            pathsMatcher: null,
            queue: [],
        });

        expect(stats.size).toBe(0);
    });

    it('should count components correctly in shallow mode', () => {
        // Setup mock file
        const mockFile = '/mock/cwd/src/App.tsx';
        const mockCode = `
            import { Button } from '@vapor-ui/core';
            export const App = () => <Button>Click me</Button>;
        `;

        fsReadFileSyncMockFunction.mockReturnValue(mockCode);

        const stats = collectUsages({
            shallow: true,
            pathsMatcher: null,
            queue: [mockFile],
        });

        expect(stats.get('Button')).toBe(1);
    });

    it('should handle aliases correctly (e.g. Button as VaporButton)', () => {
        const mockFile = '/mock/cwd/src/Alias.tsx';
        const mockCode = `
            import { Button as VaporButton } from '@vapor-ui/core';
            export const App = () => <VaporButton />;
        `;

        fsReadFileSyncMockFunction.mockReturnValue(mockCode);

        const stats = collectUsages({
            shallow: true,
            pathsMatcher: null,
            queue: [mockFile],
        });

        expect(stats.get('Button')).toBe(1);
    });

    it('should count multiple different components in a single file', () => {
        const mockFile = '/mock/cwd/src/Multiple.tsx';
        const mockCode = `
            import { Button, Alert } from '@vapor-ui/core';
            export const App = () => (
                <>
                    <Button>One</Button>
                    <Alert>Warning</Alert>
                    <Button>Two</Button>
                </>
            );
        `;

        fsReadFileSyncMockFunction.mockReturnValue(mockCode);

        const stats = collectUsages({
            shallow: true,
            pathsMatcher: null,
            queue: [mockFile],
        });

        expect(stats.get('Button')).toBe(2);
        expect(stats.get('Alert')).toBe(1);
    });

    it('should aggregate usage counts across multiple files', () => {
        const file1 = '/mock/cwd/src/Page1.tsx';
        const file2 = '/mock/cwd/src/Page2.tsx';

        fsReadFileSyncMockFunction.mockImplementation((path) => {
            if (path === file1) {
                return `
                    import { Button } from '@vapor-ui/core';
                    export const C1 = () => <Button />;
                `;
            }

            if (path === file2) {
                return `
                    import { Button, TextField } from '@vapor-ui/core';
                    export const C2 = () => <><Button /><TextField /></>;
                `;
            }

            return '';
        });

        const stats = collectUsages({
            shallow: true,
            pathsMatcher: null,
            queue: [file1, file2],
        });

        expect(stats.get('Button')).toBe(2);
        expect(stats.get('TextField')).toBe(1);
    });

    it('Lazy Loading (Dynamic Import Traversal)', () => {
        const appPath = '/params/App.tsx';
        const lazyPath = '/params/LazyComp.tsx';

        const appContent = `
            import { lazy } from 'react';
            const LazyComp = lazy(() => import('./LazyComp'));
            export const App = () => <LazyComp />;
        `;
        const lazyContent = `
            import { Button } from '@vapor-ui/core';
            export default () => <Button />;
        `;

        fsReadFileSyncMockFunction.mockImplementation((path) => {
            if (path === appPath) {
                return appContent;
            }

            if (path === lazyPath) {
                return lazyContent;
            }

            return '';
        });

        fsExistsSyncMockFunction.mockImplementation((path) => {
            return path === appPath || path === lazyPath;
        });

        const usageMap = collectUsages({
            shallow: false,
            pathsMatcher: null,
            queue: [appPath],
        });

        expect(usageMap.has('Button')).toBe(true);
        expect(usageMap.get('Button')).toBe(1);
    });

    it('Next.js Dynamic Import Traversal', () => {
        const appPath = '/params/NextApp.tsx';
        const dynamicPath = '/params/DynamicComp.tsx';

        const appContent = `
            import dynamic from 'next/dynamic';
            const DynamicComp = dynamic(() => import('./DynamicComp'));
            export const App = () => <DynamicComp />;
        `;
        const dynamicContent = `
            import { Button } from '@vapor-ui/core';
            export default () => <Button />;
        `;

        fsReadFileSyncMockFunction.mockImplementation((path) => {
            if (path === appPath) return appContent;
            if (path === dynamicPath) return dynamicContent;

            return '';
        });

        fsExistsSyncMockFunction.mockImplementation((path) => {
            return path === appPath || path === dynamicPath;
        });

        const usageMap = collectUsages({
            shallow: false,
            pathsMatcher: null,
            queue: [appPath],
        });

        expect(usageMap.has('Button')).toBe(true);
        expect(usageMap.get('Button')).toBe(1);
    });

    it('should resolve path aliases using pathsMatcher', () => {
        const appPath = '/alias-test/App.tsx';
        const componentPath = '/alias-test/components/Button.tsx';

        const appContent = `
            import { MyButton } from '@components/Button';
            export const App = () => <MyButton />;
        `;
        const componentContent = `
            import { Button, Text } from '@vapor-ui/core';
            export const MyButton = () => <><Button /></>;
        `;

        const pathsMatcher = (importPath: string) => {
            if (importPath === '@components/Button') {
                return ['/alias-test/components/Button.tsx'];
            }
            return [];
        };

        fsReadFileSyncMockFunction.mockImplementation((path) => {
            if (path === appPath) return appContent;
            if (path === componentPath) return componentContent;

            return '';
        });

        fsExistsSyncMockFunction.mockImplementation((path) => {
            return path === appPath || path === componentPath;
        });

        const usageMap = collectUsages({
            shallow: false,
            pathsMatcher,
            queue: [appPath],
        });

        expect(usageMap.has('Button')).toBe(true);
        expect(usageMap.get('Button')).toBe(1);

        expect(usageMap.has('Text')).toBe(false);
        expect(usageMap.get('Text')).toBeUndefined();
    });
});
