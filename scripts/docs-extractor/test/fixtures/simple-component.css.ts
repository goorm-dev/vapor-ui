// @ts-nocheck
import { recipe } from '@vanilla-extract/recipes';

export const root = recipe({
    base: {
        display: 'inline-flex',
        alignItems: 'center',
    },
    defaultVariants: { colorPalette: 'primary', size: 'md', variant: 'fill' },
    variants: {
        colorPalette: {
            primary: {},
            secondary: {},
        },
        size: {
            sm: {},
            md: {},
            lg: {},
        },
        variant: {
            fill: {},
            outline: {},
            ghost: {},
        },
    },
});
