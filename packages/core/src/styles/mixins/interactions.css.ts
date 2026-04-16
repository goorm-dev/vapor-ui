import { createVar } from '@vanilla-extract/css';
import { calc } from '@vanilla-extract/css-utils';

import { vars } from '../themes.css';
import { componentRecipe } from './layer-style.css';

const ratio = createVar('opacity-ratio');

export const interaction = componentRecipe({
    base: {
        position: 'relative',

        vars: { [ratio]: '0.08' },

        selectors: {
            '&::before': {
                position: 'absolute',
                top: 0,
                left: 0,

                transition: `opacity 150ms ease`,
                opacity: 0,
                border: 'none',
                borderRadius: 'inherit',
                backgroundColor: vars.color.gray[900],
                pointerEvents: 'none',

                width: '100%',
                height: '100%',
                content: '',
            },

            '&:focus': { outline: 'none' },
            '&:focus-visible': { outline: 'none' },
        },
    },

    defaultVariants: {
        scale: 'normal',
        type: 'default',
    },

    variants: {
        scale: {
            normal: {},
            light: { vars: { [ratio]: '0.04' } },
        },

        type: {
            default: {
                selectors: {
                    '&:active::before': { opacity: calc.multiply(ratio, 2) },
                    '&:focus-visible': {
                        outline: `2px solid ${vars.color.foreground.normal[200]}`,
                        outlineOffset: '2px',
                    },
                },

                '@media': {
                    '(hover: hover)': {
                        selectors: {
                            '&:hover::before': { opacity: calc.multiply(ratio, 1) },
                            '&:active::before': { opacity: calc.multiply(ratio, 2) },
                        },
                    },
                },
            },
            form: {
                transition: 'box-shadow 150ms cubic-bezier(.4,0,.2,1)',

                selectors: {
                    '&:focus': { boxShadow: `inset 0 0 0 0.0625rem ${vars.color.border.primary}` },
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
                    '&[data-highlighted]::before': { opacity: 0.08 },
                    '&[data-highlighted]:active::before': { opacity: 0.16 },
                },
            },
        },
    },
});
