import { keyframes } from '@vanilla-extract/css';
import { calc } from '@vanilla-extract/css-utils';

import { componentRecipe, componentStyle } from '~/styles/mixins/layer-style.css';
import { vars } from '~/styles/themes.css';

export const root = componentRecipe({
    base: {
        display: 'inline-flex',
        flexShrink: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },

    defaultVariants: { size: 'md' },
    variants: {
        /**
         * Controls the overall dimensions of the spinner.
         * @default 'md'
         */
        size: {
            md: { width: vars.size.dimension[200], height: vars.size.dimension[200] },
            lg: { width: vars.size.dimension[250], height: vars.size.dimension[250] },
            xl: { width: vars.size.dimension[300], height: vars.size.dimension[300] },
        },
    },
});

const rotate = keyframes({
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' },
});

const { size: rootSize } = root.classNames.variants;

export const icon = componentStyle({
    width: '100%',
    height: '100%',
    animation: `1.8s linear 0s infinite forwards ${rotate}`,

    selectors: {
        [`${rootSize.md} > &`]: { strokeWidth: 2 },
        [`${rootSize.lg} > &`]: { strokeWidth: 2.5 },
        [`${rootSize.xl} > &`]: { strokeWidth: 3 },
    },
});

const running = keyframes({
    '0%': { strokeDashoffset: '80' },
    '50%': { transform: 'rotate(108deg)', strokeDashoffset: '0' },
    '100%': { transform: 'rotate(360deg)', strokeDashoffset: '80' },
});

export const indicator = componentRecipe({
    base: [
        {
            cx: '50%',
            cy: '50%',
            r: calc.subtract('50%', '2px'),
            strokeLinecap: 'round',
            fill: 'none',
            strokeDashoffset: '0',
            strokeDasharray: '80 100',
            animation: `1.7s cubic-bezier(0.43, 0.14, 0.39, 0.76) 0s infinite forwards ${running}`,
            transformOrigin: 'center',
        },
    ],

    defaultVariants: { colorPalette: 'primary' },
    variants: {
        /**
         * Controls the stroke color of the spinning arc. Use `inverse` when placing the spinner on a colored or filled background; the stroke color will inherit from the parent element's `color` property.
         * @default 'primary'
         */
        colorPalette: {
            primary: { stroke: vars.color.background.primary[200] },
            inverse: { stroke: 'currentColor' },
        },
    },
});

type IconVariants = NonNullable<Parameters<typeof root>[0]>;
type IndicatorVariants = NonNullable<Parameters<typeof indicator>[0]>;
export type SpinnerVariants = IconVariants & IndicatorVariants;
