import { calc } from '@vanilla-extract/css-utils';
import { createRainbowSprinkles, defineProperties } from 'rainbow-sprinkles';

import { vars } from './contract.css';
import { layers } from './layers.css';

const spaceTokens = vars.size.space;
type SpaceKey = keyof typeof spaceTokens;

const negativeSpaces = Object.keys(spaceTokens).reduce(
    (acc, key) => {
        const spaceKey = key as SpaceKey;
        const negativeKey = `-${key}` as `-${SpaceKey}`;

        return {
            ...acc,
            [negativeKey]: `${calc(spaceTokens[spaceKey]).negate()}`,
        };
    },
    {} as Record<`-${SpaceKey}`, string>,
);

const marginTokens = { ...spaceTokens, ...negativeSpaces };
const dimensionTokens = vars.size.dimension;
const radiusTokens = vars.size.borderRadius;
const { foreground, black, white, logo, ...colors } = vars.color;

// function overload #1
function spreadColorTokens<ColorTokens extends Record<string, string>>(
    colorTokens: ColorTokens,
    colorName: '',
): Record<keyof ColorTokens & string, string>;

// function overload #2
function spreadColorTokens<ColorTokens extends Record<string, string>, ColorName extends string>(
    colorTokens: ColorTokens,
    colorName: ColorName,
): Record<`${ColorName}-${keyof ColorTokens & string}`, string>;

// function implementation
function spreadColorTokens<ColorTokens extends Record<string, string>, ColorName extends string>(
    colorTokens: ColorTokens,
    colorName: ColorName,
): Record<string, string> {
    return Object.entries(colorTokens).reduce(
        (acc, [shade, value]) => {
            const key = colorName ? `${colorName}-${shade}` : shade;
            acc[key] = value;
            return acc;
        },
        {} as Record<string, string>,
    );
}

const colorTokens = {
    ...spreadColorTokens(colors.background, ''),
    ...spreadColorTokens(colors.blue, 'blue'),
    ...spreadColorTokens(colors.cyan, 'cyan'),
    ...spreadColorTokens(colors.grape, 'grape'),
    ...spreadColorTokens(colors.gray, 'gray'),
    ...spreadColorTokens(colors.green, 'green'),
    ...spreadColorTokens(colors.lime, 'lime'),
    ...spreadColorTokens(colors.orange, 'orange'),
    ...spreadColorTokens(colors.pink, 'pink'),
    ...spreadColorTokens(colors.red, 'red'),
    ...spreadColorTokens(colors.violet, 'violet'),
    ...spreadColorTokens(colors.yellow, 'yellow'),
    black,
    white,
};

const sprinkleProperties = defineProperties({
    '@layer': layers.utilities,

    dynamicProperties: {
        // Layout
        position: true,
        display: true,

        // Flexbox
        alignItems: true,
        justifyContent: true,
        flexDirection: true,
        gap: spaceTokens,

        // Spacing
        padding: spaceTokens,
        paddingTop: spaceTokens,
        paddingBottom: spaceTokens,
        paddingLeft: spaceTokens,
        paddingRight: spaceTokens,
        margin: marginTokens,
        marginTop: marginTokens,
        marginBottom: marginTokens,
        marginLeft: marginTokens,
        marginRight: marginTokens,

        // Dimensions
        width: dimensionTokens,
        height: dimensionTokens,
        minWidth: dimensionTokens,
        minHeight: dimensionTokens,
        maxWidth: dimensionTokens,
        maxHeight: dimensionTokens,

        // Visual
        border: true,
        borderRadius: radiusTokens,
        backgroundColor: colorTokens,
        color: colorTokens,
        opacity: true,

        // Behavior
        pointerEvents: true,
        overflow: true,
        textAlign: true,
    },

    shorthands: {
        paddingX: ['paddingLeft', 'paddingRight'],
        paddingY: ['paddingTop', 'paddingBottom'],
        marginX: ['marginLeft', 'marginRight'],
        marginY: ['marginTop', 'marginBottom'],
    },
});

export const sprinkles = createRainbowSprinkles(sprinkleProperties);

/**
 * Maps semantic property names to actual CSS properties
 * This allows for more intuitive prop names in components
 */
export const customPropertyMap = {
    foreground: 'color',
    background: 'backgroundColor',
} as const;

type BaseSprinkleProps = Parameters<typeof sprinkles>[0];
type CustomProperties = typeof customPropertyMap;
type MappedPropertyKeys = CustomProperties[keyof CustomProperties];

/**
 * Enhanced sprinkles type that includes custom semantic properties
 * while excluding the original mapped properties to avoid conflicts
 */
export type Sprinkles = Omit<BaseSprinkleProps, MappedPropertyKeys> & {
    [K in keyof CustomProperties]?: BaseSprinkleProps[CustomProperties[K]];
};
