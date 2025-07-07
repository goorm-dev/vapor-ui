import { createVar } from '@vanilla-extract/css';
import { calc } from '@vanilla-extract/css-utils';
import { recipe } from '@vanilla-extract/recipes';

import { vars } from '../contract.css';
import { layerStyle } from '../utils';

const ratio = createVar('opacity-ratio');

export const interaction = recipe({
    base: layerStyle('component', {
        position: 'relative',

        vars: { [ratio]: '0.08' },

        selectors: {
            '&::before': {
                position: 'absolute',
                top: 0,
                left: 0,

                transition: `opacity 150ms cubic-bezier(.4,0,.2,1)`,
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
            normal: layerStyle('component', { vars: { [ratio]: '0.08' } }),
            light: layerStyle('component', { vars: { [ratio]: '0.04' } }),
        },

        type: {
            default: layerStyle('component', {
                selectors: {
                    '&:hover::before': { opacity: calc.multiply(ratio, 1) },
                    '&:active::before': { opacity: calc.multiply(ratio, 2) },
                    '&:focus-visible': {
                        boxShadow: `0 0 0 2px hsl(0, 0%, 100%), 0 0 0 4px ${vars.color.foreground.normal}`,
                    },
                },
            }),
            form: layerStyle('component', {
                transition: 'border-color 150ms cubic-bezier(.4,0,.2,1)',

                selectors: {
                    '&:hover': { borderColor: `rgba(0,0,0, 0.24)` },
                    '&:focus-visible': { borderColor: vars.color.border.primary },
                },
            }),
        },
    },
});
