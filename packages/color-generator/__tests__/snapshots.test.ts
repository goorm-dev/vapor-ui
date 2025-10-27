// snapshots.test.ts
import { describe, expect, it } from 'vitest';

import {
    generateBrandColorPalette,
    generateSystemColorPalette,
    getSemanticDependentTokens,
} from '../src/index';

const testBackground = {
    name: 'myGray',
    color: '#EFEAE6',
    lightness: {
        light: 93,
        dark: 10,
    },
};

describe('Color Generator Snapshots', () => {
    it('should match systemColorPalette snapshot', () => {
        const systemColorPalette = generateSystemColorPalette();
        expect(systemColorPalette).toMatchSnapshot();
    });

    it('should match brandColorPalette snapshot', () => {
        const brandColorPalette = generateBrandColorPalette({
            colors: {
                mint: '#44ebd3',
            },
            background: testBackground,
        });
        expect(brandColorPalette).toMatchSnapshot();
    });

    describe('getSemanticDependentTokens', () => {
        // 요구사항 1: Light 050 / Dark 900
        it('should match snapshot for primary (L:050 / D:900)', () => {
            const semanticDependentTokens = getSemanticDependentTokens({
                primary: { name: 'lightGreen', color: '#ecf4ec' },
                background: testBackground,
            });
            expect(semanticDependentTokens).toMatchSnapshot();
        });

        // 요구사항 2: Light 100 / Dark 800
        it('should match snapshot for primary (L:100 / D:800)', () => {
            const semanticDependentTokens = getSemanticDependentTokens({
                primary: { name: 'mint', color: '#44ebd3' },
                background: testBackground,
            });
            expect(semanticDependentTokens).toMatchSnapshot();
        });

        // 요구사항 3: Light 800 / Dark 100
        it('should match snapshot for primary (L:800 / D:100)', () => {
            const semanticDependentTokens = getSemanticDependentTokens({
                primary: { name: 'darkGreen', color: '#0e3532' },
                background: testBackground,
            });
            expect(semanticDependentTokens).toMatchSnapshot();
        });

        // 요구사항 4: Light 900 / Dark 050
        it('should match snapshot for primary (L:900 / D:050)', () => {
            const semanticDependentTokens = getSemanticDependentTokens({
                primary: { name: 'darkestGreen', color: '#092523' },
                background: testBackground,
            });
            expect(semanticDependentTokens).toMatchSnapshot();
        });
    });
});
