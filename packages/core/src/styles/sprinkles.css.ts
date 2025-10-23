import { calc } from '@vanilla-extract/css-utils';
import { createRainbowSprinkles, defineProperties } from 'rainbow-sprinkles';

import { layers } from './layers.css';
import { vars } from './themes.css';

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

const { foreground, button, border, black, white, logo, ...colors } = vars.color;

const colorTokens = {
    // Background colors
    'primary-100': colors.background.primary[100],
    'primary-200': colors.background.primary[200],
    'secondary-100': colors.background.secondary[100],
    'success-100': colors.background.success[100],
    'success-200': colors.background.success[200],
    'warning-100': colors.background.warning[100],
    'warning-200': colors.background.warning[200],
    'danger-100': colors.background.danger[100],
    'danger-200': colors.background.danger[200],
    'hint-100': colors.background.hint[100],
    'hint-200': colors.background.hint[200],
    'contrast-100': colors.background.contrast[100],
    'contrast-200': colors.background.contrast[200],
    canvas: colors.background.canvas,
    'surface-100': colors.background.surface[100],
    'surface-200': colors.background.surface[200],

    // Blue colors with prefix
    'blue-050': colors.blue['050'],
    'blue-100': colors.blue['100'],
    'blue-200': colors.blue['200'],
    'blue-300': colors.blue['300'],
    'blue-400': colors.blue['400'],
    'blue-500': colors.blue['500'],
    'blue-600': colors.blue['600'],
    'blue-700': colors.blue['700'],
    'blue-800': colors.blue['800'],
    'blue-900': colors.blue['900'],

    // Cyan colors with prefix
    'cyan-050': colors.cyan['050'],
    'cyan-100': colors.cyan['100'],
    'cyan-200': colors.cyan['200'],
    'cyan-300': colors.cyan['300'],
    'cyan-400': colors.cyan['400'],
    'cyan-500': colors.cyan['500'],
    'cyan-600': colors.cyan['600'],
    'cyan-700': colors.cyan['700'],
    'cyan-800': colors.cyan['800'],
    'cyan-900': colors.cyan['900'],

    // Grape colors with prefix
    'grape-050': colors.grape['050'],
    'grape-100': colors.grape['100'],
    'grape-200': colors.grape['200'],
    'grape-300': colors.grape['300'],
    'grape-400': colors.grape['400'],
    'grape-500': colors.grape['500'],
    'grape-600': colors.grape['600'],
    'grape-700': colors.grape['700'],
    'grape-800': colors.grape['800'],
    'grape-900': colors.grape['900'],

    // Gray colors with prefix
    'gray-000': colors.gray['000'],
    'gray-050': colors.gray['050'],
    'gray-100': colors.gray['100'],
    'gray-200': colors.gray['200'],
    'gray-300': colors.gray['300'],
    'gray-400': colors.gray['400'],
    'gray-500': colors.gray['500'],
    'gray-600': colors.gray['600'],
    'gray-700': colors.gray['700'],
    'gray-800': colors.gray['800'],
    'gray-900': colors.gray['900'],
    'gray-950': colors.gray['950'],

    // Green colors with prefix
    'green-050': colors.green['050'],
    'green-100': colors.green['100'],
    'green-200': colors.green['200'],
    'green-300': colors.green['300'],
    'green-400': colors.green['400'],
    'green-500': colors.green['500'],
    'green-600': colors.green['600'],
    'green-700': colors.green['700'],
    'green-800': colors.green['800'],
    'green-900': colors.green['900'],

    // Lime colors with prefix
    'lime-050': colors.lime['050'],
    'lime-100': colors.lime['100'],
    'lime-200': colors.lime['200'],
    'lime-300': colors.lime['300'],
    'lime-400': colors.lime['400'],
    'lime-500': colors.lime['500'],
    'lime-600': colors.lime['600'],
    'lime-700': colors.lime['700'],
    'lime-800': colors.lime['800'],
    'lime-900': colors.lime['900'],

    // Orange colors with prefix
    'orange-050': colors.orange['050'],
    'orange-100': colors.orange['100'],
    'orange-200': colors.orange['200'],
    'orange-300': colors.orange['300'],
    'orange-400': colors.orange['400'],
    'orange-500': colors.orange['500'],
    'orange-600': colors.orange['600'],
    'orange-700': colors.orange['700'],
    'orange-800': colors.orange['800'],
    'orange-900': colors.orange['900'],

    // Pink colors with prefix
    'pink-050': colors.pink['050'],
    'pink-100': colors.pink['100'],
    'pink-200': colors.pink['200'],
    'pink-300': colors.pink['300'],
    'pink-400': colors.pink['400'],
    'pink-500': colors.pink['500'],
    'pink-600': colors.pink['600'],
    'pink-700': colors.pink['700'],
    'pink-800': colors.pink['800'],
    'pink-900': colors.pink['900'],

    // Red colors with prefix
    'red-050': colors.red['050'],
    'red-100': colors.red['100'],
    'red-200': colors.red['200'],
    'red-300': colors.red['300'],
    'red-400': colors.red['400'],
    'red-500': colors.red['500'],
    'red-600': colors.red['600'],
    'red-700': colors.red['700'],
    'red-800': colors.red['800'],
    'red-900': colors.red['900'],

    // Violet colors with prefix
    'violet-050': colors.violet['050'],
    'violet-100': colors.violet['100'],
    'violet-200': colors.violet['200'],
    'violet-300': colors.violet['300'],
    'violet-400': colors.violet['400'],
    'violet-500': colors.violet['500'],
    'violet-600': colors.violet['600'],
    'violet-700': colors.violet['700'],
    'violet-800': colors.violet['800'],
    'violet-900': colors.violet['900'],

    // Yellow colors with prefix
    'yellow-050': colors.yellow['050'],
    'yellow-100': colors.yellow['100'],
    'yellow-200': colors.yellow['200'],
    'yellow-300': colors.yellow['300'],
    'yellow-400': colors.yellow['400'],
    'yellow-500': colors.yellow['500'],
    'yellow-600': colors.yellow['600'],
    'yellow-700': colors.yellow['700'],
    'yellow-800': colors.yellow['800'],
    'yellow-900': colors.yellow['900'],

    // Base colors
    black,
    white,
};

const textColorTokens = {
    'primary-100': foreground.primary[100],
    'primary-200': foreground.primary[200],
    'secondary-100': foreground.secondary[100],
    'secondary-200': foreground.secondary[200],
    'success-100': foreground.success[100],
    'success-200': foreground.success[200],
    'warning-100': foreground.warning[100],
    'warning-200': foreground.warning[200],
    'danger-100': foreground.danger[100],
    'danger-200': foreground.danger[200],
    'hint-100': foreground.hint[100],
    'hint-200': foreground.hint[200],
    'contrast-100': foreground.contrast[100],
    'contrast-200': foreground.contrast[200],
    'normal-100': foreground.normal[100],
    'normal-200': foreground.normal[200],
    'button-primary': button.foreground.primary,
};

const borderColorTokens = {
    primary: border.primary,
    secondary: border.secondary,
    success: border.success,
    warning: border.warning,
    danger: border.danger,
    contrast: border.contrast,
    hint: border.hint,
    normal: border.normal,
};

const sprinkleProperties = defineProperties({
    '@layer': layers.utilities,

    defaultCondition: 'desktop',
    conditions: {
        mobile: {
            '@media': `screen and (max-width: 767px)`,
            // '@media': `screen and (max-width: env(--mobile))`,
        },
        tablet: {
            '@media': `screen and (max-width: 1024px)`,
            // '@media': `screen and (max-width: env(--tablet))`,
        },
        desktop: {},
    },

    dynamicProperties: {
        // Layout
        position: true,
        display: true,

        // Flexbox
        alignItems: true,
        justifyContent: true,
        flexDirection: true,
        gap: spaceTokens,

        // Alignment
        alignContent: true,

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
        borderColor: borderColorTokens,
        borderRadius: radiusTokens,
        backgroundColor: colorTokens,
        color: textColorTokens,
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
export type Sprinkles = Omit<Parameters<typeof sprinkles>[0], 'color'> & {
    textColor?: `$${keyof typeof textColorTokens}`;
};
