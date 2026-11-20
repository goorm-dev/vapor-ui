import { describe, expect, it } from 'vitest';

import {
    generateColorCSS,
    generateCompleteCSS,
    generateRadiusCSS,
    generateScalingCSS,
} from '../src/index';
import type { ColorThemeConfig, CompleteCSSConfig } from '../src/types';

const MOCK_COLOR_CONFIG: ColorThemeConfig = {
    primary: { name: 'mint', hexcode: '#71d378' },
};

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

    it('should value --color-canvas from gray 000 in light and gray 025 in dark', () => {
        const [light, dark] = generateColorCSS(MOCK_COLOR_CONFIG, { format: 'compact' }).split(
            '[data-vapor-theme="dark"]',
        );
        const value = (rule: string, name: string) =>
            rule.match(new RegExp(`--vapor-color-${name}:([^;}]+)`))?.[1];

        expect(value(light, 'canvas')).toMatch(/^#[0-9a-f]{6}$/);
        expect(value(light, 'canvas')).toBe(value(light, 'gray-000'));
        expect(value(dark, 'canvas')).toBe(value(dark, 'gray-025'));
        expect(value(light, 'foreground-onPrimary')).toMatch(
            /^var\(--vapor-color-(white|black)\)$/,
        );
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
