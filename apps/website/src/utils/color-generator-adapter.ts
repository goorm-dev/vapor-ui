import { BASE_BASIC_COLORS, LIGHT_BASIC_COLORS, LIGHT_SEMANTIC_COLORS } from '@vapor-ui/core';

import type {
    BasicColorData,
    ColorGroup,
    ColorShadeItem,
    ColorSwatchItem,
    SemanticColorData,
} from '../types/color-tokens';

const COLOR_ORDER = [
    'gray',
    'red',
    'pink',
    'grape',
    'violet',
    'blue',
    'cyan',
    'green',
    'lime',
    'yellow',
    'orange',
];

export function transformPrimitivePalettesToBasicColorData(): BasicColorData {
    const colorGroups: ColorGroup[] = [];

    for (const colorName of COLOR_ORDER) {
        const shades = LIGHT_BASIC_COLORS[colorName as keyof typeof LIGHT_BASIC_COLORS];

        if (shades && typeof shades === 'object' && !Array.isArray(shades)) {
            if ('050' in shades || '100' in shades) {
                const colorShadeItems: ColorShadeItem[] = Object.entries(shades)
                    .sort(([shadeA], [shadeB]) => parseInt(shadeA, 10) - parseInt(shadeB, 10))
                    .map(([shade, hex]) => ({
                        name: `--vapor-color-${colorName}-${shade}`,
                        value: hex as string,
                    }));

                colorGroups.push({
                    title: colorName,
                    colorShade: colorShadeItems,
                });
            }
        }
    }

    colorGroups.push({
        title: 'white',
        colorShade: [
            {
                name: '--vapor-color-white',
                value: BASE_BASIC_COLORS.white,
            },
        ],
    });

    colorGroups.push({
        title: 'black',
        colorShade: [
            {
                name: '--vapor-color-black',
                value: BASE_BASIC_COLORS.black,
            },
        ],
    });

    return colorGroups;
}

export function transformSemanticTokensToSemanticColorData(): SemanticColorData {
    const categoryMap = new Map<string, ColorShadeItem[]>();

    function flattenSemanticColors(obj: Record<string, unknown>, prefix = ''): void {
        for (const [key, value] of Object.entries(obj)) {
            const currentPath = prefix ? `${prefix}-${key}` : key;

            if (typeof value === 'string' && value.startsWith('#')) {
                const cssVarName = `--vapor-color-${currentPath}`;
                const category = currentPath.split('-')[0];

                if (!categoryMap.has(category)) {
                    categoryMap.set(category, []);
                }

                categoryMap.get(category)!.push({
                    name: cssVarName,
                    value: value,
                });
            } else if (typeof value === 'object' && value !== null) {
                flattenSemanticColors(value as Record<string, unknown>, currentPath);
            }
        }
    }

    flattenSemanticColors(LIGHT_SEMANTIC_COLORS);

    const semanticGroups: ColorGroup[] = [];
    const categoryOrder = ['background', 'foreground', 'border', 'logo', 'button'];

    for (const category of categoryOrder) {
        const shades = categoryMap.get(category);

        if (shades) {
            semanticGroups.push({
                title: category,
                colorShade: shades,
            });
        }
    }

    for (const [category, shades] of categoryMap.entries()) {
        if (!categoryOrder.includes(category)) {
            semanticGroups.push({
                title: category,
                colorShade: shades,
            });
        }
    }

    return semanticGroups;
}

export function transformToColorSwatchItems(
    colorGroups: ColorGroup[],
    options?: {
        includeValues?: boolean;
        foregroundMap?: Record<string, string>;
    },
): ColorSwatchItem[] {
    const { includeValues = false, foregroundMap = {} } = options || {};

    const colorSwatchItems: ColorSwatchItem[] = [];

    for (const group of colorGroups) {
        for (const shade of group.colorShade) {
            const variableWithoutPrefix = shade.name.replace(/^--vapor-color-/, '');

            const nameParts = variableWithoutPrefix.split('-');
            const displayName = nameParts
                .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                .join(' ');

            const foreground = foregroundMap[variableWithoutPrefix];

            colorSwatchItems.push({
                name: displayName,
                variable: variableWithoutPrefix,
                value: includeValues ? shade.value : undefined,
                foreground,
            });
        }
    }

    return colorSwatchItems;
}
