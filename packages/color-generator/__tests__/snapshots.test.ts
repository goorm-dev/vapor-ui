import { describe, expect, it } from 'vitest';

import { generateBrandColorPalette, generateSystemColorPalette } from '../src/generators';
import { generatePrimitiveColorPalette, getSemanticDependentTokens } from '../src/infrastructure';

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
        // First generate primitive palettes
        const primitiveResult = generatePrimitiveColorPalette({
            brandColor: { name: 'mint', hexcode: '#44ebd3' },
        });

        // Then generate semantic tokens from primitives
        const semanticDependentTokens = getSemanticDependentTokens(primitiveResult, 'mint');
        expect(semanticDependentTokens).toMatchSnapshot();
    });
});
