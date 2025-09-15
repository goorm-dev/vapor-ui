import { describe, expect, it } from 'vitest';

import {
    generateBrandColorPalette,
    generateSystemColorPalette,
    getSemanticDependentTokens,
} from '../src/index';

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
            background: {
                name: 'myGray',
                color: '#EFEAE6',
                lightness: {
                    light: 93,
                    dark: 10,
                },
            },
        });
        expect(brandColorPalette).toMatchSnapshot();
    });

    it('should match semanticDependentTokens snapshot', () => {
        const semanticDependentTokens = getSemanticDependentTokens({
            primary: { name: 'mint', hex: '#44ebd3' },
            background: {
                name: 'myGray',
                color: '#EFEAE6',
                lightness: {
                    light: 93,
                    dark: 10,
                },
            },
        });
        expect(semanticDependentTokens).toMatchSnapshot();
    });
});
