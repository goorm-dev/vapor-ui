import { globalStyle } from '@vanilla-extract/css';

import {
    BORDER_RADIUS,
    FONT_FAMILY,
    FONT_SIZE,
    FONT_WEIGHT,
    LETTER_SPACING,
    LIGHT_BASIC_COLORS,
    LIGHT_SEMANTIC_COLORS,
    LINE_HEIGHT,
    SPACE,
} from './tokens';
import { vars } from './vars.css';

/**
 * Define the theme variable namespace supported by Tailwind CSS as a type.
 * @see https://tailwindcss.com/docs/theme#theme-variable-namespaces
 */
type TailwindThemeNamespace =
    | 'color'
    | 'spacing'
    | 'radius'
    | 'font'
    | 'text'
    | 'font-weight'
    | 'leading'
    | 'tracking';

/* -------------------------------------------------------------------------------------------------
 * @theme layer
 * -----------------------------------------------------------------------------------------------*/

// Basic Tokens - Colors
const colorThemeMap = Object.entries(LIGHT_BASIC_COLORS).reduce<Record<string, string>>(
    (acc, [colorName, colorScale]) => {
        const contractColorGroup = vars.color[colorName as keyof typeof LIGHT_BASIC_COLORS];

        if (typeof colorScale === 'object' && colorScale !== null && contractColorGroup) {
            for (const shade in colorScale) {
                if (Object.prototype.hasOwnProperty.call(colorScale, shade)) {
                    const transformedShade = shade.replace(/^0+/, '') || '0';
                    const targetVarName = `--color-v-${colorName}-${transformedShade}`;
                    const sourceVar = (contractColorGroup as Record<string, string>)[shade];
                    acc[targetVarName] = String(sourceVar);
                }
            }
        } else {
            const targetVarName = `--color-v-${colorName}`;
            acc[targetVarName] = String(contractColorGroup);
        }
        return acc;
    },
    {},
);

// Basic Tokens - Size, Typography
const themeMappings: {
    namespace: TailwindThemeNamespace;
    tokenObject: Record<string, unknown>;
    contractBranch: Record<string, string>;
    keyTransformer?: (key: string) => string;
}[] = [
    { namespace: 'spacing', tokenObject: SPACE, contractBranch: vars.size.space },
    { namespace: 'radius', tokenObject: BORDER_RADIUS, contractBranch: vars.size.borderRadius },
    {
        namespace: 'font',
        tokenObject: FONT_FAMILY,
        contractBranch: vars.typography.fontFamily,
        keyTransformer: (k) => k,
    },
    {
        namespace: 'text',
        tokenObject: FONT_SIZE,
        contractBranch: vars.typography.fontSize,
        keyTransformer: (k) => k.replace(/^0+/, ''),
    },
    {
        namespace: 'font-weight',
        tokenObject: FONT_WEIGHT,
        contractBranch: vars.typography.fontWeight,
        keyTransformer: (k) => k,
    },
    {
        namespace: 'leading',
        tokenObject: LINE_HEIGHT,
        contractBranch: vars.typography.lineHeight,
        keyTransformer: (k) => k.replace(/^0+/, ''),
    },
    {
        namespace: 'tracking',
        tokenObject: LETTER_SPACING,
        contractBranch: vars.typography.letterSpacing,
    },
];
const otherThemeMaps = themeMappings.reduce<Record<string, string>>(
    (acc, { namespace, tokenObject, contractBranch, keyTransformer }) => {
        const defaultTransformer = (key: string) => key.replace(/^0+/, '') || '0';
        const transformer = keyTransformer || defaultTransformer;

        for (const key in tokenObject) {
            if (Object.prototype.hasOwnProperty.call(tokenObject, key)) {
                const transformedKey = transformer(key);
                const newKey = `--${namespace}-v-${transformedKey}`;
                acc[newKey] = String(contractBranch[key]);
            }
        }
        return acc;
    },
    {},
);

globalStyle('@theme', {
    ...colorThemeMap,
    ...otherThemeMaps,
});
/* -------------------------------------------------------------------------------------------------
 * @utility layer
 * -----------------------------------------------------------------------------------------------*/
const semanticMappings = [
    {
        prefix: 'bg',
        property: 'backgroundColor',
        contractGroup: 'background',
        tokenGroup: LIGHT_SEMANTIC_COLORS.background,
    },
    {
        prefix: 'text',
        property: 'color',
        contractGroup: 'foreground',
        tokenGroup: LIGHT_SEMANTIC_COLORS.foreground,
    },
    {
        prefix: 'border',
        property: 'borderColor',
        contractGroup: 'border',
        tokenGroup: LIGHT_SEMANTIC_COLORS.border,
    },
] as const;

semanticMappings.forEach(({ prefix, property, contractGroup, tokenGroup }) => {
    const contractSemanticGroup = vars.color[contractGroup];
    for (const name in tokenGroup) {
        if (Object.prototype.hasOwnProperty.call(tokenGroup, name)) {
            const tokenValue = (tokenGroup as Record<string, unknown>)[name];
            const contractValue = (contractSemanticGroup as Record<string, unknown>)[name];

            // Handle nested color variants (100, 200)
            if (
                typeof tokenValue === 'object' &&
                tokenValue !== null &&
                typeof contractValue === 'object' &&
                contractValue !== null
            ) {
                for (const variant in tokenValue) {
                    if (Object.prototype.hasOwnProperty.call(tokenValue, variant)) {
                        globalStyle(`@utility ${prefix}-v-${name}-${variant}`, {
                            [property]: (contractValue as Record<string, string>)[variant],
                        });
                    }
                }
            } else {
                // Handle single value colors (canvas, etc.)
                globalStyle(`@utility ${prefix}-v-${name}`, {
                    [property]: contractValue as string,
                });
            }
        }
    }
});

globalStyle('@utility text-v-logo', {
    color: vars.color.logo.normal,
});
