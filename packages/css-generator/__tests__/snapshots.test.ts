import type { SemanticMappingConfig } from '@vapor-ui/color-generator';
import { describe, expect, it } from 'vitest';

import {
    generateColorCSS,
    generateCompleteCSS,
    generateRadiusCSS,
    generateScalingCSS,
} from '../src/index';
import type { CompleteCSSConfig } from '../src/types';

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
} satisfies SemanticMappingConfig;

const MOCK_TOTAL_CONFIG: CompleteCSSConfig = {
    colors: MOCK_COLOR_CONFIG,
    scaling: 1.15,
    radius: 'lg',
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
        });
        expect(result).toMatchSnapshot();
    });

    /* -------------------------------------------------------------------------------------------------
     * Radius CSS
     * -----------------------------------------------------------------------------------------------*/
    it('should match generateRadiusCSS snapshot', () => {
        const result = generateRadiusCSS('full');
        expect(result).toMatchSnapshot();
    });

    it('should match generateRadiusCSS with options snapshot', () => {
        const result = generateRadiusCSS('sm', {
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
