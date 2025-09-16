import { createVar } from '@vanilla-extract/css';
import { calc } from '@vanilla-extract/css-utils';
import { recipe } from '@vanilla-extract/recipes';

import { layerStyle } from '../utils/layer-style.css';
import { vars } from '../vars.css';

const ratio = createVar('opacity-ratio');

export const interaction = recipe({
    base: layerStyle('components', {
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
                backgroundColor: vars.color['black'],
                pointerEvents: 'none',

                width: '100%',
                height: '100%',
                content: '',
            },

            '&:focus': { outline: 'none' },
            '&:focus-visible': { outline: 'none' },
        },
    }),

    defaultVariants: {
        scale: 'normal',
        type: 'default',
    },

    variants: {
        scale: {
            normal: {},
            light: layerStyle('components', { vars: { [ratio]: '0.04' } }),
        },

        type: {
            default: layerStyle('components', {
                selectors: {
                    '&:active::before': { opacity: calc.multiply(ratio, 2) },
                    '&:focus-visible': {
                        boxShadow: `0 0 0 2px hsl(0, 0%, 100%), 0 0 0 4px ${vars.color.foreground.normal}`,
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
            }),
            form: layerStyle('components', {
                transition: 'border-color 150ms cubic-bezier(.4,0,.2,1)',

                selectors: {
                    '&:focus': { borderColor: vars.color.border.primary },
                },

                '@media': {
                    '(hover: hover)': {
                        selectors: {
                            '&:hover:not(:focus)': { borderColor: `rgba(0,0,0, 0.24)` },
                        },
                    },
                },
            }),
            roving: {
                selectors: {
                    '&[data-highlighted]::before': { opacity: 0.08 },
                    '&[data-highlighted]:active::before': { opacity: 0.16 },
                },
            },
        },
    },
});
