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
                myBlue: '#6b63ffff',
            },
        });
        expect(brandColorPalette).toMatchSnapshot();
    });

    it('should match semanticDependentTokens snapshot', () => {
        const semanticDependentTokens = getSemanticDependentTokens({
            primary: { name: 'myBlue', hex: '#6b63ffff' },
            secondary: { name: 'myRed', hex: '#cf67c8ff' },
        });
        expect(semanticDependentTokens).toMatchSnapshot();
    });
});
