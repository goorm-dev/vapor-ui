import { generateBrandColorPalette, getSemanticDependentTokens } from '@vapor-ui/color-generator';
import { describe, expect, it } from 'vitest';

import {
    generateColorCSS,
    generateCompleteCSS,
    generateRadiusCSS,
    generateScalingCSS,
} from '../src/index';

const TEST_COLOR_CONFIG = {
    colors: {
        primary: '#acc7f8ff',
    },
    background: {
        name: 'neutral',
        color: '#F8FAFC',
        lightness: {
            light: 98,
            dark: 8,
        },
    },
};

const getSemanticConfig = () => ({
    primary: { name: 'primary', hex: TEST_COLOR_CONFIG.colors.primary },
    background: TEST_COLOR_CONFIG.background,
});

const getCompleteConfig = () => ({
    colors: {
        primary: { name: 'primary', hex: TEST_COLOR_CONFIG.colors.primary },
        background: {
            name: TEST_COLOR_CONFIG.background.name,
            hex: TEST_COLOR_CONFIG.background.color,
            lightness: TEST_COLOR_CONFIG.background.lightness,
        },
    },
    scaling: 1.15,
    radius: 8,
});

describe('CSS Generator Snapshots', () => {
    /* -------------------------------------------------------------------------------------------------
     * Color CSS
     * -----------------------------------------------------------------------------------------------*/
    it('should match generateColorCSS snapshot', () => {
        const brandPalette = generateBrandColorPalette(TEST_COLOR_CONFIG);
        const semanticTokens = getSemanticDependentTokens(getSemanticConfig());

        const result = generateColorCSS(brandPalette, semanticTokens);
        expect(result).toMatchSnapshot();
    });

    it('should match generateColorCSS with options snapshot', () => {
        const brandPalette = generateBrandColorPalette(TEST_COLOR_CONFIG);
        const semanticTokens = getSemanticDependentTokens(getSemanticConfig());

        const result = generateColorCSS(brandPalette, semanticTokens, {
            prefix: 'custom',
            format: 'compact',
            classNames: {
                light: 'light-mode',
                dark: 'dark-mode',
            },
        });
        expect(result).toMatchSnapshot();
    });

    /* -------------------------------------------------------------------------------------------------
     * Radius CSS
     * -----------------------------------------------------------------------------------------------*/
    it('should match generateRadiusCSS snapshot', () => {
        const result = generateRadiusCSS(8);
        expect(result).toMatchSnapshot();
    });

    it('should match generateRadiusCSS with options snapshot', () => {
        const result = generateRadiusCSS(12, {
            prefix: 'custom',
            format: 'compact',
        });
        expect(result).toMatchSnapshot();
    });

    /* -------------------------------------------------------------------------------------------------
     * Scaling CSS
     * -----------------------------------------------------------------------------------------------*/

    it('should match generateScalingCSS snapshot', () => {
        const result = generateScalingCSS(1.15);
        expect(result).toMatchSnapshot();
    });

    it('should match generateScalingCSS with options snapshot', () => {
        const result = generateScalingCSS(1.25, {
            prefix: 'custom',
            format: 'compact',
        });
        expect(result).toMatchSnapshot();
    });

    /* -------------------------------------------------------------------------------------------------
     * Complete CSS
     * -----------------------------------------------------------------------------------------------*/

    it('should match generateCompleteCSS snapshot', () => {
        const brandPalette = generateBrandColorPalette(TEST_COLOR_CONFIG);
        const semanticTokens = getSemanticDependentTokens(getSemanticConfig());

        const result = generateCompleteCSS(brandPalette, semanticTokens, getCompleteConfig());
        expect(result).toMatchSnapshot();
    });

    it('should match generateCompleteCSS with options snapshot', () => {
        const brandPalette = generateBrandColorPalette(TEST_COLOR_CONFIG);
        const semanticTokens = getSemanticDependentTokens(getSemanticConfig());

        const result = generateCompleteCSS(brandPalette, semanticTokens, getCompleteConfig(), {
            includeColorComments: true,
            prefix: 'custom',
            format: 'compact',
        });
        expect(result).toMatchSnapshot();
    });
});
