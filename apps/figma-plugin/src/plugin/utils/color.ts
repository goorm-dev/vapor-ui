import type { ColorToken } from '@vapor-ui/color-generator';

/* -------------------------------------------------------------------------------------------------
 * Color Conversion
 * -----------------------------------------------------------------------------------------------*/

/**
 * Converts hex color to RGB values
 * @returns { r: 255, g: 0, b: 128 }
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
          }
        : { r: 0, g: 0, b: 0 };
}

/**
 * Converts RGB values to Figma color format (0-1 range)
 * @returns { r: 1.0, g: 0.0, b: 0.5 }
 */
export function rgbToFigmaColor(
    r: number,
    g: number,
    b: number,
): { r: number; g: number; b: number } {
    return {
        r: r / 255,
        g: g / 255,
        b: b / 255,
    };
}

/**
 * Converts hex color directly to Figma color format
 * @returns { r: 0.5, g: 0.5, b: 0.5 }
 */
export function hexToFigmaColor(hex: string): { r: number; g: number; b: number } {
    const { r, g, b } = hexToRgb(hex);
    return rgbToFigmaColor(r, g, b);
}

/* -------------------------------------------------------------------------------------------------
 * Color Name Formatting
 * -----------------------------------------------------------------------------------------------*/

/**
 * Formats family names with capitalized first letter
 * @returns 'Primary', 'Secondary', 'Background'
 */
export function formatFamilyTitle(familyName: string): string {
    return familyName.charAt(0).toUpperCase() + familyName.slice(1);
}

/* -------------------------------------------------------------------------------------------------
 * Color Data Processing
 * -----------------------------------------------------------------------------------------------*/

/**
 * Sorts color shades by numeric value
 * @returns [['050', data], ['100', data], ['200', data]]
 */
export function sortColorShades(shades: Record<string, unknown>): Array<[string, unknown]> {
    return Object.entries(shades).sort(([a], [b]) => {
        const numA = parseInt(a, 10);
        const numB = parseInt(b, 10);
        return numA - numB;
    });
}

/**
 * Filters and sorts valid color shades from color palette
 * @returns [['050', colorToken], ['100', colorToken]]
 */
export function getValidColorShades(colorShades: unknown): [string, ColorToken][] {
    if (typeof colorShades !== 'object' || !colorShades) {
        return [];
    }

    const entries = Object.entries(colorShades).filter(
        ([_, colorToken]) => typeof colorToken === 'object' && colorToken && 'hex' in colorToken,
    ) as [string, ColorToken][];

    return entries.sort(([a], [b]) => {
        const numA = parseInt(a, 10);
        const numB = parseInt(b, 10);
        return numA - numB;
    });
}

/* -------------------------------------------------------------------------------------------------
 * Validation
 * -----------------------------------------------------------------------------------------------*/

/**
 * Validates if string is a valid hex color
 * @returns true for '#ff0000', false for 'invalid'
 */
export function isValidHexColor(hex: string): boolean {
    return /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.test(hex);
}

/**
 * Validates color data object structure
 * @returns true for { hex: '#ff0000' }, false for invalid objects
 */
export function isValidColorData(
    colorData: unknown,
): colorData is { hex: string; oklch?: string; codeSyntax?: string } {
    if (typeof colorData !== 'object' || colorData === null) {
        return false;
    }

    if (!('hex' in colorData) || typeof (colorData as { hex: unknown }).hex !== 'string') {
        return false;
    }

    return isValidHexColor((colorData as { hex: string }).hex);
}
