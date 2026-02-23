import type { Symbol } from 'ts-morph';
import { describe, expect, it, vi } from 'vitest';

import { isExcludedBaseUiProp, shouldIncludeSymbol } from '~/core/parser/props/filter';

// Mock the declaration-source module
vi.mock('~/core/parser/type/declaration-source', () => ({
    isSymbolFromBaseUi: vi.fn((symbol: Symbol) => {
        const path = (symbol as MockSymbol).__testPath;
        return path?.includes('@base-ui') ?? false;
    }),
    isSymbolFromExternalSource: vi.fn((symbol: Symbol) => {
        const path = (symbol as MockSymbol).__testPath;
        return path?.includes('node_modules') && !path?.includes('@base-ui');
    }),
    isSymbolFromSprinkles: vi.fn((symbol: Symbol) => {
        const path = (symbol as MockSymbol).__testPath;
        return path?.includes('sprinkles.css') ?? false;
    }),
}));

interface MockSymbol extends Symbol {
    __testPath?: string;
}

function createMockSymbol(name: string, filePath?: string): MockSymbol {
    return {
        getName: () => name,
        __testPath: filePath,
    } as MockSymbol;
}

describe('isExcludedBaseUiProp', () => {
    describe('className prop', () => {
        it('should return true when className is from base-ui', () => {
            const symbol = createMockSymbol(
                'className',
                '/node_modules/@base-ui/react/use-render/index.d.ts',
            );
            expect(isExcludedBaseUiProp(symbol)).toBe(true);
        });

        it('should return false when className is from project', () => {
            const symbol = createMockSymbol('className', '/project/src/button.tsx');
            expect(isExcludedBaseUiProp(symbol)).toBe(false);
        });
    });

    describe('render prop', () => {
        it('should return true when render is from base-ui', () => {
            const symbol = createMockSymbol(
                'render',
                '/node_modules/@base-ui/react/use-render/index.d.ts',
            );
            expect(isExcludedBaseUiProp(symbol)).toBe(true);
        });

        it('should return false when render is from project', () => {
            const symbol = createMockSymbol('render', '/project/src/button.tsx');
            expect(isExcludedBaseUiProp(symbol)).toBe(false);
        });
    });

    describe('other props', () => {
        it('should return false for variant prop from base-ui', () => {
            const symbol = createMockSymbol(
                'variant',
                '/node_modules/@base-ui/react/button/index.d.ts',
            );
            expect(isExcludedBaseUiProp(symbol)).toBe(false);
        });

        it('should return false for custom props', () => {
            const symbol = createMockSymbol('customProp', '/project/src/button.tsx');
            expect(isExcludedBaseUiProp(symbol)).toBe(false);
        });
    });
});

describe('shouldIncludeSymbol', () => {
    const defaultOptions = {};

    describe('include set override', () => {
        it('should include prop when in include set regardless of source', () => {
            const symbol = createMockSymbol(
                'className',
                '/node_modules/@base-ui/react/use-render/index.d.ts',
            );
            const includeSet = new Set(['className']);

            expect(shouldIncludeSymbol(symbol, defaultOptions, includeSet)).toBe(true);
        });
    });

    describe('base-ui prop filtering', () => {
        it('should exclude className from base-ui', () => {
            const symbol = createMockSymbol(
                'className',
                '/node_modules/@base-ui/react/use-render/index.d.ts',
            );

            expect(shouldIncludeSymbol(symbol, defaultOptions, new Set())).toBe(false);
        });

        it('should exclude render from base-ui', () => {
            const symbol = createMockSymbol(
                'render',
                '/node_modules/@base-ui/react/use-render/index.d.ts',
            );

            expect(shouldIncludeSymbol(symbol, defaultOptions, new Set())).toBe(false);
        });

        it('should include other base-ui props', () => {
            const symbol = createMockSymbol(
                'disabled',
                '/node_modules/@base-ui/react/button/index.d.ts',
            );

            expect(shouldIncludeSymbol(symbol, defaultOptions, new Set())).toBe(true);
        });
    });

    describe('external filtering', () => {
        it('should exclude external props when filterExternal is true', () => {
            const symbol = createMockSymbol('onClick', '/node_modules/@types/react/index.d.ts');

            expect(shouldIncludeSymbol(symbol, { filterExternal: true }, new Set())).toBe(false);
        });

        it('should include external props when filterExternal is false', () => {
            const symbol = createMockSymbol('onClick', '/node_modules/@types/react/index.d.ts');

            expect(shouldIncludeSymbol(symbol, { filterExternal: false }, new Set())).toBe(true);
        });
    });

    describe('sprinkles filtering', () => {
        it('should exclude sprinkles props by default', () => {
            const symbol = createMockSymbol('marginTop', '/project/src/styles/sprinkles.css.ts');

            expect(shouldIncludeSymbol(symbol, defaultOptions, new Set())).toBe(false);
        });

        it('should include sprinkles props when filterSprinkles is false', () => {
            const symbol = createMockSymbol('marginTop', '/project/src/styles/sprinkles.css.ts');

            expect(shouldIncludeSymbol(symbol, { filterSprinkles: false }, new Set())).toBe(true);
        });
    });

    describe('deprecated CSS props filtering', () => {
        it('should exclude $css prop by default', () => {
            const symbol = createMockSymbol('$css', '/project/src/utils/types.ts');

            expect(shouldIncludeSymbol(symbol, defaultOptions, new Set())).toBe(false);
        });

        it('should exclude deprecated margin prop by default', () => {
            const symbol = createMockSymbol('margin', '/project/src/utils/types.ts');

            expect(shouldIncludeSymbol(symbol, defaultOptions, new Set())).toBe(false);
        });

        it('should exclude deprecated padding prop by default', () => {
            const symbol = createMockSymbol('padding', '/project/src/utils/types.ts');

            expect(shouldIncludeSymbol(symbol, defaultOptions, new Set())).toBe(false);
        });

        it('should exclude deprecated display prop by default', () => {
            const symbol = createMockSymbol('display', '/project/src/utils/types.ts');

            expect(shouldIncludeSymbol(symbol, defaultOptions, new Set())).toBe(false);
        });

        it('should include deprecated CSS props when filterSprinkles is false', () => {
            const symbol = createMockSymbol('margin', '/project/src/utils/types.ts');

            expect(shouldIncludeSymbol(symbol, { filterSprinkles: false }, new Set())).toBe(true);
        });

        it('should include $css prop via include set', () => {
            const symbol = createMockSymbol('$css', '/project/src/utils/types.ts');
            const includeSet = new Set(['$css']);

            expect(shouldIncludeSymbol(symbol, defaultOptions, includeSet)).toBe(true);
        });
    });
});
