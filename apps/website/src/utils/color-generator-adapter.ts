import {
    generatePrimitiveColorPalette,
    getSemanticDependentTokens,
} from '@vapor-ui/color-generator';

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
    const result = generatePrimitiveColorPalette();
    const colorGroups: ColorGroup[] = [];

    for (const colorName of COLOR_ORDER) {
        const palette = result.lightModeTokens.palettes.find((p) => p.name === colorName);

        if (palette) {
            const shades: ColorShadeItem[] = Object.entries(palette.chips)
                .sort(([shadeA], [shadeB]) => parseInt(shadeA, 10) - parseInt(shadeB, 10))
                .map(([shade, chip]) => ({
                    name: `--vapor-color-${colorName}-${shade}`,
                    value: chip.hex,
                }));

            colorGroups.push({
                title: colorName,
                colorShade: shades,
            });
        }
    }

    const whiteChip = result.baseTokens['color-white'];

    if (whiteChip) {
        colorGroups.push({
            title: 'white',
            colorShade: [
                {
                    name: '--vapor-color-white',
                    value: whiteChip.hex,
                },
            ],
        });
    }

    const blackChip = result.baseTokens['color-black'];

    if (blackChip) {
        colorGroups.push({
            title: 'black',
            colorShade: [
                {
                    name: '--vapor-color-black',
                    value: blackChip.hex,
                },
            ],
        });
    }

    return colorGroups;
}

export function transformSemanticTokensToSemanticColorData(): SemanticColorData {
    const primitiveResult = generatePrimitiveColorPalette();

    const semanticTokens = getSemanticDependentTokens(primitiveResult, 'blue', 'gray');

    const categoryMap = new Map<string, ColorShadeItem[]>();

    for (const [tokenName, hexValue] of Object.entries(semanticTokens.lightModeTokens)) {
        const parts = tokenName.split('-');

        if (parts[0] === 'color' && parts.length >= 2) {
            const category = parts[1];
            const cssVarName = `--vapor-${tokenName}`;

            if (!categoryMap.has(category)) {
                categoryMap.set(category, []);
            }

            categoryMap.get(category)!.push({
                name: cssVarName,
                value: hexValue,
            });
        }
    }

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
