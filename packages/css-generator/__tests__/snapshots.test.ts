import { describe, expect, it } from 'vitest';

import {
    generateColorCSS,
    generateCompleteCSS,
    generateRadiusCSS,
    generateScalingCSS,
} from '../src/index';

const MOCK_COLOR_CONFIG = {
    primary: { name: 'mint', color: '#6af574ff' },
    background: {
        name: 'neutral',
        color: '#F8FAFC',
        lightness: {
            light: 98,
            dark: 8,
        },
    },
};

const MOCK_TOTAL_CONFIG = {
    colors: MOCK_COLOR_CONFIG,
    scaling: 1.15,
    radius: 8,
};

describe('CSS Generator Snapshots', () => {
    /* -------------------------------------------------------------------------------------------------
     * Color CSS
     * -----------------------------------------------------------------------------------------------*/
    it('should match generateColorCSS snapshot', () => {
        const result = generateColorCSS(MOCK_COLOR_CONFIG);
        expect(result).toMatchSnapshot();
    });

    it('should match generateColorCSS with options snapshot', () => {
        const result = generateColorCSS(MOCK_COLOR_CONFIG, {
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
        const result = generateCompleteCSS(MOCK_TOTAL_CONFIG);
        expect(result).toMatchSnapshot();
    });

    it('should match generateCompleteCSS with options snapshot', () => {
        const result = generateCompleteCSS(MOCK_TOTAL_CONFIG, {
            includeColorComments: true,
            prefix: 'custom',
            format: 'compact',
        });
        expect(result).toMatchSnapshot();
    });
});
