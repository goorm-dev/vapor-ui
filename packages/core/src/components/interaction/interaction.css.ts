import { createGlobalVar } from '@vanilla-extract/css';
import { calc } from '@vanilla-extract/css-utils';
import type { RecipeVariants } from '@vanilla-extract/recipes';

import { componentRecipe, componentStyle } from '~/styles/mixins/layer-style.css';
import { vars } from '~/styles/themes.css';

const variables = {
    ratio: createGlobalVar('ratio'),
    opacity: createGlobalVar('overlay-opacity'),
};

export const overlay = componentStyle({
    position: 'absolute',
    top: 0,
    left: 0,
    transition: 'opacity 150ms ease',
    opacity: variables.opacity,
    border: 'none',
    borderRadius: 'inherit',
    backgroundColor: vars.color.gray[900],
    pointerEvents: 'none',
    width: '100%',
    height: '100%',
});

export const root = componentRecipe({
    base: {
        position: 'relative',
        selectors: {
            '&:focus': { outline: 'none' },
            '&:focus-visible': { outline: 'none' },
        },
        vars: {
            [variables.ratio]: '0.08',
            [variables.opacity]: '0',
        },
    },
    defaultVariants: { scale: 'normal', type: 'default' },
    variants: {
        scale: {
            normal: {},
            light: { vars: { [variables.ratio]: '0.04' } },
        },
        type: {
            default: {
                selectors: {
                    '&:active': {
                        vars: { [variables.opacity]: calc.multiply(variables.ratio, 2) },
                    },
                    '&:focus-visible': {
                        outline: `2px solid ${vars.color.foreground.normal[200]}`,
                        outlineOffset: '2px',
                    },
                },
                '@media': {
                    '(hover: hover)': {
                        selectors: {
                            '&:hover': { vars: { [variables.opacity]: variables.ratio } },
                            '&:active': {
                                vars: { [variables.opacity]: calc.multiply(variables.ratio, 2) },
                            },
                        },
                    },
                },
            },
            form: {
                transition: 'box-shadow 150ms cubic-bezier(.4,0,.2,1)',
                selectors: {
                    '&:focus': {
                        boxShadow: `inset 0 0 0 0.0625rem ${vars.color.border.primary}`,
                    },
                },
                '@media': {
                    '(hover: hover)': {
                        selectors: {
                            '&:hover:not(:focus)': {
                                boxShadow: `inset 0 0 0 0.0625rem color-mix(in srgb, ${vars.color.gray[900]} 32%, transparent)`,
                            },
                        },
                    },
                },
            },
            roving: {
                selectors: {
                    '&[data-highlighted]': { vars: { [variables.opacity]: '0.08' } },
                    '&[data-highlighted]:active': { vars: { [variables.opacity]: '0.16' } },
                },
            },
        },
    },
});

export type InteractionVariants = NonNullable<RecipeVariants<typeof root>>;
